import React, { useState } from 'react';
import {
  Building,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Globe,
  FileText,
  ExternalLink,
  Lock,
  CheckCircle,
  HelpCircle,
  X,
} from 'lucide-react';

export function AppFooter() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (title: string) => {
    setActiveModal(title);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      <footer className="mt-20 border-t border-slate-200 bg-white text-slate-600 text-xs">
        {/* Main Footer Grid */}
        <div className="w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Column 1: Company Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-800 flex items-center justify-center text-white font-black text-sm shadow-2xs">
                  BS
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm tracking-tight block">
                    BidSmith ASF
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    UK Public Procurement & Tender Intelligence Suite • Honey-B2024 Ltd
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                <p className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                  <span>
                    86-90 Paul Street<br />
                    London EC2A 4NE<br />
                    United Kingdom
                  </span>
                </p>
                <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-500 font-mono">
                  <p>
                    <strong className="text-slate-700">PPON:</strong> PLLZ-1139-QCCD
                  </p>
                  <p>
                    <strong className="text-slate-700">Company No:</strong> 15744305 (Registered in England & Wales)
                  </p>
                  <p>
                    <strong className="text-slate-700">ICO Registration:</strong> ZC178845
                  </p>
                </div>
              </div>

              {/* Contact Details */}
              <div className="pt-2 space-y-1 text-xs text-slate-700">
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-blue-700" />
                  <a href="mailto:Info@honeyb2024.tech" className="hover:text-blue-900 font-medium transition">
                    Info@honeyb2024.tech
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-blue-700" />
                  <a href="mailto:info@bidsmithasf.co.uk" className="hover:text-blue-900 font-medium transition">
                    info@bidsmithasf.co.uk
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-blue-700" />
                  <span>Office: +44 20 3657 3796</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-blue-700" />
                  <span>Office: +44 20 3757 2499</span>
                </p>
              </div>
            </div>

            {/* Column 2: Solutions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Solutions
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li><span className="hover:text-blue-800 cursor-pointer" onClick={() => openModal('Technology Solutions')}>Technology</span></li>
                <li><span className="hover:text-blue-800 cursor-pointer" onClick={() => openModal('Industry Capabilities')}>Industries</span></li>
                <li><span className="hover:text-blue-800 cursor-pointer" onClick={() => openModal('Knowledge Centre')}>Knowledge Centre</span></li>
                <li><span className="hover:text-blue-800 cursor-pointer" onClick={() => openModal('Case Studies')}>Case Studies</span></li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Company
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li><span className="hover:text-blue-800 cursor-pointer" onClick={() => openModal('About Honey-B2024 Ltd')}>About</span></li>
                <li><span className="hover:text-blue-800 cursor-pointer" onClick={() => openModal('Contact & Enquiries')}>Contact</span></li>
                <li><span className="hover:text-blue-800 cursor-pointer" onClick={() => openModal('Team & Governance')}>Team</span></li>
                <li><span className="hover:text-blue-800 cursor-pointer" onClick={() => openModal('Careers at Honey-B2024')}>Careers</span></li>
              </ul>

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 pt-3">
                Accessibility
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                <li><span className="hover:text-blue-800 cursor-pointer" onClick={() => openModal('Accessibility Statement')}>Accessibility statement</span></li>
                <li><span className="hover:text-blue-800 cursor-pointer" onClick={() => openModal('Language & Localization')}>Language & Options</span></li>
              </ul>
            </div>

            {/* Column 4: Legal & Governance */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Legal & Governance
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li><span className="hover:text-blue-800 cursor-pointer" onClick={() => openModal('Privacy Policy')}>Privacy Policy</span></li>
                <li><span className="hover:text-blue-800 cursor-pointer" onClick={() => openModal('Terms & Conditions')}>Terms & Conditions</span></li>
                <li><span className="hover:text-blue-800 cursor-pointer" onClick={() => openModal('GDPR & Data Protection')}>GDPR & Data Protection</span></li>
                <li><span className="hover:text-blue-800 cursor-pointer" onClick={() => openModal('Public Sector Compliance')}>Public Sector Compliance</span></li>
                <li><span className="hover:text-blue-800 cursor-pointer" onClick={() => openModal('Cookie Settings')}>Cookie settings</span></li>
              </ul>

              <div className="pt-2 flex items-center gap-2">
                <span className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] px-2 py-1 font-mono font-bold inline-block">
                  ICO: ZC178845
                </span>
              </div>
            </div>
          </div>

          {/* Official UK Open Government Licence (OGL v3.0) Banner - Standard GOV.UK Footer Layout */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-slate-700">
            <a
              href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 hover:opacity-80 transition"
              title="Open Government Licence v3.0 (National Archives)"
            >
              <svg
                viewBox="0 0 483.2 195.7"
                className="h-7 w-auto fill-slate-900"
                aria-label="OGL - Open Government Licence"
              >
                <polygon points="421.5,142.8 421.5,0.1 370.8,32.4 370.8,193.5 483.2,193.5 483.2,142.8 " />
                <path d="M299.2,133.2c-8.3,7.3-19.2,11.7-31.1,11.7c-26,0-47.1-21.1-47.1-47.1s21.1-47.1,47.1-47.1c16.7,0,31.4,8.7,39.7,21.8l42.7-27.2C333.2,18.1,302.7,0,268.1,0c-36.5,0-68.3,20.1-85.1,49.7C166.2,20.1,134.3,0,97.8,0C43.9,0,0,43.9,0,97.8s43.9,97.8,97.8,97.8c36.5,0,68.3-20.1,85.1-49.7c16.8,29.7,48.7,49.7,85.1,49.7c24.7,0,47.3-9.2,64.5-24.3l19.4,22.2h3v-87.8h-80L299.2,133.2z M97.8,145c-26,0-47.1-21.1-47.1-47.1s21.1-47.1,47.1-47.1S145,71.8,145,97.8S123.8,145,97.8,145" />
              </svg>
            </a>
            <p className="text-slate-700 text-xs sm:text-[13px] leading-relaxed font-normal">
              All content is available under the{' '}
              <a
                href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-900 hover:text-blue-800 underline underline-offset-2 transition"
              >
                Open Government Licence v3.0
              </a>
              , except where otherwise stated
            </p>
          </div>

          {/* Bottom Copyright & Legal Terms Strip */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <p>
              © {new Date().getFullYear()} Honey-B2024 Ltd. All rights reserved. Registered in England & Wales (Company No. 15744305).
            </p>
            <div className="flex items-center gap-4 text-slate-500 font-medium">
              <span className="hover:text-blue-800 cursor-pointer" onClick={() => openModal('Privacy Policy')}>Privacy</span>
              <span>•</span>
              <span className="hover:text-blue-800 cursor-pointer" onClick={() => openModal('Terms & Conditions')}>Terms</span>
              <span>•</span>
              <span className="hover:text-blue-800 cursor-pointer" onClick={() => openModal('Public Sector Compliance')}>Procurement Compliance</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Info / Policy Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-700" />
                {activeModal}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2.5 max-h-[60vh] overflow-y-auto leading-relaxed">
              <p>
                <strong className="text-slate-900">Honey-B2024 Ltd</strong> (Company No. 15744305, PPON: PLLZ-1139-QCCD) operates statutory compliance and tender intelligence tools in full adherence with UK GDPR, Data Protection Act 2018, and Information Commissioner's Office registration <strong className="text-slate-900">ZC178845</strong>.
              </p>
              <p>
                For official commercial inquiries, contract execution, or regulatory governance regarding <strong className="text-slate-900">{activeModal}</strong>, please reach out to our legal and commercial compliance desk:
              </p>
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 font-mono text-[11px] text-slate-700 space-y-1">
                <div>Email: <a href="mailto:Info@honeyb2024.tech" className="text-blue-700 underline font-semibold">Info@honeyb2024.tech</a> | <a href="mailto:info@bidsmithasf.co.uk" className="text-blue-700 underline font-semibold">info@bidsmithasf.co.uk</a></div>
                <div>Office: +44 20 3657 3796 | +44 20 3757 2499</div>
                <div>Address: 86-90 Paul Street, London EC2A 4NE, United Kingdom</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={closeModal}
                className="rounded-xl bg-blue-800 px-4 py-2 text-xs font-bold text-white hover:bg-blue-900 transition shadow-2xs"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
