import React, { useRef, useEffect } from 'react';
import { useAgentContext } from '../../context/AgentContext';
import AgentStepCard from './AgentStepCard';
import { Bot, CheckCircle2, XCircle } from 'lucide-react';

const AgentStepList: React.FC = () => {
    const { steps, taskDescription, isRunning, doneResult } = useAgentContext();
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new steps arrive
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [steps, doneResult]);

    return (
        <div className="px-4 py-4 space-y-4">
            {/* User's task */}
            {taskDescription && (
                <div className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-lg bg-[var(--color-surface)] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[11px] font-semibold text-gray-600">You</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[12px] leading-relaxed">{taskDescription}</p>
                    </div>
                </div>
            )}

            {/* Steps */}
            {steps.map((step) => (
                <AgentStepCard key={step.stepNumber} step={step} />
            ))}

            {/* Running indicator */}
            {isRunning && steps.length > 0 && steps[steps.length - 1]?.status === 'thinking' && (
                <div className="flex items-center gap-2 px-2 py-1">
                    <div className="agent-thinking-dots">
                        <span /><span /><span />
                    </div>
                </div>
            )}

            {/* Done result */}
            {doneResult && (
                <div className={`agent-done-banner ${doneResult.success ? 'agent-done-success' : 'agent-done-fail'}`}>
                    <div className="flex items-center gap-2 mb-1">
                        {doneResult.success ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-[11px] font-medium">
                            {doneResult.success ? 'Task completed successfully' : 'Task could not be completed'}
                        </span>
                    </div>
                    {doneResult.result && (
                        <p className="text-[11px] opacity-70 pl-6 leading-relaxed">{doneResult.result}</p>
                    )}
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    );
};

export default AgentStepList;
