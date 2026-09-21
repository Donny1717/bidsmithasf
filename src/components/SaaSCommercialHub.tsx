import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Users,
  ShieldCheck,
  Building,
  Settings,
  Key,
  Layers,
  ArrowRight,
  UserPlus,
  Trash2,
  Mail,
  Globe,
  Sliders,
  Check,
  Lock,
} from 'lucide-react';
import { SaaSTier, SaaSTierId, TeamMember, WhiteLabelSettings } from '../types';

interface SaaSCommercialHubProps {
  whiteLabel: WhiteLabelSettings;
  onUpdateWhiteLabel: (settings: WhiteLabelSettings) => void;
}

const SAAS_TIERS: SaaSTier[] = [
  {
    id: 'free',
    name: 'Starter Plan',
    tagline: 'Essential AI tender scanning for small suppliers and contractors.',
    monthlyPriceGbp: 49,
    annualPriceGbp: 470,
    targetUser: 'SMEs and independent contractors entering UK public procurement.',
    buttonLabel: 'Select Starter Plan',
    features: [
      '5 Tender & RFP Compliance Scans / month',
      '25,000 AI Generated Words / month',
      'Browse all GOV.UK PPNs & Procurement Act 2023 guidance',
      'Standard PDF & Markdown Exports',
      'Standard Email Support',
    ],
  },
  {
    id: 'pro_bidder',
    name: 'Growth Plan',
    tagline: 'Full AI Bid Writer, Full Document Quality Audit, and Microsoft Word (.docx) export.',
    monthlyPriceGbp: 129,
    annualPriceGbp: 1235,
    targetUser: 'Growing contractors and dedicated bid teams tendering for major public contracts.',
    badge: 'Most Popular for Bid Teams',
    buttonLabel: 'Upgrade to Growth Plan',
    features: [
      '20 Tender & RFP Compliance Matrix Scans / month',
      '100,000 AI Generated Words / month',
      'Full Document Quality & Grammar Audit Engine',
      'Export formatted Microsoft Word (.docx) proposals',
      'Autosave & Cloud Version History Snapshots',
      '1-Click Export to Google Docs & Google Tasks',
      'Priority AI Policy Advisor queries',
    ],
  },
  {
    id: 'enterprise_authority',
    name: 'Enterprise Plan',
    tagline: 'Multi-seat team workspace, custom white-label branding, and dedicated procurement support.',
    monthlyPriceGbp: 399,
    annualPriceGbp: 3830,
    targetUser: 'Large enterprises, prime contractors, and public sector advisory consultancies.',
    badge: 'For Enterprise & Consultancies',
    buttonLabel: 'Deploy Enterprise Suite',
    features: [
      'Unlimited Tender & RFP Compliance Scans',
      '500,000 AI Generated Words / month',
      'Multi-Seat Team Workspace (Bid Writer, Technical Reviewer, Director)',
      'Custom White-Label Branding (Logos, Accent Colors & Ref Prefixes)',
      'Commercial-in-Confidence UK GDPR Data Shield',
      'REST API Integration for Jaggaer, Atamis, SAP Ariba',
      'Dedicated Account Manager & Legal Compliance SLA',
    ],
  },
];

const INITIAL_TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'Marcus Vance',
    email: 'marcus.vance@gov-procure.co.uk',
    role: 'Admin / Commercial Director',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Elena Rostova',
    email: 'e.rostova@gov-procure.co.uk',
    role: 'Senior Bid Writer',
    status: 'Active',
  },
  {
    id: '3',
    name: 'David Chen',
    email: 'david.chen@gov-procure.co.uk',
    role: 'Legal Compliance Officer',
    status: 'Active',
  },
];

