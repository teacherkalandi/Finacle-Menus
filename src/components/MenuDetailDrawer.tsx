import React from 'react';
import { Check, Copy, Pin, PinOff, X, ArrowRight, FileText, NotebookPen } from 'lucide-react';
import { FinacleMenuItem } from '../types/finacle';
import { MENU_CATEGORIES } from '../data/finacleMenus';

interface MenuDetailDrawerProps {
  menu: FinacleMenuItem | null;
  onClose: () => void;
  onSelectCode: (code: string) => void;
  isPinned: boolean;
  onTogglePin: (code: string) => void;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
  personalNote: string;
  onSaveNote: (code: string, note: string) => void;
  onOpenPdf: () => void;
  isMobileSheet?: boolean;
}

export const MenuDetailDrawer: React.FC<MenuDetailDrawerProps> = ({
  menu,
  onClose,
  onSelectCode,
  isPinned,
  onTogglePin,
  copiedCode,
  onCopyCode,
  personalNote,
  onSaveNote,
  onOpenPdf,
  isMobileSheet = false,
}) => {
  if (!menu) return null;

  const categoryLabels = menu.categories
    .map((id) => MENU_CATEGORIES.find((c) => c.id === id)?.shortLabel ?? id)
    .join(' / ');

  const isCopied = copiedCode === menu.code;

  return (
    <aside
      aria-label={`Details for menu ${menu.code}`}
      className={`flex flex-col bg-white dark:bg-slate-900 ${
        isMobileSheet
          ? 'max-h-[88dvh] w-full rounded-t-2xl sm:h-full sm:max-h-none sm:rounded-none border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800'
          : 'h-full border-l border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Mobile Bottom Sheet Grab Handle */}
      {isMobileSheet && (
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0" aria-hidden="true">
          <div className="h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>
      )}

      {/* Top Action Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-5 py-3.5 sm:py-4 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-2xl font-semibold tracking-tight text-red-700 dark:text-red-400">
              {menu.code}
            </span>
            <button
              type="button"
              onClick={() => onCopyCode(menu.code)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              title="Copy Finacle menu code"
            >
              {isCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {menu.actionType}
            <span className="mx-1.5" aria-hidden="true">·</span>
            {menu.role}
            {menu.isAuditorMenu && (
              <>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Auditor Menu</span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onTogglePin(menu.code)}
            className={`hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 ${
              isPinned
                ? 'border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title={isPinned ? 'Unpin from desk favorites' : 'Pin to desk favorites'}
            aria-label={isPinned ? 'Unpin menu' : 'Pin menu'}
          >
            {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            aria-label="Close details panel"
          >
            <X className="h-5 w-5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Inspector Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4 sm:py-5 space-y-5 sm:space-y-6">
        {/* Title & Summary */}
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {menu.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {menu.description}
          </p>
        </div>

        {/* Metadata Table (Hairline Rows) */}
        <div className="border-t border-b border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/70 text-xs">
          <div className="flex items-start justify-between gap-4 py-2.5">
            <span className="text-slate-500 dark:text-slate-400 shrink-0">Applicable Modules</span>
            <span className="text-right font-medium text-slate-800 dark:text-slate-200">{categoryLabels}</span>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <span className="text-slate-500 dark:text-slate-400 shrink-0">Authorized Role</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{menu.role}</span>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <span className="text-slate-500 dark:text-slate-400 shrink-0">PDF Reference</span>
            <button
              type="button"
              onClick={onOpenPdf}
              className="inline-flex items-center gap-1.5 min-h-[36px] sm:min-h-0 font-mono text-xs font-medium text-red-700 dark:text-red-400 hover:underline tabular-nums"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Page {menu.pdfPages.join(', ')}</span>
            </button>
          </div>
        </div>

        {/* Multi-context uses */}
        {menu.multiContextUses && menu.multiContextUses.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2.5">
              Multi-Scheme Usage
            </h3>
            <div className="space-y-2.5">
              {menu.multiContextUses.map((use, idx) => (
                <div
                  key={idx}
                  className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 px-3.5 py-2.5"
                >
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {use.context}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {use.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step-by-step Instructions */}
        {menu.steps && menu.steps.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2.5">
              Execution Steps
            </h3>
            <ol className="space-y-2.5">
              {menu.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm sm:text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <span className="font-mono text-xs text-slate-400 dark:text-slate-500 tabular-nums shrink-0 mt-0.5">
                    {String(index + 1).padStart(2, '0')}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Operational Notes */}
        {menu.notes && menu.notes.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Operational Guidelines
            </h3>
            <div className="rounded-md border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 px-3.5 py-3 space-y-2">
              {menu.notes.map((note, idx) => (
                <p key={idx} className="text-xs leading-relaxed text-amber-950 dark:text-amber-200">
                  {note}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Related Finacle Menus */}
        {menu.relatedCodes && menu.relatedCodes.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2.5">
              Related Menus
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {menu.relatedCodes.map((relCode) => (
                <button
                  key={relCode}
                  type="button"
                  onClick={() => onSelectCode(relCode)}
                  className="flex min-h-[44px] sm:min-h-0 items-center justify-between rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-left hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                  <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {relCode}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Local SOL Desk Note */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <label
            htmlFor={`desk-note-${menu.code}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2"
          >
            <NotebookPen className="h-3.5 w-3.5 text-slate-500" />
            <span>My SOL Desk Note</span>
          </label>
          <textarea
            id={`desk-note-${menu.code}`}
            rows={3}
            value={personalNote}
            onChange={(e) => onSaveNote(menu.code, e.target.value)}
            placeholder="Add branch-specific notes (e.g., office account suffix, SOL printer ID, or supervisor shortcut)..."
            className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 px-3 py-2.5 text-base sm:text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:border-red-600 dark:focus:border-red-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-colors"
          />
          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
            Saved automatically on this device.
          </p>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar (Thumb Zone) */}
      {isMobileSheet && (
        <div className="sm:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 pb-safe shrink-0">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onCopyCode(menu.code)}
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-red-700 px-4 text-sm font-medium text-white active:scale-[0.98] transition-transform"
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied {menu.code}</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onTogglePin(menu.code)}
              className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium active:scale-[0.98] transition-transform ${
                isPinned
                  ? 'border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
              }`}
            >
              {isPinned ? (
                <>
                  <PinOff className="h-4 w-4" />
                  <span>Unpin</span>
                </>
              ) : (
                <>
                  <Pin className="h-4 w-4" />
                  <span>Pin Favorite</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
