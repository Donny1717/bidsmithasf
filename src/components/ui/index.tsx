// UI Component Library for BidSmith ASF
// Modern, Reusable Components with Tailwind CSS

import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreVertical,
  Edit3,
  Trash2,
  Copy,
  Download,
  Eye,
  EyeOff,
  Star,
  Heart,
  Plus,
  Minus,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  FileText,
  FileCheck,
  Clock,
  Calendar,
  User,
  Users,
  Building2,
  Tag,
  BarChart3,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

// ============================================
// BUTTON COMPONENTS
// ============================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2 rounded-xl 
      font-bold transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variants = {
      primary: `
        bg-blue-600 text-white
        hover:bg-blue-700
        focus:ring-blue-500
        active:bg-blue-800
      `,
      secondary: `
        bg-slate-100 text-slate-700
        hover:bg-slate-200
        focus:ring-slate-500
        active:bg-slate-300
      `,
      outline: `
        border-2 border-slate-300 bg-transparent text-slate-700
        hover:border-slate-400 hover:bg-slate-50
        focus:ring-slate-500
        active:bg-slate-100
      `,
      ghost: `
        bg-transparent text-slate-700
        hover:bg-slate-100
        focus:ring-slate-500
        active:bg-slate-200
      `,
      danger: `
        bg-red-600 text-white
        hover:bg-red-700
        focus:ring-red-500
        active:bg-red-800
      `,
      success: `
        bg-emerald-600 text-white
        hover:bg-emerald-700
        focus:ring-emerald-500
        active:bg-emerald-800
      `,
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-7 py-3 text-lg',
      xl: 'px-9 py-4 text-xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Icon Button
export const IconButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => (
    <Button 
      ref={ref} 
      {...props} 
      className={`p-2 ${props.className || ''}`}
    />
  )
);

IconButton.displayName = 'IconButton';

// ============================================
// CARD COMPONENTS
// ============================================

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
  clickable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      hoverable = false,
      clickable = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      rounded-2xl
      transition-all duration-200
    `;

    const variants = {
      default: 'bg-white',
      bordered: 'bg-white border border-slate-200',
      elevated: 'bg-white shadow-lg',
      glass: 'bg-white/80 backdrop-blur-lg border border-slate-200/50',
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    };

    const interactiveStyles = clickable || hoverable ? `
      cursor-pointer
      ${hoverable ? 'hover:shadow-xl hover:-translate-y-1' : ''}
      ${clickable ? 'active:scale-[0.98]' : ''}
    ` : '';

    return (
      <div
        ref={ref}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${paddings[padding]}
          ${interactiveStyles}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...props }, ref) => (
    <div 
      ref={ref}
      className={`mb-4 pb-4 border-b border-slate-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

// Card Content
export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