export function SaaSCommercialHub({ whiteLabel, onUpdateWhiteLabel }: SaaSCommercialHubProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [selectedTier, setSelectedTier] = useState<SaaSTierId>('pro_bidder');
  const [activeSubTab, setActiveSubTab] = useState<'pricing' | 'team' | 'whitelabel' | 'api'>('pricing');

  // Team management state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<TeamMember['role']>('Senior Bid Writer');

  // White label local state
  const [wlCompany, setWlCompany] = useState(whiteLabel.companyName);
  const [wlHeader, setWlHeader] = useState(whiteLabel.reportHeaderTitle);
  const [wlPrefix, setWlPrefix] = useState(whiteLabel.referencePrefix);
  const [wlColor, setWlColor] = useState(whiteLabel.accentColor);
  const [wlWatermark, setWlWatermark] = useState(whiteLabel.complianceWatermark);
  const [wlSavedNotification, setWlSavedNotification] = useState(false);

  // Simulated Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<boolean>(false);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole,
      status: 'Active',
    };

    setTeamMembers([...teamMembers, newMember]);
    setNewMemberName('');
    setNewMemberEmail('');
  };

  const handleRemoveMember = (id: string) => {
    setTeamMembers(teamMembers.filter((m) => m.id !== id));
  };

  const handleSaveWhiteLabel = () => {
    onUpdateWhiteLabel({
      companyName: wlCompany,
      reportHeaderTitle: wlHeader,
      referencePrefix: wlPrefix,
      accentColor: wlColor,
      complianceWatermark: wlWatermark,
    });
    setWlSavedNotification(true);
    setTimeout(() => setWlSavedNotification(false), 3000);
  };

  const handleOpenCheckout = (tierId: SaaSTierId) => {
    setSelectedTier(tierId);
    setShowCheckoutModal(true);
    setCheckoutSuccess(false);
  };

  const handleSimulatePayment = () => {
    setTimeout(() => {
      setCheckoutSuccess(true);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* SaaS Hub Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800 mb-2">
              <Building className="h-3.5 w-3.5 text-blue-700" />
              <span>Commercial SaaS Management & Enterprise Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              BidSmith ASF Commercial & Workspace Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
              Configure subscription tiers, manage organization seats, customize white-label compliance reports, and review enterprise API integrations for UK public sector buyers and bidders.
            </p>
          </div>

          {/* Sub-nav Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveSubTab('pricing')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                activeSubTab === 'pricing'
                  ? 'bg-blue-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              Plans & Pricing
            </button>

            <button
              onClick={() => setActiveSubTab('team')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                activeSubTab === 'team'
                  ? 'bg-blue-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Team Workspace ({teamMembers.length})
            </button>

            <button
              onClick={() => setActiveSubTab('whitelabel')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                activeSubTab === 'whitelabel'
                  ? 'bg-blue-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              White-Label Branding
            </button>

            <button
              onClick={() => setActiveSubTab('api')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                activeSubTab === 'api'
                  ? 'bg-blue-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Key className="h-3.5 w-3.5" />
              Portal API Keys
            </button>

            <button
              onClick={() => setActiveSubTab('gdpr')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                activeSubTab === 'gdpr'
                  ? 'bg-blue-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              GDPR & Data Privacy
            </button>
          </div>
        </div>
      </div>

      {/* Usage Metering Status Bar */}
      <div className="rounded-2xl border border-indigo-200 bg-linear-to-r from-indigo-50/80 via-blue-50/50 to-white p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Growth Plan Active Usage Metering
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-600">
            Billing Cycle Renews: <strong>October 1, 2026</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Meter 1: AI Generated Words */}
          <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span>AI Generated Words</span>
              <span className="font-mono text-indigo-700">18,450 / 100,000 Words (18%)</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: '18.45%' }} />
            </div>
          </div>

          {/* Meter 2: Tender Compliance Scans */}
          <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span>Tender Compliance Matrix Scans</span>
              <span className="font-mono text-blue-700">4 / 20 Scans (20%)</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '20%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* SubTab 1: Pricing Tiers & Billing */}
      {activeSubTab === 'pricing' && (
        <div className="space-y-6">
          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span
              className={`text-xs font-bold ${
                billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500'
              }`}
            >
              Monthly Billing
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-slate-200 transition-colors duration-200 ease-in-out focus:outline-none"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-blue-800 shadow ring-0 transition duration-200 ease-in-out ${
                  billingCycle === 'annual' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-xs font-bold flex items-center gap-1.5 ${
                billingCycle === 'annual' ? 'text-slate-900' : 'text-slate-500'
              }`}
            >
              Annual Billing
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Save 20%
              </span>
            </span>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SAAS_TIERS.map((tier) => {
              const price = billingCycle === 'annual' ? Math.round(tier.annualPriceGbp / 12) : tier.monthlyPriceGbp;
              const isPro = tier.id === 'pro_bidder';
              const isEnterprise = tier.id === 'enterprise_authority';

              return (
                <div
                  key={tier.id}
                  className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-200 bg-white ${
                    isPro
                      ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg relative'
                      : isEnterprise
                      ? 'border-indigo-300 shadow-md'
                      : 'border-slate-200 shadow-2xs'
                  }`}
                >
                  {tier.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-800 px-3.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                      {tier.badge}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                      <p className="text-xs text-slate-600 mt-1 min-h-[32px]">{tier.tagline}</p>
                    </div>

                    {/* Price */}
                    <div className="border-y border-slate-100 py-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900">£{price}</span>
                        <span className="text-xs text-slate-500 font-semibold">/ month</span>
                      </div>
                      {billingCycle === 'annual' && tier.annualPriceGbp > 0 && (
                        <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
                          Billed annually (£{tier.annualPriceGbp} / year)
                        </span>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="space-y-2.5">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                        Included Capabilities:
                      </span>
                      {tier.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="h-3.5 w-3.5 text-blue-700 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-8">
                    <button
                      onClick={() => handleOpenCheckout(tier.id)}
                      className={`w-full rounded-xl py-3 text-xs font-bold transition shadow-2xs ${
                        isPro
                          ? 'bg-blue-800 text-white hover:bg-blue-900'
                          : isEnterprise
                          ? 'bg-indigo-800 text-white hover:bg-indigo-900'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {tier.buttonLabel}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SubTab 2: Multi-Seat Team Workspace */}
      {activeSubTab === 'team' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Member List */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-700" />
                Active Organization Members
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                {teamMembers.length} / 25 Seats Allocated
              </span>
            </div>

            <div className="space-y-2.5">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-800 text-xs">
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{member.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <Mail className="h-3 w-3" /> {member.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-white border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-2xs">
                      {member.role}
                    </span>
                    {member.id !== '1' && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition"
                        title="Remove member"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Member Form */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-emerald-700" />
              Invite Team Member
            </h3>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name:</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-800 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address:</label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="e.g. s.jenkins@company.co.uk"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-800 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Role:</label>
                <select
                  value={newMemberRole}
                  onChange={(e: any) => setNewMemberRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-800 focus:bg-white focus:outline-none"
                >
                  <option value="Senior Bid Writer">Senior Bid Writer (Tender Scanner & Drafts)</option>
                  <option value="Legal Compliance Officer">Legal Compliance Officer (Statutory Audits)</option>
                  <option value="Procurement Lead">Procurement Lead (Authority Buyer Duties)</option>
                  <option value="Admin / Commercial Director">Admin / Commercial Director (Full Access)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-800 py-2.5 text-xs font-bold text-white hover:bg-blue-900 transition shadow-2xs"
              >
                Send Workspace Invitation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SubTab 3: White-Label Customization */}
      {activeSubTab === 'whitelabel' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-2xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="h-4 w-4 text-blue-700" />
              White-Label Report & Export Branding
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Customize the headers, watermarks, and reference codes attached to your Google Docs and PDF compliance memos for client presentation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Organization / Consultancy Name:
              </label>
              <input
                type="text"
                value={wlCompany}
                onChange={(e) => setWlCompany(e.target.value)}
                placeholder="e.g. Apex Public Sector Bid Advisory Ltd"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-800 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Report Title Header:
              </label>
              <input
                type="text"
                value={wlHeader}
                onChange={(e) => setWlHeader(e.target.value)}
                placeholder="e.g. STATUTORY PROCUREMENT COMPLIANCE AUDIT"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-800 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Compliance Reference Prefix:
              </label>
              <input
                type="text"
                value={wlPrefix}
                onChange={(e) => setWlPrefix(e.target.value)}
                placeholder="e.g. APEX-AUDIT-2026"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-800 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Primary Brand Accent Color:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={wlColor}
                  onChange={(e) => setWlColor(e.target.value)}
                  className="h-8 w-12 rounded cursor-pointer border border-slate-200 bg-transparent"
                />
                <input
                  type="text"
                  value={wlColor}
                  onChange={(e) => setWlColor(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {wlSavedNotification ? (
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> White-label branding saved and applied!
              </span>
            ) : (
              <span className="text-xs text-slate-500 font-medium">
                Changes apply instantly across PDF and Google Docs exports.
              </span>
            )}

            <button
              type="button"
              onClick={handleSaveWhiteLabel}
              className="rounded-xl bg-blue-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-900 transition shadow-2xs"
            >
              Save Branding Settings
            </button>
          </div>
        </div>
      )}

      {/* SubTab 5: GDPR & Data Privacy & Security */}
      {activeSubTab === 'gdpr' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-2xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              UK GDPR, Data Isolation & Commercial-in-Confidence Guarantee
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Statutory compliance framework guaranteeing that proprietary pricing, tender drafts, and company assets are strictly isolated and never trained on public AI models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Zero Model Training Shield</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                All uploaded tender packs and generated bid drafts pass through ephemeral API pipelines with zero data retention for AI model training.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>UK GDPR & Data Sovereignty</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Primary data storage resides in London Cloud Regions (UK West/Europe) complying with Data Protection Act 2018 and UK GDPR standards.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>API Rate Limiting & Shield</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Active 120 RPM rate-limiting and sanitized payload validation to protect against automated scraping and abnormal server usage.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 text-xs">
            <div className="font-extrabold text-indigo-300">Statutory Commercial-in-Confidence Statement (Crown Commercial Service Compliant)</div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              "BidSmith ASF certifies that all trade secrets, financial models, pricing schedules, and tender submission drafts uploaded or synthesized on this system remain the exclusive property of the client organization. Information is protected under Section 43 (Commercial Interests) of the Freedom of Information Act 2000."
            </p>
          </div>
        </div>
      )}

      {/* Simulated Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            {!checkoutSuccess ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-800" />
                    Stripe Commercial Checkout
                  </h3>
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>

                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-1">
                  <div className="text-xs text-slate-500 font-medium">Selected SaaS Subscription:</div>
                  <div className="text-sm font-bold text-slate-900 capitalize">
                    {selectedTier.replace('_', ' ')} Plan
                  </div>
                  <div className="text-xs font-bold text-emerald-800">
                    {billingCycle === 'annual' ? 'Annual Billing (20% Off)' : 'Monthly Billing'}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Card Details:</label>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 font-mono flex items-center justify-between">
                      <span>•••• •••• •••• 4242</span>
                      <span>12/28 • CVC 123</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Test Mode Simulator. Connects directly to UK Stripe Billing endpoint in live production.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  className="w-full rounded-xl bg-blue-800 py-3 text-xs font-bold text-white hover:bg-blue-900 transition shadow-2xs"
                >
                  Confirm & Activate Subscription
                </button>
              </>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Subscription Activated!</h4>
                <p className="text-xs text-slate-600">
                  Your team now has full Pro / Enterprise access with unlimited tender scans and white-label report exports.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="mt-4 w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 border border-slate-200"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
