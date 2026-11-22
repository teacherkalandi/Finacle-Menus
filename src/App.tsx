import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Check,
  Copy,
  Download,
  FileText,
  ListChecks,
  Menu,
  Moon,
  NotebookPen,
  Pin,
  Search,
  Sun,
  Table2,
  X,
} from 'lucide-react';
import { FINACLE_MENUS, MENU_CATEGORIES } from './data/finacleMenus';
import { ActionType, FinacleMenuItem } from './types/finacle';
import { Sidebar, DirectoryScope, WorkspaceTab } from './components/Sidebar';
import { MenuDetailDrawer } from './components/MenuDetailDrawer';
import { LifecycleMatrixView } from './components/LifecycleMatrixView';
import { ProceduresView } from './components/ProceduresView';
import { SourcePdfModal } from './components/SourcePdfModal';

const STORAGE_PINNED_KEY = 'dop_finacle_pinned_v1';
const STORAGE_NOTES_KEY = 'dop_finacle_notes_v1';
const STORAGE_RECENT_KEY = 'dop_finacle_recent_v1';
const STORAGE_THEME_KEY = 'dop_finacle_theme_v1';

const DEFAULT_PINNED = ['CTM', 'CASBAO', 'HPBP', 'HTV', 'HPR', 'HISCOD', 'HINTTI', 'HGCHRG'];

const ACTION_FILTERS: ('All' | ActionType)[] = [
  'All',
  'Open',
  'Verify',
  'Modify',
  'Close',
  'Transaction',
  'Inquiry',
  'Report',
  'Inventory',
  'Maintenance',
];

