import React, { useState } from 'react';
import { CheckSquare, Square, RotateCcw, AlertTriangle, Copy, Check } from 'lucide-react';
import { PROCEDURE_WORKFLOWS } from '../data/workflows';

interface ProceduresViewProps {
  onSelectCode: (code: string) => void;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
}

export const ProceduresView: React.FC<ProceduresViewProps> = ({
  onSelectCode,
  copiedCode,
  onCopyCode,
}) => {
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(PROCEDURE_WORKFLOWS.map((w) => w.category)))];

  const visibleWorkflows =
    selectedCategory === 'All'
      ? PROCEDURE_WORKFLOWS
      : PROCEDURE_WORKFLOWS.filter((w) => w.category === selectedCategory);

  const toggleStep = (workflowId: string, stepNumber: number) => {
    const key = `${workflowId}:${stepNumber}`;
    setCheckedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetWorkflow = (workflowId: string) => {
    setCheckedSteps((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.startsWith(`${workflowId}:`)) {
          delete next[k];
        }
      });
      return next;
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Standard Operating Procedures
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Interactive checklists for multi-menu Finacle procedures and CEPT-CBS guidelines documented in the official manual.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
        {categories.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[38px] sm:min-h-0 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 ${
                active
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Procedure Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-2">
        {visibleWorkflows.map((workflow) => {
          const completedCount = workflow.steps.filter(
            (s) => checkedSteps[`${workflow.id}:${s.stepNumber}`]
          ).length;

          return (
            <article
              key={workflow.id}
              className="flex flex-col rounded-xl sm:rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5"
            >
              {/* Kicker Metadata (Zero Pills) */}
              <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                <div className="min-w-0 truncate">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{workflow.category}</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span>{workflow.role}</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span>p. {workflow.pdfPage}</span>
                </div>
                {completedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => resetWorkflow(workflow.id)}
                    className="inline-flex min-h-[36px] sm:min-h-0 items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset ({completedCount}/{workflow.steps.length})</span>
                  </button>
                )}
              </div>

              {/* Title & Summary */}
              <h2 className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                {workflow.title}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {workflow.summary}
              </p>

              {/* Sequence Chain */}
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                <span className="text-slate-500 dark:text-slate-400">Menus:</span>
                {workflow.codes.map((code, idx) => (
                  <React.Fragment key={code}>
                    <button
                      type="button"
                      onClick={() => onSelectCode(code)}
                      className="inline-flex min-h-[32px] sm:min-h-0 items-center font-mono font-semibold text-red-700 dark:text-red-400 hover:underline"
                    >
                      {code}
                    </button>
                    {idx < workflow.codes.length - 1 && (
                      <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Caution Notice if present */}
              {workflow.caution && (
                <div className="mt-3.5 flex items-start gap-2.5 rounded-md border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 px-3.5 py-2.5 text-xs text-amber-950 dark:text-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{workflow.caution}</p>
                </div>
              )}

              {/* Checkable Steps */}
              <ol className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/80 border-t border-slate-200 dark:border-slate-800">
                {workflow.steps.map((step) => {
                  const key = `${workflow.id}:${step.stepNumber}`;
                  const isDone = Boolean(checkedSteps[key]);
                  const isCopied = step.menuCode && copiedCode === step.menuCode;

                  return (
                    <li key={step.stepNumber} className="py-2">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => toggleStep(workflow.id, step.stepNumber)}
                          className="inline-flex h-10 w-10 sm:h-6 sm:w-6 -ml-2 sm:ml-0 items-center justify-center rounded-md text-slate-400 hover:text-red-700 dark:hover:text-red-400 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                          aria-label={`Mark step ${step.stepNumber} as ${isDone ? 'incomplete' : 'complete'}`}
                        >
                          {isDone ? (
                            <CheckSquare className="h-5 w-5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Square className="h-5 w-5 sm:h-4 sm:w-4" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1 pt-2 sm:pt-0">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <p
                              onClick={() => toggleStep(workflow.id, step.stepNumber)}
                              className={`cursor-pointer text-sm leading-snug ${
                                isDone
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              <span className="font-mono text-xs text-slate-400 dark:text-slate-500 mr-2 tabular-nums">
                                {String(step.stepNumber).padStart(2, '0')}.
                              </span>
                              {step.instruction}
                            </p>
                            {step.menuCode && (
                              <div className="inline-flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => onSelectCode(step.menuCode!)}
                                  className="min-h-[36px] sm:min-h-0 px-1 font-mono text-xs font-semibold text-red-700 dark:text-red-400 hover:underline"
                                >
                                  {step.menuCode}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onCopyCode(step.menuCode!)}
                                  className="inline-flex h-9 w-9 sm:h-6 sm:w-6 items-center justify-center rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                  title={`Copy ${step.menuCode}`}
                                  aria-label={`Copy ${step.menuCode}`}
                                >
                                  {isCopied ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                          {step.detail && (
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed sm:pl-6">
                              {step.detail}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </article>
          );
        })}
      </div>
    </div>
  );
};
