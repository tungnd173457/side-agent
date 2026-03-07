import React from 'react';
import { Camera } from 'lucide-react';
import { BrowserAgent } from '../../../../../services/browser-agent/client';
import DebugPanel from '../DebugPanel';

const ScreenshotPanel: React.FC = () => (
    <DebugPanel
        title="Capture Screenshot"
        description="Chụp screenshot tab hiện tại"
        icon={<Camera className="w-4 h-4" />}
        onRun={() => BrowserAgent.captureVisibleTab('png')}
        renderOutput={(data) => {
            const src = data?.data || data;
            if (typeof src === 'string' && src.startsWith('data:image')) {
                return (
                    <div className="debug-screenshot-wrap">
                        <img src={src} alt="Screenshot" className="debug-screenshot-img" />
                    </div>
                );
            }
            return <pre className="debug-output-pre">{JSON.stringify(data, null, 2)}</pre>;
        }}
    />
);

export default ScreenshotPanel;
