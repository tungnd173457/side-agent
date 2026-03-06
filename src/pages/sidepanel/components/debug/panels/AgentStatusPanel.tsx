import React from 'react';
import { Activity } from 'lucide-react';
import { BrowserAgent } from '../../../../../services/browser-agent/client';
import DebugPanel from '../DebugPanel';

const AgentStatusPanel: React.FC = () => (
    <DebugPanel
        title="Get Agent Status"
        description="Xem trạng thái agent hiện tại"
        icon={<Activity className="w-4 h-4" />}
        onRun={() => BrowserAgent.getStatus()}
    />
);

export default AgentStatusPanel;
