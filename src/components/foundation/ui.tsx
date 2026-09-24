/**
 * GOV.UK-inspired UI primitives — accessible by default (WCAG 2.2 AA target).
 * Focus is always visible; colour contrast >= 4.5:1; semantic markup.
 */
import React from 'react';

export const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400';

export const GovButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'warning' }
> = ({ variant = 'primary', className = '', children, ...rest }) => {
  const styles: Record<string, string> = {
    primary: 'bg-[#1d70b8] text-white hover:bg-[#003a63]',
    secondary: 'bg-white text-[#0b0c0c] border-2 border-[#0b0c0c] hover:bg-slate-100',
    warning: 'bg-[#b0392b] text-white hover:bg-[#8a241b]',
  };
  return (
    <button
      {...rest}
      className={
        'inline-flex items-center justify-center gap-2 rounded-sm px-5 py-2.5 text-sm font-bold ' +
        'transition-colors disabled:opacity-50 disabled:cursor-not-allowed ' +
        focusRing +
        ' ' +
        styles[variant] +
        ' ' +
        className
      }
    >
      {children}
    </button>
  );
};

export const GovTag: React.FC<{ children: React.ReactNode; tone?: 'blue' | 'green' | 'red' | 'grey' }> = ({
  children,
  tone = 'grey',
}) => {
  const tones: Record<string, string> = {
    blue: 'bg-[#e8f1f8] text-[#144e81] border-[#1d70b8]',
    green: 'bg-emerald-50 text-emerald-900 border-emerald-600',
    red: 'bg-red-50 text-red-900 border-red-700',
    grey: 'bg-slate-100 text-slate-800 border-slate-400',
  };
  return (
    <span
      className={
        'inline-block rounded-sm border px-2 py-0.5 text-xs font-bold uppercase tracking-wide ' + tones[tone]
      }
    >
      {children}
    </span>
  );
};

export const GovPanel: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({
  title,
  children,
  className = '',
}) => (
  <section
    className={
      'border-2 border-slate-300 border-t-8 border-t-[#0b0c0c] bg-white p-5 rounded-sm ' + className
    }
  >
    {title && <h2 className="text-lg font-bold text-[#0b0c0c] mb-3">{title}</h2>}
    {children}
  </section>
);

export const ErrorSummary: React.FC<{
  title?: string;
  errors: { id: string; message: string }[];
  onFix?: (id: string) => void;
}> = ({ title = 'There is a problem', errors, onFix }) => {
  if (!errors.length) return null;
  return (
    <div
      role="alert"
      tabIndex={-1}
      className="border-4 border-[#b0392b] bg-white p-4 mb-5 rounded-sm"
    >
      <h2 className="text-lg font-bold text-[#0b0c0c] mb-2">{title}</h2>
      <ul className="list-disc pl-5 space-y-1">
        {errors.map((e) => (
          <li key={e.id}>
            {onFix ? (
              <button
                type="button"
                onClick={() => onFix(e.id)}
                className={'text-[#b0392b] underline font-bold ' + focusRing}
              >
                {e.message}
              </button>
            ) : (
              <span className="text-[#b0392b] font-bold">{e.message}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const StatusBanner: React.FC<{ tone: 'success' | 'error' | 'info'; children: React.ReactNode }> = ({
  tone,
  children,
}) => {
  const tones = {
    success: 'border-emerald-700 bg-emerald-50 text-emerald-900',
    error: 'border-[#b0392b] bg-red-50 text-red-900',
    info: 'border-[#1d70b8] bg-[#e8f1f8] text-[#144e81]',
  };
  return (
    <div role="status" aria-live="polite" className={'border-l-4 p-3 text-sm font-medium rounded-sm ' + tones[tone]}>
      {children}
    </div>
  );
};
