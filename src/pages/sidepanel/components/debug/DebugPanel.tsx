import React, { useState } from 'react';
import { Play, ChevronDown, ChevronUp, Copy, Check, Loader2, Trash2 } from 'lucide-react';

interface DebugPanelProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onRun: () => Promise<any>;
    /** Extra input fields rendered above the Run button */
    inputArea?: React.ReactNode;
    /** Custom renderer for the output. Falls back to JSON/text pre block. */
    renderOutput?: (data: any) => React.ReactNode;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
    title,
    description,
    icon,
    onRun,
    inputArea,
    renderOutput,
}) => {
    const [output, setOutput] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [collapsed, setCollapsed] = useState(false);
    const [copied, setCopied] = useState(false);
    const [elapsed, setElapsed] = useState<number | null>(null);

    const handleRun = async () => {
        setLoading(true);
        setError(null);
        setOutput(null);
        setElapsed(null);
        const t0 = performance.now();
        try {
            const result = await onRun();
            setElapsed(Math.round(performance.now() - t0));
            if (result && result.success === false && result.error) {
                setError(result.error);
            } else {
                setOutput(result);
            }
        } catch (e: any) {
            setElapsed(Math.round(performance.now() - t0));
            setError(e.message || String(e));
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        let text: string;
        try {
            const inner = output?.data;
            if (typeof output === 'string') text = output;
            else if (typeof inner === 'string') text = inner;
            else if (inner !== undefined && inner !== null) text = JSON.stringify(inner, null, 2);
            else text = JSON.stringify(output, null, 2);
        } catch {
            text = String(output);
        }
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    const handleClear = () => {
        setOutput(null);
        setError(null);
        setElapsed(null);
    };

    const hasOutput = output !== null || error !== null;

    const defaultRender = (data: any) => {
        let text: string;
        try {
            const inner = data?.data;
            if (typeof inner === 'string') {
                text = inner;
            } else if (inner !== undefined && inner !== null) {
                text = JSON.stringify(inner, null, 2);
            } else if (typeof data === 'string') {
                text = data;
            } else {
                text = JSON.stringify(data, null, 2);
            }
        } catch {
            text = String(data);
        }
        return <pre className="debug-output-pre">{text}</pre>;
    };

    return (
        <div className="debug-panel">
            {/* Header */}
            <div className="debug-panel-header">
                <div className="debug-panel-icon">{icon}</div>
                <div className="debug-panel-info">
                    <div className="debug-panel-title">{title}</div>
                    <div className="debug-panel-desc">{description}</div>
                </div>
            </div>

            {/* Input area */}
            {inputArea && <div className="debug-panel-inputs">{inputArea}</div>}

            {/* Actions row */}
            <div className="debug-panel-actions">
                <button className="debug-btn debug-btn-run" onClick={handleRun} disabled={loading}>
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    {loading ? 'Running…' : 'Run'}
                </button>
                {hasOutput && (
                    <div className="debug-panel-action-right">
                        {elapsed !== null && (
                            <span className="debug-elapsed">{elapsed}ms</span>
                        )}
                        <button className="debug-btn-icon" onClick={handleCopy} title="Copy output">
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button className="debug-btn-icon" onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Expand' : 'Collapse'}>
                            {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                        </button>
                        <button className="debug-btn-icon" onClick={handleClear} title="Clear">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Output */}
            {hasOutput && !collapsed && (
                <div className={`debug-output ${error ? 'debug-output-error' : ''}`}>
                    {error
                        ? <pre className="debug-output-pre debug-error-text">{error}</pre>
                        : (renderOutput ? renderOutput(output) : defaultRender(output))
                    }
                </div>
            )}
        </div>
    );
};

export default DebugPanel;
