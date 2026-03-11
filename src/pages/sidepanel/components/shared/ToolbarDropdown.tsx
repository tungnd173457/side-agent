import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface ToolbarDropdownProps {
    value: string;
    label: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
}

const ToolbarDropdown: React.FC<ToolbarDropdownProps> = ({ value, label, options, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    padding: '3px 7px',
                    fontSize: '10px',
                    color: 'var(--color-text)',
                    background: 'var(--color-bg)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    whiteSpace: 'nowrap',
                }}
            >
                <span>{label}</span>
                <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
            </button>

            {open && (
                <div
                    className="absolute left-0 bottom-full mb-1.5 min-w-[120px] rounded-[8px] z-50 py-1 overflow-hidden"
                    style={{
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-bg)',
                    }}
                >
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-[10px] whitespace-nowrap transition-colors ${opt.value === value ? 'bg-[var(--chrome-text)]/10 text-[var(--chrome-text)]' : 'text-[var(--chrome-text)] hover:bg-[var(--chrome-text)]/5'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ToolbarDropdown;
