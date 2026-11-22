import React, { useState } from 'react';
import { Check, Copy, Search } from 'lucide-react';
import { SCHEME_LIFECYCLE_MATRIX } from '../data/workflows';

interface LifecycleMatrixViewProps {
  onSelectCode: (code: string) => void;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
}

export const LifecycleMatrixView: React.FC<LifecycleMatrixViewProps> = ({
  onSelectCode,
  copiedCode,
  onCopyCode,
}) => {
  const [schemeFilter, setSchemeFilter] = useState('');

  const normalizedQuery = schemeFilter.trim().toLowerCase();
  const filteredRows = SCHEME_LIFECYCLE_MATRIX.filter((row) => {
    if (!normalizedQuery) return true;
    const haystack = [
      row.scheme,
      row.code,
      row.open,
      row.modBeforeVerify,
      row.verifyOpen,
      row.modAfterVerify,
      row.transaction,
      row.close,
      row.verifyClose,
      ...row.special.map((s) => `${s.code} ${s.label}`),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  const renderCodeCell = (code: string) => {
    const isCopied = copiedCode === code;
    return (
      <div className="group inline-flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onSelectCode(code)}
          className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 hover:text-red-700 dark:hover:text-red-400 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          title={`Inspect ${code}`}
        >
          {code}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCopyCode(code);
          }}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-opacity p-0.5"
          title={`Copy ${code}`}
          aria-label={`Copy ${code}`}
        >
          {isCopied ? (
            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header & Inline Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Scheme Lifecycle Matrix
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Opening, pre/post-verification modification, transaction, and closure menus across all 9 DOP schemes. Tap any code to inspect details.
          </p>
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={schemeFilter}
            onChange={(e) => setSchemeFilter(e.target.value)}
            placeholder="Filter scheme or code..."
            className="w-full rounded-lg sm:rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 sm:py-2 pl-9 pr-3 text-base sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-red-600 dark:focus:border-red-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Mobile Native Stacked Scheme Cards (< md) */}
      <div className="md:hidden space-y-3">
        {filteredRows.length === 0 ? (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 px-4 text-center text-sm text-slate-500 dark:text-slate-400">
            No schemes match "{schemeFilter}".
          </div>
        ) : (
          filteredRows.map((row) => {
            const stages = [
              { label: 'Open', code: row.open },
              { label: 'Verify Open', code: row.verifyOpen },
              { label: 'Mod (Pre-Verify)', code: row.modBeforeVerify },
              { label: 'Mod (Post-Verify)', code: row.modAfterVerify },
              { label: 'Transaction / Print', code: row.transaction },
              { label: 'Close', code: row.close },
              { label: 'Verify Close', code: row.verifyClose },
            ];

            return (
              <article
                key={row.code}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
              >
                <div className="flex items-baseline justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {row.scheme}
                  </h2>
                  <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
                    {row.code}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {stages.map((stage) => {
                    const isCopied = copiedCode === stage.code;
                    return (
                      <div
                        key={stage.label}
                        className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 pl-3 pr-1 py-1"
                      >
                        <button
                          type="button"
                          onClick={() => onSelectCode(stage.code)}
                          className="min-h-[40px] flex-1 text-left py-1"
                        >
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                            {stage.label}
                          </div>
                          <div className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                            {stage.code}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => onCopyCode(stage.code)}
                          className="inline-flex h-10 w-9 items-center justify-center rounded-md text-slate-400 active:bg-slate-200 dark:active:bg-slate-800"
                          aria-label={`Copy ${stage.code}`}
                        >
                          {isCopied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {row.special.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                      Key Operations
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      {row.special.map((item, idx) => (
                        <button
                          key={`${item.code}-${idx}`}
                          type="button"
                          onClick={() => onSelectCode(item.code)}
                          className="inline-flex min-h-[36px] items-center gap-1.5 text-left"
                        >
                          <span className="font-mono font-semibold text-red-700 dark:text-red-400">
                            {item.code}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Desktop High-Density Comparison Table (md+) */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full min-w-[960px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <th className="py-3 pl-4 pr-3">Scheme</th>
              <th className="py-3 px-3">Open</th>
              <th className="py-3 px-3">Mod (Pre-Verify)</th>
              <th className="py-3 px-3">Verify Open</th>
              <th className="py-3 px-3">Mod (Post-Verify)</th>
              <th className="py-3 px-3">Transaction / Print</th>
              <th className="py-3 px-3">Close</th>
              <th className="py-3 px-3">Verify Close</th>
              <th className="py-3 pl-3 pr-4">Key Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                  No schemes match "{schemeFilter}".
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr
                  key={row.code}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 pl-4 pr-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    <div>{row.scheme}</div>
                    <div className="font-mono text-[11px] font-normal text-slate-400 dark:text-slate-500">
                      {row.code}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">{renderCodeCell(row.open)}</td>
                  <td className="py-3.5 px-3 whitespace-nowrap">{renderCodeCell(row.modBeforeVerify)}</td>
                  <td className="py-3.5 px-3 whitespace-nowrap">{renderCodeCell(row.verifyOpen)}</td>
                  <td className="py-3.5 px-3 whitespace-nowrap">{renderCodeCell(row.modAfterVerify)}</td>
                  <td className="py-3.5 px-3 whitespace-nowrap">{renderCodeCell(row.transaction)}</td>
                  <td className="py-3.5 px-3 whitespace-nowrap">{renderCodeCell(row.close)}</td>
                  <td className="py-3.5 px-3 whitespace-nowrap">{renderCodeCell(row.verifyClose)}</td>
                  <td className="py-3.5 pl-3 pr-4">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                      {row.special.map((item, idx) => (
                        <span key={`${item.code}-${idx}`} className="inline-flex items-center gap-1 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onSelectCode(item.code)}
                            className="font-mono font-semibold text-red-700 dark:text-red-400 hover:underline"
                          >
                            {item.code}
                          </button>
                          <span className="text-slate-500 dark:text-slate-400">({item.label})</span>
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Shared Common Menus Reference Strip */}
      <div className="rounded-xl sm:rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Universal Menus Common to All Deposit Schemes
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Tap any universal operational code below to view full details.
          </p>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-y-1 border-t border-slate-100 dark:border-slate-800 pt-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-x-6 text-xs">
          {[
            { code: 'HPBP', label: 'Passbook Print' },
            { code: 'HPSP', label: 'Account Statement' },
            { code: 'HAFSM', label: 'Freeze / Unfreeze' },
            { code: 'CNAC', label: 'Old → New A/c No.' },
            { code: 'HACDET', label: 'Balance Details' },
            { code: 'HACCDET', label: 'General A/c Inquiry' },
            { code: 'HCUACC', label: 'Accounts by CIF' },
            { code: 'HCUSUM', label: 'All Scheme Summary' },
            { code: 'HTV', label: 'Bulk Voucher Verify' },
            { code: 'HCASHPND', label: 'Pending Cash Payment' },
            { code: 'HCRT', label: 'Reverse Transaction' },
            { code: 'HGCHRG', label: 'Manual Fee Collection' },
          ].map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => onSelectCode(item.code)}
              className="flex min-h-[40px] sm:min-h-0 items-center justify-between py-1.5 text-left hover:text-red-700 dark:hover:text-red-400 transition-colors"
            >
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{item.code}</span>
              <span className="text-slate-500 dark:text-slate-400 truncate ml-2">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
