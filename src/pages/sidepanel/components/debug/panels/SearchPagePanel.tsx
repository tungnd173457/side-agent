import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { BrowserAgent } from '../../../../../services/browser-agent/client';
import DebugPanel from '../DebugPanel';

const SearchPagePanel: React.FC = () => {
    const [pattern, setPattern] = useState('');

    return (
        <DebugPanel
            title="Search Page"
            description="Tìm text pattern trên trang"
            icon={<Search className="w-4 h-4" />}
            inputArea={
                <input
                    className="debug-input"
                    type="text"
                    placeholder="Search pattern…"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                />
            }
            onRun={() => {
                if (!pattern.trim()) return Promise.resolve({ success: false, error: 'Vui lòng nhập pattern' });
                return BrowserAgent.searchPage(pattern.trim());
            }}
        />
    );
};

export default SearchPagePanel;
