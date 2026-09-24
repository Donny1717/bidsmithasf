/**
 * Foundation Header — GOV.UK-style accessible application chrome (Phase 1).
 */
import React from 'react';
import { User } from 'firebase/auth';
import { GovButton, GovTag, focusRing } from './ui';
import type { FoundationSession } from '../../lib/foundationApi';

export type AppTab =
  | 'dashboard'
  | 'policies'
  | 'audit'
  | 'tender_scanner'
  | 'bid_builder'
  | 'doc_composition'
  | 'registry'
  | 'ai_assistant'
  | 'workspace_hub';

interface FoundationHeaderProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  user: User | null;
  session: FoundationSession | null;
  onSignOut: () => void;
  isSyncing: boolean;
  onTriggerSync: () => void;
  onExportCsv: () => void;
  onOpenSystemModal: () => void;
  onOpenDatabaseModal: () => void;
  onOpenBrandingModal: () => void;
}

const NAV_ITEMS: { id: AppTab; label: string; group: 'foundation' | 'tools' }[] = [
  { id: 'dashboard', label: 'Dashboard', group: 'foundation' },
  { id: 'policies', label: 'Policy Registry', group: 'foundation' },
  { id: 'audit', label: 'Audit Trail', group: 'foundation' },
  { id: 'tender_scanner', label: 'Tender Scanner', group: 'tools' },
  { id: 'bid_builder', label: 'Bid Builder', group: 'tools' },
  { id: 'doc_composition', label: 'Composition', group: 'tools' },
  { id: 'registry', label: 'Documents', group: 'tools' },
  { id: 'ai_assistant', label: 'Policy Assistant', group: 'tools' },
  { id: 'workspace_hub', label: 'Workspace Hub', group: 'tools' },
];

export const FoundationHeader: React.FC<FoundationHeaderProps> = ({
  activeTab,
  onSelectTab,
  user,
  session,
  onSignOut,
  isSyncing,
  onTriggerSync,
  onExportCsv,
  onOpenSystemModal,
  onOpenDatabaseModal,
  onOpenBrandingModal,
}) => {
  const primaryRole = session?.memberships?.[0]?.roleLabel ?? 'Unassigned';
  const orgName = session?.memberships?.[0]?.organisationName ?? '';

  return (
    <header className="border-b-2 border-slate-300 bg-white">
      <a
        href="#main-content"
        className={
          'sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:bg-[#0b0c0c] focus:text-white focus:px-4 focus:py-2 focus:font-bold ' +
          focusRing
        }
      >
        Skip to main content
      </a>

      {/* GOV.UK black top strip */}
      <div className="bg-[#0b0c0c] text-white px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-tight">BidSmith ASF</span>
          <GovTag tone="blue">Phase 1 · Foundation</GovTag>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {user ? (
            <>
              <span className="font-medium">
                {user.displayName || user.email}
                <span className="opacity-70"> · {primaryRole}</span>
                {orgName && <span className="opacity-70"> · {orgName}</span>}
              </span>
              <button
                type="button"
                onClick={onSignOut}
                className={'underline font-bold hover:text-slate-300 ' + focusRing}
              >
                Sign out
              </button>
            </>
          ) : (
            <span>Not signed in</span>
          )}
        </div>
      </div>

      {/* Primary navigation */}
      <nav aria-label="Primary" className="px-4 py-2 border-b border-slate-200 flex flex-wrap gap-x-1 gap-y-1">
        {(['foundation', 'tools'] as const).map((group) => (
          <React.Fragment key={group}>
            {group === 'tools' && (
              <span aria-hidden="true" className="self-center mx-2 text-slate-300 select-none">
                |
              </span>
            )}
            {NAV_ITEMS.filter((n) => n.group === group).map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => onSelectTab(item.id)}
                  className={
                    'px-3 py-1.5 text-sm font-bold rounded-sm transition-colors ' +
                    focusRing +
                    ' ' +
                    (active
                      ? 'bg-[#1d70b8] text-white'
                      : 'text-[#0b0c0c] hover:bg-slate-100')
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </nav>

      {/* Toolbar */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-2 bg-slate-50 border-b border-slate-200">
        <GovButton variant="secondary" onClick={onTriggerSync} disabled={isSyncing} aria-label="Synchronise the procurement registry">
          {isSyncing ? 'Syncing…' : 'Sync registry'}
        </GovButton>
        <GovButton variant="secondary" onClick={onExportCsv} aria-label="Export the registry index as CSV">
          Export CSV
        </GovButton>
        <GovButton variant="secondary" onClick={onOpenSystemModal} aria-label="Open system engine status">
          System
        </GovButton>
        <GovButton variant="secondary" onClick={onOpenDatabaseModal} aria-label="Open database configuration">
          Database
        </GovButton>
        <GovButton variant="secondary" onClick={onOpenBrandingModal} aria-label="Open workspace branding settings">
          Branding
        </GovButton>
      </div>
    </header>
  );
};
