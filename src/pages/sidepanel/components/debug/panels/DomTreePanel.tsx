import React from 'react';
import { TreePine } from 'lucide-react';
import { BrowserAgent } from '../../../../../services/browser-agent/client';
import DebugPanel from '../DebugPanel';

const DomTreePanel: React.FC = () => (
    <DebugPanel
        title="Build DOM Tree"
        description="Sinh DOM tree text của page hiện tại"
        icon={<TreePine className="w-4 h-4" />}
        onRun={() => BrowserAgent.getElements()}
        renderOutput={(data) => {
            // data = { success, data: { text, elementCount, url, title, description } }
            const inner = data?.data;
            const text = typeof inner === 'string' ? inner
                : inner?.text ? `URL: ${inner.url}\nTitle: ${inner.title}\nElements: ${inner.elementCount}\n${'─'.repeat(40)}\n${inner.text}`
                    : JSON.stringify(inner, null, 2);
            return <pre className="debug-output-pre">{text}</pre>;
        }}
    />
);

export default DomTreePanel;

