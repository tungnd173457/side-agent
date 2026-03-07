import React, { useState } from 'react';
import { Code2 } from 'lucide-react';
import { BrowserAgent } from '../../../../../services/browser-agent/client';
import DebugPanel from '../DebugPanel';

const FindElementsPanel: React.FC = () => {
    const [selector, setSelector] = useState('');

    return (
        <DebugPanel
            title="Find Elements"
            description="Tìm elements theo CSS selector"
            icon={<Code2 className="w-4 h-4" />}
            inputArea={
                <input
                    className="debug-input"
                    type="text"
                    placeholder="CSS selector, e.g. button.primary"
                    value={selector}
                    onChange={(e) => setSelector(e.target.value)}
                />
            }
            onRun={() => {
                if (!selector.trim()) return Promise.resolve({ success: false, error: 'Vui lòng nhập CSS selector' });
                return BrowserAgent.findElements(selector.trim());
            }}
        />
    );
};

export default FindElementsPanel;