// Card Footer
export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...props }, ref) => (
    <div 
      ref={ref}
      className={`mt-4 pt-4 border-t border-slate-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';

// ============================================
// FORM COMPONENTS
// ============================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className = '',
      disabled,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    
    return (
      <div className={`w-full ${fullWidth ? '' : 'inline-block'}`}>
        {label && (
          <label 
            htmlFor={id}
            className="block text-sm font-bold text-slate-700 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            type={type}
            disabled={disabled}
            className={`
              w-full rounded-xl border bg-white px-4 py-3
              text-slate-700 placeholder:text-slate-400
              focus:outline-none focus:ring-2 focus:ring-offset-0
              ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}
              ${leftIcon ? 'pl-12' : ''}
              ${rightIcon ? 'pr-12' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-2 text-sm text-slate-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  fullWidth?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      fullWidth = true,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    
    return (
      <div className={`w-full ${fullWidth ? '' : 'inline-block'}`}>
        {label && (
          <label 
            htmlFor={id}
            className="block text-sm font-bold text-slate-700 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            disabled={disabled}
            className={`
              w-full rounded-xl border bg-white px-4 py-3
              text-slate-700 appearance-none
              focus:outline-none focus:ring-2 focus:ring-offset-0
              ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${className}
            `}
            {...props}
          >
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value} 
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-2 text-sm text-slate-500">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  rows?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      fullWidth = true,
      rows = 4,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    
    return (
      <div className={`w-full ${fullWidth ? '' : 'inline-block'}`}>
        {label && (
          <label 
            htmlFor={id}
            className="block text-sm font-bold text-slate-700 mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          disabled={disabled}
          className={`
            w-full rounded-xl border bg-white px-4 py-3
            text-slate-700 placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-offset-0
            resize-vertical
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-2 text-sm text-slate-500">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// ============================================
// ALERT & NOTIFICATION COMPONENTS
// ============================================

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  onClose?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const Alert = (
  {
    variant = 'info',
    title,
    message,
    onClose,
    icon,
    className = '',
  }:
  AlertProps
) => {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="h-5 w-5 text-blue-600" />,
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
    },
  };

  const config = variants[variant];

  return (
    <div
      className={`
        rounded-xl border p-4 flex items-start gap-4
        ${config.container}
        ${className}
      `}
      role="alert"
    >
      <div className="shrink-0">
        {icon || config.icon}
      </div>
      <div className="flex-1">
        {title && <h4 className="font-bold mb-1">{title}</h4>}
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 p-1 rounded-lg hover:bg-black/5 transition"
          aria-label="Close alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// Toast Notification
export const Toast = (
  {
    variant = 'info',
    message,
    onClose,
    className = '',
    duration = 5000,
  }:
  AlertProps & { duration?: number }
) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        fixed top-4 right-4 z-50
        rounded-xl border shadow-xl
        ${className}
      `}
    >
      <Alert variant={variant} message={message} onClose={onClose} />
    </motion.div>
  );
};

// ============================================
// BADGE & TAG COMPONENTS
// ============================================

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge = (
  {
    children,
    variant = 'default',
    size = 'md',
    dot = false,
    className = '',
    ...props
  }:
  BadgeProps
) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-blue-100 text-blue-700',
    secondary: 'bg-slate-200 text-slate-800',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-purple-100 text-purple-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-bold
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span 
          className={`
            w-1.5 h-1.5 rounded-full
            ${variant === 'success' ? 'bg-emerald-500' :
              variant === 'warning' ? 'bg-amber-500' :
              variant === 'danger' ? 'bg-red-500' :
              variant === 'info' ? 'bg-purple-500' :
              variant === 'primary' ? 'bg-blue-500' :
              'bg-slate-500'}
          `}
        />
      )}
      {children}
    </span>
  );
};

// ============================================
// PROGRESS & LOADING COMPONENTS
// ============================================

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  color?: 'blue' | 'emerald' | 'amber' | 'red' | 'purple';
}

