import React from 'react';
import { Info } from 'lucide-react';
import { BrowserAgent } from '../../../../../services/browser-agent/client';
import DebugPanel from '../DebugPanel';

const PageMetadataPanel: React.FC = () => (
    <DebugPanel
        title="Get Page Metadata"
        description="Lấy metadata (title, description, OG tags)"
        icon={<Info className="w-4 h-4" />}
        onRun={() => BrowserAgent.getPageMetadata()}
    />
);

export default PageMetadataPanel;
