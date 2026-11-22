import React from 'react';
import {
  BookOpen,
  Table2,
  ListChecks,
  Pin,
  ShieldCheck,
  Layers,
  X,
} from 'lucide-react';
import { MENU_CATEGORIES, FINACLE_MENUS } from '../data/finacleMenus';
import { MenuCategoryId } from '../types/finacle';

export type WorkspaceTab = 'directory' | 'matrix' | 'procedures';
export type DirectoryScope = 'all' | 'pinned' | 'auditor' | MenuCategoryId;

interface SidebarProps {
  activeTab: WorkspaceTab;
  onChangeTab: (tab: WorkspaceTab) => void;
  activeScope: DirectoryScope;
  onSelectScope: (scope: DirectoryScope) => void;
  pinnedCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const GROUPS = [
  'Customer & Core',
  'Deposit Schemes',
  'Loans',
  'Operations & Clearing',
  'Reports & Audit',
] as const;

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onChangeTab,
  activeScope,
  onSelectScope,
  pinnedCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  const auditorCount = FINACLE_MENUS.filter((m) => m.isAuditorMenu).length;

  const getCategoryCount = (catId: MenuCategoryId) =>
    FINACLE_MENUS.filter((m) => m.categories.includes(catId)).length;

  const handleScopeClick = (scope: DirectoryScope) => {
    onChangeTab('directory');
    onSelectScope(scope);
    onCloseMobile();
  };

  const handleTabClick = (tab: WorkspaceTab) => {
    onChangeTab(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 shrink-0">
        <button
          type="button"
          onClick={() => handleScopeClick('all')}
          className="flex items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-md bg-red-700 text-xs font-bold text-white shrink-0 font-mono"
            aria-hidden="true"
          >
            DOP
          </span>
          <span className="font-display text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
            Finacle Menu Desk
          </span>
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Close navigation menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Scrollable Navigation */}
      <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 pb-safe space-y-6" aria-label="Workspace navigation">
        {/* Primary Views */}
        <div>
          <div className="px-2 pb-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
            Workbench
          </div>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => handleTabClick('directory')}
              className={`flex min-h-[44px] lg:min-h-0 w-full items-center justify-between rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
                activeTab === 'directory' && activeScope === 'all'
                  ? 'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <BookOpen className="h-4 w-4 shrink-0" />
                <span className="truncate">Menu Directory</span>
              </span>
              <span className="font-mono text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                {FINACLE_MENUS.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('matrix')}
              className={`flex min-h-[44px] lg:min-h-0 w-full items-center justify-between rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
                activeTab === 'matrix'
                  ? 'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Table2 className="h-4 w-4 shrink-0" />
                <span className="truncate">Lifecycle Matrix</span>
              </span>
              <span className="font-mono text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                9
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('procedures')}
              className={`flex min-h-[44px] lg:min-h-0 w-full items-center justify-between rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
                activeTab === 'procedures'
                  ? 'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <ListChecks className="h-4 w-4 shrink-0" />
                <span className="truncate">SOP Checklists</span>
              </span>
              <span className="font-mono text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                9
              </span>
            </button>
          </div>
        </div>

        {/* Quick Collections */}
        <div>
          <div className="px-2 pb-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
            Quick Views
          </div>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => handleScopeClick('all')}
              className={`flex min-h-[44px] lg:min-h-0 w-full items-center justify-between rounded-md px-2.5 py-2 lg:py-1.5 text-sm lg:text-xs font-medium transition-colors ${
                activeTab === 'directory' && activeScope === 'all'
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <Layers className="h-4 w-4 lg:h-3.5 lg:w-3.5 shrink-0" />
                <span className="truncate">All DOP Menus</span>
              </span>
              <span className="font-mono text-xs lg:text-[11px] text-slate-400 tabular-nums">
                {FINACLE_MENUS.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleScopeClick('pinned')}
              className={`flex min-h-[44px] lg:min-h-0 w-full items-center justify-between rounded-md px-2.5 py-2 lg:py-1.5 text-sm lg:text-xs font-medium transition-colors ${
                activeTab === 'directory' && activeScope === 'pinned'
                  ? 'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <Pin className="h-4 w-4 lg:h-3.5 lg:w-3.5 shrink-0" />
                <span className="truncate">Pinned Favorites</span>
              </span>
              <span className="font-mono text-xs lg:text-[11px] text-slate-400 tabular-nums">
                {pinnedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleScopeClick('auditor')}
              className={`flex min-h-[44px] lg:min-h-0 w-full items-center justify-between rounded-md px-2.5 py-2 lg:py-1.5 text-sm lg:text-xs font-medium transition-colors ${
                activeTab === 'directory' && activeScope === 'auditor'
                  ? 'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <ShieldCheck className="h-4 w-4 lg:h-3.5 lg:w-3.5 shrink-0" />
                <span className="truncate">Auditor Menu Suite</span>
              </span>
              <span className="font-mono text-xs lg:text-[11px] text-slate-400 tabular-nums">
                {auditorCount}
              </span>
            </button>
          </div>
        </div>

        {/* Module Categories */}
        {GROUPS.map((group) => {
          const items = MENU_CATEGORIES.filter((c) => c.group === group);
          return (
            <div key={group}>
              <div className="px-2 pb-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
                {group}
              </div>
              <div className="space-y-0.5">
                {items.map((cat) => {
                  const isActive = activeTab === 'directory' && activeScope === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleScopeClick(cat.id)}
                      className={`flex min-h-[44px] lg:min-h-0 w-full items-center justify-between rounded-md px-2.5 py-2 lg:py-1.5 text-sm lg:text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      <span className="truncate">{cat.label}</span>
                      <span className="font-mono text-xs lg:text-[11px] text-slate-400 dark:text-slate-500 tabular-nums ml-2 shrink-0">
                        {getCategoryCount(cat.id)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="no-print hidden lg:block lg:w-64 lg:shrink-0">
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="no-print fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 w-80 max-w-[86vw] h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
