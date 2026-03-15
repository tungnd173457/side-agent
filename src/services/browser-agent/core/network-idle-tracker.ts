// Browser Agent - Network Idle Tracker
// Monitors chrome.webRequest events to detect when network activity has settled.
// Used by waitForPageStable() to know when data fetching is complete.

// ============================================================
// Noise Filters
// ============================================================

/** URL patterns to ignore (analytics, ads, tracking) */
const NOISE_URL_PATTERNS = [
    'google-analytics.com',
    'googletagmanager.com',
    'doubleclick.net',
    'facebook.com/tr',
    'connect.facebook.net',
    'bat.bing.com',
    'hotjar.com',
    'mixpanel.com',
    'segment.io',
    'segment.com',
    'sentry.io',
    'newrelic.com',
    'nr-data.net',
    'clarity.ms',
    'plausible.io',
    'amplitude.com',
];

/** Resource types to track (meaningful content requests) */
const TRACKED_RESOURCE_TYPES: chrome.webRequest.ResourceType[] = [
    'main_frame',
    'sub_frame',
    'script',
    'xmlhttprequest',
];

function isNoiseUrl(url: string): boolean {
    return NOISE_URL_PATTERNS.some(pattern => url.includes(pattern));
}

// ============================================================
// NetworkIdleTracker
// ============================================================

export class NetworkIdleTracker {
    private pendingRequests = new Map<string, number>(); // requestId → timestamp
    private tabId: number | null = null;

    // Bound listener references for cleanup
    private onBeforeRequestListener: ((details: chrome.webRequest.WebRequestBodyDetails) => void) | null = null;
    private onCompletedListener: ((details: chrome.webRequest.WebResponseCacheDetails) => void) | null = null;
    private onErrorListener: ((details: chrome.webRequest.WebResponseErrorDetails) => void) | null = null;

    /**
     * Start tracking network requests for a specific tab.
     */
    start(tabId: number): void {
        this.stop(); // Clean up any previous tracking
        this.tabId = tabId;
        this.pendingRequests.clear();

        const filter: chrome.webRequest.RequestFilter = {
            urls: ['<all_urls>'],
            tabId,
            types: TRACKED_RESOURCE_TYPES,
        };

        this.onBeforeRequestListener = (details) => {
            if (!isNoiseUrl(details.url)) {
                this.pendingRequests.set(details.requestId, Date.now());
            }
        };

        this.onCompletedListener = (details) => {
            this.pendingRequests.delete(details.requestId);
        };

        this.onErrorListener = (details) => {
            this.pendingRequests.delete(details.requestId);
        };

        chrome.webRequest.onBeforeRequest.addListener(this.onBeforeRequestListener, filter);
        chrome.webRequest.onCompleted.addListener(this.onCompletedListener, filter);
        chrome.webRequest.onErrorOccurred.addListener(this.onErrorListener, filter);
    }

    /**
     * Stop tracking and remove all listeners.
     */
    stop(): void {
        if (this.onBeforeRequestListener) {
            chrome.webRequest.onBeforeRequest.removeListener(this.onBeforeRequestListener);
            this.onBeforeRequestListener = null;
        }
        if (this.onCompletedListener) {
            chrome.webRequest.onCompleted.removeListener(this.onCompletedListener);
            this.onCompletedListener = null;
        }
        if (this.onErrorListener) {
            chrome.webRequest.onErrorOccurred.removeListener(this.onErrorListener);
            this.onErrorListener = null;
        }
        this.pendingRequests.clear();
        this.tabId = null;
    }

    /**
     * Clear all pending requests. Call before an action to start fresh.
     */
    resetPending(): void {
        this.pendingRequests.clear();
    }

    /**
     * Get the number of currently pending requests.
     */
    getPendingCount(): number {
        // Purge stale requests older than 30 seconds (stuck/leaked)
        const staleThreshold = Date.now() - 30000;
        for (const [id, timestamp] of this.pendingRequests) {
            if (timestamp < staleThreshold) {
                this.pendingRequests.delete(id);
            }
        }
        return this.pendingRequests.size;
    }

    /**
     * Wait until network is idle (0 pending requests for quietPeriodMs).
     * Resolves immediately if already idle, or after timeoutMs.
     */
    waitForIdle(
        quietPeriodMs: number = 500,
        timeoutMs: number = 8000
    ): Promise<{ idle: boolean; timedOut: boolean }> {
        return new Promise((resolve) => {
            const startTime = Date.now();
            let lastActiveTime = Date.now(); // last time we saw pending > 0

            const check = () => {
                const elapsed = Date.now() - startTime;

                if (elapsed >= timeoutMs) {
                    resolve({ idle: false, timedOut: true });
                    return;
                }

                const pending = this.getPendingCount();

                if (pending > 0) {
                    lastActiveTime = Date.now();
                    setTimeout(check, 100);
                    return;
                }

                // pending === 0
                const quietDuration = Date.now() - lastActiveTime;
                if (quietDuration >= quietPeriodMs) {
                    resolve({ idle: true, timedOut: false });
                    return;
                }

                // Still in quiet window, keep checking
                setTimeout(check, 100);
            };

            check();
        });
    }
}
