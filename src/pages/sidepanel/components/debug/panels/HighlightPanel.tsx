import React, { useState } from 'react';
import { Crosshair } from 'lucide-react';
import { BrowserAgent } from '../../../../../services/browser-agent/client';
import DebugPanel from '../DebugPanel';

const HighlightPanel: React.FC = () => {
    const [index, setIndex] = useState('');
    const [color, setColor] = useState('#ff0000');

    return (
        <DebugPanel
            title="Highlight Element"
            description="Highlight element theo index"
            icon={<Crosshair className="w-4 h-4" />}
            inputArea={
                <div className="flex gap-2">
                    <input
                        className="debug-input flex-1"
                        type="number"
                        min={0}
                        placeholder="Element index"
                        value={index}
                        onChange={(e) => setIndex(e.target.value)}
                    />
                    <input
                        className="debug-input-color"
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        title="Highlight color"
                    />
                </div>
            }
            onRun={() => {
                const idx = parseInt(index, 10);
                if (isNaN(idx)) return Promise.resolve({ success: false, error: 'Vui lòng nhập element index (số)' });
                return BrowserAgent.highlight(idx, color);
            }}
        />
    );
};

export default HighlightPanel;
