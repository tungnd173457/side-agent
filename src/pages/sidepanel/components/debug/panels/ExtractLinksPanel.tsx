import React from 'react';
import { Link2 } from 'lucide-react';
import { BrowserAgent } from '../../../../../services/browser-agent/client';
import DebugPanel from '../DebugPanel';

const ExtractLinksPanel: React.FC = () => (
    <DebugPanel
        title="Extract Links"
        description="Trích xuất tất cả links trên trang"
        icon={<Link2 className="w-4 h-4" />}
        onRun={() => BrowserAgent.extractLinks()}
        renderOutput={(data) => {
            const links = data?.data;
            if (Array.isArray(links) && links.length > 0) {
                return (
                    <div className="debug-table-wrap">
                        <table className="debug-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Text</th>
                                    <th>URL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {links.map((link: any, i: number) => (
                                    <tr key={i}>
                                        <td className="debug-table-num">{i + 1}</td>
                                        <td>{link.text || '—'}</td>
                                        <td className="debug-table-url">{link.href || link.url || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            }
            return <pre className="debug-output-pre">{JSON.stringify(data, null, 2)}</pre>;
        }}
    />
);

export default ExtractLinksPanel;