export const Progress = (
  {
    value,
    max = 100,
    label,
    size = 'md',
    showPercentage = true,
    color = 'blue',
  }:
  ProgressProps
) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colorClasses = {
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600',
  };

  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm">
          <span className="font-bold text-slate-700">{label}</span>
          {showPercentage && (
            <span className="font-bold text-slate-600">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={`w-full rounded-full bg-slate-200 overflow-hidden ${sizes[size]}`}>
        <motion.div
          className={`rounded-full ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

// Spinner
export const Spinner = ({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
    xl: 'h-12 w-12 border-4',
  };

  return (
    <div 
      className={`
        animate-spin rounded-full border-slate-300 border-t-blue-600
        ${sizes[size]}
        ${className}
      `}
      role="status"
      aria-label="Loading"
    />
  );
};

// Skeleton Loader
export const Skeleton = ({
  className = '',
  variant = 'text',
}: {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}) => {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full aspect-square',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={`
        animate-pulse bg-slate-200
        ${variants[variant]}
        ${className}
      `}
    />
  );
};

// ============================================
// TABLE COMPONENTS
// ============================================

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  striped?: boolean;
  hoverable?: boolean;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ children, striped = false, hoverable = false, className = '', ...props }, ref) => (
    <div className="w-full overflow-auto">
      <table
        ref={ref}
        className={`
          w-full text-left border-collapse
          ${className}
        `}
        {...props}
      >
        {children}
      </table>
    </div>
  )
);

Table.displayName = 'Table';

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ children, className = '', ...props }, ref) => (
  <thead ref={ref} className={className} {...props}>
    {children}
  </thead>
));

TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ children, className = '', ...props }, ref) => (
  <tbody ref={ref} className={className} {...props}>
    {children}
  </tbody>
));

TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ children, className = '', striped, index, ...props }, ref) => {
  const rowClassName = striped && index && index % 2 === 0 ? 'bg-slate-50' : '';
  return (
    <tr
      ref={ref}
      className={`
        border-b border-slate-100 last:border-0
        ${rowClassName}
        ${className}
      `}
      {...props}
    >
      {children}
    </tr>
  );
});

TableRow.displayName = 'TableRow';

export const TableHeaderCell = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ children, className = '', ...props }, ref) => (
  <th
    ref={ref}
    className={`
      px-4 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider
      ${className}
    `}
    {...props}
  >
    {children}
  </th>
));

TableHeaderCell.displayName = 'TableHeaderCell';

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ children, className = '', ...props }, ref) => (
  <td
    ref={ref}
    className={`
      px-4 py-4 text-sm text-slate-700
      ${className}
    `}
    {...props}
  >
    {children}
  </td>
));

TableCell.displayName = 'TableCell';

// ============================================
// MODAL & DIALOG COMPONENTS
// ============================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

export const Modal = (
  {
    isOpen,
    onClose,
    title,
    size = 'md',
    children,
    closeOnOverlayClick = true,
    showCloseButton = true,
  }:
  ModalProps
) => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`
          relative w-full bg-white rounded-2xl shadow-2xl
          ${sizes[size]}
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            {title && (
              <h2 id="modal-title" className="text-xl font-bold text-slate-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-100 transition"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
};

// ============================================
// TAB COMPONENTS
// ============================================

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
}

export const Tabs = ({
  items,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'md',
}: TabsProps) => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variants = {
    default: {
      base: 'bg-slate-100 text-slate-600',
      active: 'bg-white text-slate-900 border-b-2 border-blue-600',
    },
    pills: {
      base: 'bg-transparent text-slate-600',
      active: 'bg-blue-600 text-white',
    },
    underline: {
      base: 'bg-transparent text-slate-600',
      active: 'text-blue-600',
    },
  };

  const config = variants[variant];

  return (
    <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          disabled={item.disabled}
          className={`
            flex items-center gap-2 rounded-lg font-bold transition-all
            ${sizes[size]}
            ${activeTab === item.id ? config.active : config.base}
            ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {item.icon && <span className="shrink-0">{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>
  );
};

// ============================================
// AVATAR COMPONENTS
// ============================================

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away' | null;
  className?: string;
}

export const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  status = null,
  className = '',
}: AvatarProps) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const statusClasses = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    busy: 'bg-red-500',
    away: 'bg-amber-500',
  };

  // Generate initials from name
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Generate background color from name
  const getBackgroundColor = (name?: string) => {
    if (!name) return 'bg-slate-400';
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 
      'bg-amber-500', 'bg-red-500', 'bg-rose-500',
      'bg-indigo-500', 'bg-cyan-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt || name}
          className={`
            rounded-full object-cover
            ${sizes[size]}
          `}
        />
      ) : (
        <div
          className={`
            rounded-full flex items-center justify-center
            text-white font-bold
            ${sizes[size]}
            ${getBackgroundColor(name)}
          `}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span
          className={`
            absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
            ${statusClasses[status]}
          `}
        />
      )}
    </div>
  );
};

// ============================================
// TOOLTIP COMPONENTS
// ============================================

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const Tooltip = ({
  content,
  children,
  position = 'top',
  delay = 300,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = React.useState(false);
  let timeoutId: NodeJS.Timeout;

  const showTooltip = () => {
    timeoutId = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block" onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`
              absolute z-50
              px-3 py-2 rounded-lg text-sm font-medium
              bg-slate-900 text-white
              whitespace-nowrap
              shadow-xl
              ${positionClasses[position]}
            `}
            role="tooltip"
          >
            {content}
            <div className="absolute w-2 h-2 bg-slate-900 rotate-45 -z-10" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// ACCORDION COMPONENTS
// ============================================

interface AccordionProps {
  items: { id: string; title: string; content: React.ReactNode }[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
}

export const Accordion = ({
  items,
  allowMultiple = false,
  defaultOpen = [],
}: AccordionProps) => {
  const [openItems, setOpenItems] = React.useState<string[]>(defaultOpen);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenItems((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-xl border border-slate-200 overflow-hidden"
        >
          <button
            onClick={() => toggleItem(item.id)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition"
          >
            <span className="font-bold text-slate-900">{item.title}</span>
            <ChevronDown
              className={`h-5 w-5 text-slate-500 transition-transform ${
                openItems.includes(item.id) ? 'rotate-180' : ''
              }`}
            />
          </button>
          <AnimatePresence>
            {openItems.includes(item.id) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-5 pb-5"
              >
                {item.content}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

// ============================================
// CHIP & TAG COMPONENTS
// ============================================

interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClose?: () => void;
  avatar?: React.ReactNode;
}

export const Chip = (
  {
    children,
    variant = 'default',
    size = 'md',
    onClose,
    avatar,
    className = '',
    ...props
  }:
  ChipProps
) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-blue-100 text-blue-700',
    secondary: 'bg-slate-200 text-slate-800',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full font-medium
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {avatar && <span className="shrink-0">{avatar}</span>}
      {children}
      {onClose && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="shrink-0 p-0.5 rounded-full hover:bg-black/10 transition"
          aria-label="Remove"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

// ============================================
// EMPTY STATE COMPONENTS
// ============================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  cta?: React.ReactNode;
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  cta,
  className = '',
}: EmptyStateProps) => (
  <div
    className={`
      flex flex-col items-center justify-center
      text-center py-12 px-6
      ${className}
    `}
  >
    {icon && (
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-6">
        {icon}
      </div>
    )}
    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
    {description && (
      <p className="text-slate-600 max-w-md mx-auto mb-6">{description}</p>
    )}
    {cta && <div>{cta}</div>}
  </div>
);

// ============================================
// STAT & METRIC COMPONENTS
// ============================================

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'slate';
}

export const StatCard = ({
  value,
  label,
  icon,
  trend,
  trendValue,
  color = 'slate',
}: StatCardProps) => {
  const colorClasses = {
    blue: {
      icon: 'text-blue-600',
      value: 'text-blue-900',
      bg: 'bg-blue-50',
    },
    emerald: {
      icon: 'text-emerald-600',
      value: 'text-emerald-900',
      bg: 'bg-emerald-50',
    },
    amber: {
      icon: 'text-amber-600',
      value: 'text-amber-900',
      bg: 'bg-amber-50',
    },
    red: {
      icon: 'text-red-600',
      value: 'text-red-900',
      bg: 'bg-red-50',
    },
    purple: {
      icon: 'text-purple-600',
      value: 'text-purple-900',
      bg: 'bg-purple-50',
    },
    slate: {
      icon: 'text-slate-600',
      value: 'text-slate-900',
      bg: 'bg-slate-50',
    },
  };

  const config = colorClasses[color];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        {icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.bg}`}>
            <span className={config.icon}>{icon}</span>
          </div>
        )}
        {trend && trendValue && (
          <Badge 
            variant={trend === 'up' ? 'success' : trend === 'down' ? 'danger' : 'secondary'}
            size="sm"
          >
            {trend === 'up' && <TrendingUp className="h-3 w-3" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3" />}
            {trendValue}
          </Badge>
        )}
      </div>
      <div className="text-3xl font-bold mb-1" style={config.value as any}>
        {value}
      </div>
      <div className="text-sm text-slate-600">{label}</div>
    </div>
  );
};

// ============================================
// EXPORT ALL COMPONENTS
// ============================================

export {
  motion,
  AnimatePresence,
} from 'framer-motion';