const MOBILE_SCOPE_OPTIONS: { id: DirectoryScope; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'auditor', label: 'Auditor' },
  ...MENU_CATEGORIES.map((c) => ({ id: c.id as DirectoryScope, label: c.shortLabel })),
];

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('directory');
  const [activeScope, setActiveScope] = useState<DirectoryScope>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<'All' | ActionType>('All');
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const [pinnedCodes, setPinnedCodes] = useState<string[]>(() =>
    loadStorage<string[]>(STORAGE_PINNED_KEY, DEFAULT_PINNED)
  );
  const [personalNotes, setPersonalNotes] = useState<Record<string, string>>(() =>
    loadStorage<Record<string, string>>(STORAGE_NOTES_KEY, {})
  );
  const [recentCodes, setRecentCodes] = useState<string[]>(() =>
    loadStorage<string[]>(STORAGE_RECENT_KEY, [])
  );
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = loadStorage<'dark' | 'light' | null>(STORAGE_THEME_KEY, null);
    if (saved) return saved === 'dark';
    return false;
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(STORAGE_THEME_KEY, JSON.stringify(isDark ? 'dark' : 'light'));
    } catch {
      // Ignore storage quota errors
    }
  }, [isDark]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_PINNED_KEY, JSON.stringify(pinnedCodes));
    } catch {
      // Ignore storage errors
    }
  }, [pinnedCodes]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(personalNotes));
    } catch {
      // Ignore storage errors
    }
  }, [personalNotes]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_RECENT_KEY, JSON.stringify(recentCodes));
    } catch {
      // Ignore storage errors
    }
  }, [recentCodes]);

  // Global keyboard shortcut "/" or Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if ((e.key === '/' && !isInputFocused) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setActiveTab('directory');
        setTimeout(() => {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }, 0);
      } else if (e.key === 'Escape' && selectedCode && !isPdfModalOpen) {
        setSelectedCode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCode, isPdfModalOpen]);

  const handleSelectCode = (code: string) => {
    const found = FINACLE_MENUS.find((m) => m.code.toUpperCase() === code.toUpperCase());
    if (!found) return;
    setSelectedCode(found.code);
    setRecentCodes((prev) => [found.code, ...prev.filter((c) => c !== found.code)].slice(0, 8));
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedCode(code);
    window.setTimeout(() => {
      setCopiedCode((prev) => (prev === code ? null : prev));
    }, 1500);
  };

  const handleTogglePin = (code: string) => {
    setPinnedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [code, ...prev]
    );
  };

  const handleSaveNote = (code: string, note: string) => {
    setPersonalNotes((prev) => {
      const next = { ...prev };
      if (!note.trim()) {
        delete next[code];
      } else {
        next[code] = note;
      }
      return next;
    });
  };

  // Filtered and ranked menus
  const filteredMenus = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const matches = FINACLE_MENUS.filter((item) => {
      if (activeScope === 'pinned' && !pinnedCodes.includes(item.code)) return false;
      if (activeScope === 'auditor' && !item.isAuditorMenu) return false;
      if (
        activeScope !== 'all' &&
        activeScope !== 'pinned' &&
        activeScope !== 'auditor' &&
        !item.categories.includes(activeScope)
      ) {
        return false;
      }

      if (actionFilter !== 'All' && item.actionType !== actionFilter) return false;

      if (!q) return true;
      const noteText = personalNotes[item.code] || '';
      const multiUseText = item.multiContextUses
        ? item.multiContextUses.map((u) => `${u.context} ${u.detail}`).join(' ')
        : '';
      const notesText = item.notes ? item.notes.join(' ') : '';
      const stepsText = item.steps ? item.steps.join(' ') : '';

      const haystack = [
        item.code,
        item.title,
        item.description,
        item.role,
        item.actionType,
        ...item.keywords,
        multiUseText,
        notesText,
        stepsText,
        noteText,
      ]
        .join(' ')
        .toLowerCase();

      return q.split(/\s+/).every((token) => haystack.includes(token));
    });

    if (!q) {
      return [...matches].sort((a, b) => a.code.localeCompare(b.code));
    }

    return [...matches].sort((a, b) => {
      const aCode = a.code.toLowerCase();
      const bCode = b.code.toLowerCase();
      if (aCode === q && bCode !== q) return -1;
      if (bCode === q && aCode !== q) return 1;
      const aPrefix = aCode.startsWith(q);
      const bPrefix = bCode.startsWith(q);
      if (aPrefix && !bPrefix) return -1;
      if (bPrefix && !aPrefix) return 1;
      const aCodeContains = aCode.includes(q);
      const bCodeContains = bCode.includes(q);
      if (aCodeContains && !bCodeContains) return -1;
      if (bCodeContains && !aCodeContains) return 1;
      return a.code.localeCompare(b.code);
    });
  }, [activeScope, actionFilter, searchQuery, pinnedCodes, personalNotes]);

  const selectedMenu: FinacleMenuItem | null = useMemo(
    () => (selectedCode ? FINACLE_MENUS.find((m) => m.code === selectedCode) ?? null : null),
    [selectedCode]
  );

  const breadcrumbLabel = useMemo(() => {
    if (activeTab === 'matrix') return 'Lifecycle Matrix';
    if (activeTab === 'procedures') return 'SOP Checklists';
    if (activeScope === 'all') return 'All DOP Menus';
    if (activeScope === 'pinned') return 'Pinned Favorites';
    if (activeScope === 'auditor') return 'Auditor Menu Suite';
    return MENU_CATEGORIES.find((c) => c.id === activeScope)?.label ?? 'Menu Directory';
  }, [activeTab, activeScope]);

  const handleExportCsv = () => {
    const rows = [
      ['Menu Code', 'Title', 'Description', 'Action Type', 'Role', 'Auditor Menu', 'Modules', 'PDF Pages', 'My Desk Note'],
      ...filteredMenus.map((m) => [
        m.code,
        m.title,
        m.description,
        m.actionType,
        m.role,
        m.isAuditorMenu ? 'Yes' : 'No',
        m.categories
          .map((c) => MENU_CATEGORIES.find((cat) => cat.id === c)?.shortLabel ?? c)
          .join('; '),
        m.pdfPages.join('; '),
        personalNotes[m.code] ?? '',
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dop-finacle-menus-${activeScope}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setActionFilter('All');
    setActiveScope('all');
  };

  const getPrimaryCategoryShort = (menu: FinacleMenuItem) =>
    MENU_CATEGORIES.find((c) => c.id === menu.primaryCategory)?.shortLabel ?? menu.primaryCategory;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        activeScope={activeScope}
        onSelectScope={setActiveScope}
        pinnedCount={pinnedCodes.length}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Right Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar Contract: Compact on mobile (h-12) so top + bottom sticky stays under 15% */}
        <header className="no-print sticky top-0 z-30 flex h-12 sm:h-14 items-center justify-between gap-2 sm:gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
              aria-label="Open modules navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm min-w-0">
              <span className="hidden sm:inline text-slate-500 dark:text-slate-400 whitespace-nowrap">
                DOP Finacle
              </span>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-600" aria-hidden="true">
                /
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {breadcrumbLabel}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="inline-flex min-h-[36px] sm:min-h-0 items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Source PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>

            {activeTab === 'directory' && (
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex min-h-[36px] sm:min-h-0 items-center gap-1.5 rounded-md bg-red-700 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-white hover:bg-red-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">CSV</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              className="inline-flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Main Workspace + Optional Right Inspector */}
        <div className="flex flex-1 min-h-0">
          <main className="flex-1 min-w-0 px-4 pt-4 pb-20 sm:px-6 sm:py-6 lg:pb-6">
            {activeTab === 'directory' && (
              <div className="space-y-3.5 sm:space-y-4">
                {/* Command Search Bar (16px font on mobile to prevent iOS auto-zoom) */}
                <div className="flex flex-col gap-2.5 sm:gap-3">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder='Search code or task (e.g. "CASBAO", "0382", "EOD")...'
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-12 sm:pr-16 text-base sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-red-600 dark:focus:border-red-500 focus:outline-none transition-colors"
                    />
                    <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {searchQuery ? (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="inline-flex h-9 w-9 sm:h-6 sm:w-6 items-center justify-center rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          aria-label="Clear search"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : (
                        <kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] text-slate-400 dark:text-slate-400">
                          /
                        </kbd>
                      )}
                    </div>
                  </div>

                  {/* Mobile Module Quick-Swipe Strip (< lg) */}
                  <div className="lg:hidden no-scrollbar flex items-center gap-1.5 overflow-x-auto -mx-4 px-4 pb-0.5">
                    {MOBILE_SCOPE_OPTIONS.map((opt) => {
                      const isActive = activeScope === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setActiveScope(opt.id)}
                          className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                            isActive
                              ? 'bg-red-700 text-white'
                              : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Action Filter Controls & Summary Count */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="no-scrollbar flex items-center gap-1 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-0.5 sm:pb-0">
                      {ACTION_FILTERS.map((action) => {
                        const isActive = actionFilter === action;
                        return (
                          <button
                            key={action}
                            type="button"
                            onClick={() => setActionFilter(action)}
                            className={`min-h-[34px] sm:min-h-0 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 ${
                              isActive
                                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                          >
                            {action}
                          </button>
                        );
                      })}
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap shrink-0">
                      Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{filteredMenus.length}</span> of{' '}
                      <span>{FINACLE_MENUS.length}</span> menus
                    </div>
                  </div>

                  {/* Recently Inspected Bar (clean unboxed text links) */}
                  {recentCodes.length > 0 && !searchQuery && (
                    <div className="no-scrollbar flex items-center gap-2 overflow-x-auto text-xs text-slate-500 dark:text-slate-400">
                      <span className="shrink-0">Recent:</span>
                      {recentCodes.map((code, idx) => (
                        <React.Fragment key={code}>
                          <button
                            type="button"
                            onClick={() => handleSelectCode(code)}
                            className="min-h-[32px] sm:min-h-0 font-mono font-medium text-slate-700 dark:text-slate-300 hover:text-red-700 dark:hover:text-red-400 transition-colors whitespace-nowrap shrink-0"
                          >
                            {code}
                          </button>
                          {idx < recentCodes.length - 1 && (
                            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Native Stacked Menu List (< md) — Zero Horizontal Scroll */}
                <div className="md:hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
                  {filteredMenus.length === 0 ? (
                    <div className="py-12 px-4 text-center">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        No Finacle menus match your filters
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Try a shorter code (like HCAAC or HIMC) or reset filters.
                      </p>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-slate-900 dark:bg-slate-100 px-4 py-2 text-xs font-medium text-white dark:text-slate-950"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    filteredMenus.map((menu) => {
                      const isSelected = selectedCode === menu.code;
                      const isPinned = pinnedCodes.includes(menu.code);
                      const isCopied = copiedCode === menu.code;
                      const hasNote = Boolean(personalNotes[menu.code]);

                      return (
                        <div
                          key={menu.code}
                          onClick={() => handleSelectCode(menu.code)}
                          className={`flex items-start gap-2 px-3.5 py-3.5 transition-colors active:bg-slate-100 dark:active:bg-slate-800/70 ${
                            isSelected ? 'bg-red-50/70 dark:bg-red-950/30' : ''
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-semibold text-red-700 dark:text-red-400">
                                {menu.code}
                              </span>
                              {hasNote && (
                                <NotebookPen
                                  className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0"
                                  aria-label="Has personal SOL note"
                                />
                              )}
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                                {getPrimaryCategoryShort(menu)} · {menu.actionType}
                              </span>
                            </div>

                            <div className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
                              {menu.title}
                            </div>
                            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {menu.description}
                            </p>

                            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                              <span>{menu.role}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono">p. {menu.pdfPages[0]}</span>
                              {menu.isAuditorMenu && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">Auditor</span>
                                </>
                              )}
                              {menu.steps && menu.steps.length > 0 && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-medium text-red-700 dark:text-red-400">
                                    {menu.steps.length}-step SOP
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* 44x44 Touch Targets for Copy & Pin */}
                          <div className="flex flex-col items-center shrink-0 -mr-1.5 -my-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyCode(menu.code);
                              }}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-slate-500 dark:text-slate-400 active:bg-slate-200 dark:active:bg-slate-700"
                              aria-label={`Copy ${menu.code}`}
                            >
                              {isCopied ? (
                                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePin(menu.code);
                              }}
                              className={`inline-flex h-11 w-11 items-center justify-center rounded-md active:bg-slate-200 dark:active:bg-slate-700 ${
                                isPinned
                                  ? 'text-red-700 dark:text-red-400'
                                  : 'text-slate-400 dark:text-slate-500'
                              }`}
                              aria-label={isPinned ? `Unpin ${menu.code}` : `Pin ${menu.code}`}
                            >
                              <Pin className={`h-4 w-4 ${isPinned ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Desktop High-Density Menu Reference Table (md+) */}
                <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <table className="w-full min-w-[680px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <th className="py-2.5 pl-4 pr-3 w-36">Menu Code</th>
                        <th className="py-2.5 px-3">Function &amp; Description</th>
                        <th className="py-2.5 px-3 w-36">Module</th>
                        <th className="py-2.5 px-3 w-28">Type</th>
                        <th className="py-2.5 pl-3 pr-4 w-20 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                      {filteredMenus.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 px-4 text-center">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              No Finacle menus match your current filters
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              Try searching by a partial code (like HCAAC or HIMC) or reset the category and action filters.
                            </p>
                            <button
                              type="button"
                              onClick={resetFilters}
                              className="mt-4 inline-flex items-center rounded-md bg-slate-900 dark:bg-slate-100 px-3.5 py-2 text-xs font-medium text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                            >
                              Reset All Filters
                            </button>
                          </td>
                        </tr>
                      ) : (
                        filteredMenus.map((menu) => {
                          const isSelected = selectedCode === menu.code;
                          const isPinned = pinnedCodes.includes(menu.code);
                          const isCopied = copiedCode === menu.code;
                          const hasNote = Boolean(personalNotes[menu.code]);

                          return (
                            <tr
                              key={menu.code}
                              onClick={() => handleSelectCode(menu.code)}
                              className={`group cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-red-50/70 dark:bg-red-950/30'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                              }`}
                            >
                              <td className="py-3 pl-4 pr-3 align-top whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`font-mono text-sm font-semibold ${
                                      isSelected
                                        ? 'text-red-700 dark:text-red-400'
                                        : 'text-slate-900 dark:text-slate-100 group-hover:text-red-700 dark:group-hover:text-red-400'
                                    }`}
                                  >
                                    {menu.code}
                                  </span>
                                  {hasNote && (
                                    <span title="Has personal SOL desk note">
                                      <NotebookPen className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                    </span>
                                  )}
                                </div>
                                <div className="mt-0.5 font-mono text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                                  p. {menu.pdfPages.slice(0, 3).join(', ')}
                                  {menu.pdfPages.length > 3 ? '…' : ''}
                                </div>
                              </td>

                              <td className="py-3 px-3 align-top">
                                <div className="font-medium text-slate-900 dark:text-slate-100 leading-snug">
                                  {menu.title}
                                </div>
                                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                  {menu.description}
                                </p>
                                {(menu.isAuditorMenu || (menu.steps && menu.steps.length > 0)) && (
                                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                    {menu.isAuditorMenu && (
                                      <span className="font-medium text-slate-700 dark:text-slate-300">
                                        Auditor Menu
                                      </span>
                                    )}
                                    {menu.isAuditorMenu && menu.steps && menu.steps.length > 0 && (
                                      <span aria-hidden="true">·</span>
                                    )}
                                    {menu.steps && menu.steps.length > 0 && (
                                      <span className="text-red-700 dark:text-red-400 font-medium">
                                        {menu.steps.length}-step SOP included
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>

                              <td className="py-3 px-3 align-top text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                <div>{getPrimaryCategoryShort(menu)}</div>
                                {menu.categories.length > 1 && (
                                  <div className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                                    +{menu.categories.length - 1} more
                                  </div>
                                )}
                              </td>

                              <td className="py-3 px-3 align-top text-xs whitespace-nowrap">
                                <div className="font-medium text-slate-700 dark:text-slate-300">
                                  {menu.actionType}
                                </div>
                                <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[110px]">
                                  {menu.role}
                                </div>
                              </td>

                              <td className="py-3 pl-3 pr-4 align-top text-right whitespace-nowrap">
                                <div className="inline-flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyCode(menu.code);
                                    }}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                    title={`Copy ${menu.code}`}
                                    aria-label={`Copy ${menu.code}`}
                                  >
                                    {isCopied ? (
                                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5" />
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTogglePin(menu.code);
                                    }}
                                    className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 ${
                                      isPinned
                                        ? 'text-red-700 dark:text-red-400 hover:bg-red-100/70 dark:hover:bg-red-950/60'
                                        : 'text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100'
                                    }`}
                                    title={isPinned ? `Unpin ${menu.code}` : `Pin ${menu.code}`}
                                    aria-label={isPinned ? `Unpin ${menu.code}` : `Pin ${menu.code}`}
                                  >
                                    <Pin className={`h-3.5 w-3.5 ${isPinned ? 'fill-current' : ''}`} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'matrix' && (
              <LifecycleMatrixView
                onSelectCode={handleSelectCode}
                copiedCode={copiedCode}
                onCopyCode={handleCopyCode}
              />
            )}

            {activeTab === 'procedures' && (
              <ProceduresView
                onSelectCode={handleSelectCode}
                copiedCode={copiedCode}
                onCopyCode={handleCopyCode}
              />
            )}
          </main>

          {/* Desktop Persistent Contextual Inspector */}
          {selectedMenu && (
            <div className="no-print hidden xl:block xl:w-96 xl:shrink-0">
              <div className="sticky top-14 h-[calc(100vh-3.5rem)]">
                <MenuDetailDrawer
                  menu={selectedMenu}
                  onClose={() => setSelectedCode(null)}
                  onSelectCode={handleSelectCode}
                  isPinned={pinnedCodes.includes(selectedMenu.code)}
                  onTogglePin={handleTogglePin}
                  copiedCode={copiedCode}
                  onCopyCode={handleCopyCode}
                  personalNote={personalNotes[selectedMenu.code] ?? ''}
                  onSaveNote={handleSaveNote}
                  onOpenPdf={() => setIsPdfModalOpen(true)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Tab Bar (Thumb Zone, lg:hidden, compact h-14 + safe-area) */}
      <nav
        aria-label="Mobile primary navigation"
        className="no-print fixed bottom-0 left-0 right-0 z-30 lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pb-safe"
      >
        <div className="grid h-14 grid-cols-4 items-center">
          <button
            type="button"
            onClick={() => {
              setActiveTab('directory');
              if (activeScope === 'pinned') setActiveScope('all');
            }}
            className={`flex h-full flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === 'directory' && activeScope !== 'pinned'
                ? 'text-red-700 dark:text-red-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-tight">Menus</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('directory');
              setActiveScope('pinned');
            }}
            className={`flex h-full flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === 'directory' && activeScope === 'pinned'
                ? 'text-red-700 dark:text-red-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Pin className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-tight tabular-nums">
              Pinned ({pinnedCodes.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`flex h-full flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === 'matrix'
                ? 'text-red-700 dark:text-red-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Table2 className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-tight">Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('procedures')}
            className={`flex h-full flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === 'procedures'
                ? 'text-red-700 dark:text-red-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <ListChecks className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-tight">SOPs</span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Sheet / Tablet Slide-Over Inspector */}
      {selectedMenu && (
        <div
          className="no-print fixed inset-0 z-40 flex items-end sm:items-stretch sm:justify-end xl:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-[1px]"
            onClick={() => setSelectedCode(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full sm:max-w-md sm:h-full">
            <MenuDetailDrawer
              menu={selectedMenu}
              onClose={() => setSelectedCode(null)}
              onSelectCode={handleSelectCode}
              isPinned={pinnedCodes.includes(selectedMenu.code)}
              onTogglePin={handleTogglePin}
              copiedCode={copiedCode}
              onCopyCode={handleCopyCode}
              personalNote={personalNotes[selectedMenu.code] ?? ''}
              onSaveNote={handleSaveNote}
              onOpenPdf={() => setIsPdfModalOpen(true)}
              isMobileSheet
            />
          </div>
        </div>
      )}

      {/* Original 13-Page Source PDF Viewer Modal */}
      <SourcePdfModal isOpen={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)} />
    </div>
  );
}
