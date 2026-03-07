import React from 'react';
import { FileText } from 'lucide-react';
import { BrowserAgent } from '../../../../../services/browser-agent/client';
import DebugPanel from '../DebugPanel';

const PageTextPanel: React.FC = () => (
    <DebugPanel
        title="Extract Page Text"
        description="Lấy toàn bộ text nội dung trang"
        icon={<FileText className="w-4 h-4" />}
        onRun={() => BrowserAgent.getPageText()}
    />
);

export default PageTextPanel;
