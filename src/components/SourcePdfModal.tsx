import React, { useEffect } from 'react';
import { Download, ExternalLink, X } from 'lucide-react';

interface SourcePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PDF_URL = '/assets/aistudio/977409939-all-latest-finacle-menus-with-descriptions_1a4c79f5.pdf';

export const SourcePdfModal: React.FC<SourcePdfModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="source-pdf-title"
      onClick={onClose}
    >
      <div
        className="flex h-[92dvh] sm:h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl sm:rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-5 py-3.5 shrink-0">
          <div className="min-w-0">
            <h2
              id="source-pdf-title"
              className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate"
            >
              Original DOP Finacle Menus PDF (13 Pages)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              All Latest Finacle Menus &amp; Auditor Menus
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={PDF_URL}
              download="DOP-Finacle-Menus-Reference.pdf"
              className="inline-flex min-h-[44px] sm:min-h-0 items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 sm:h-8 sm:w-8 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              aria-label="Close PDF viewer"
            >
              <X className="h-5 w-5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>

        {/* Mobile PDF Helper Strip (Mobile browsers often restrict inline PDF iframes) */}
        <div className="sm:hidden flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300 shrink-0">
          <span>Viewing on mobile? Open natively for pinch-zoom.</span>
          <a
            href={PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-red-700 dark:text-red-400 whitespace-nowrap shrink-0"
          >
            <span>Open PDF</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="flex-1 bg-slate-100 dark:bg-slate-950">
          <iframe
            src={PDF_URL}
            title="DOP Finacle Menus Reference PDF"
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </div>
  );
};
