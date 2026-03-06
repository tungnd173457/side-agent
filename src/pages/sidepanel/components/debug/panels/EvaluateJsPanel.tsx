import React, { useState } from 'react';
import { Terminal } from 'lucide-react';
import { BrowserAgent } from '../../../../../services/browser-agent/client';
import DebugPanel from '../DebugPanel';

const EvaluateJsPanel: React.FC = () => {
    const [code, setCode] = useState('');

    return (
        <DebugPanel
            title="Evaluate JS"
            description="Chạy JavaScript tùy ý trên page"
            icon={<Terminal className="w-4 h-4" />}
            inputArea={
                <textarea
                    className="debug-textarea"
                    rows={4}
                    placeholder="document.title"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
            }
            onRun={() => {
                if (!code.trim()) return Promise.resolve({ success: false, error: 'Vui lòng nhập JavaScript code' });
                return BrowserAgent.evaluateJS(code.trim());
            }}
        />
    );
};

export default EvaluateJsPanel;
