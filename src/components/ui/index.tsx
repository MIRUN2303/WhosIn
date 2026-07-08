import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { ICON_MAP } from './icons';
import { useScrollLock } from '../../lib/useScrollLock';

// =============================================
// BUTTON
// =============================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'green' | 'amber' | 'lime' | 'ghost' | 'glass' | 'danger' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'green', size = 'md', icon, iconRight, loading, fullWidth,
  className, children, disabled, ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] active:scale-95';

  const variants: Record<string, string> = {
    green: 'btn-green text-black',
    amber: 'btn-amber text-black',
    lime: 'btn-lime text-black',
    ghost: 'btn-ghost',
    glass: 'glass text-white/70 hover:text-white',
    danger: 'bg-[var(--red)] text-white hover:brightness-110',
    dark: 'bg-[var(--bg-surface-2)] border border-[var(--border-medium)] text-white hover:border-white/20',
  };

  const sizes = {
    sm: 'text-xs px-3 py-2 rounded-xl',
    md: 'text-sm px-4 py-2.5 rounded-2xl',
    lg: 'text-base px-6 py-3.5 rounded-2xl',
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full',
        (disabled || loading) && 'opacity-40 cursor-not-allowed pointer-events-none', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : icon}
      {children}
      {iconRight && !loading && iconRight}
    </button>
  );
};

// =============================================
// CARD
// =============================================
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  glow?: 'green' | 'amber' | 'gold' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'amber' | 'green' | 'dark' | 'white';
}

export const Card: React.FC<CardProps> = ({
  children, className, onClick, interactive, glow = 'none', padding = 'md', variant = 'default'
}) => {
  const glows: Record<string, string> = {
    green: 'hover:shadow-[0_0_30px_rgba(var(--green-rgb),0.18)]',
    amber: 'hover:shadow-[0_0_30px_rgba(var(--amber-rgb),0.22)]',
    gold: 'hover:shadow-[0_0_20px_rgba(var(--gold-rgb),0.25)]',
    none: '',
  };
  const variants: Record<string, string> = {
    default: 'glass-card',
    amber: 'glass-amber',
    green: 'glass-green',
    dark: 'surface-0',
    white: 'glass-white',
  };
  const paddings = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' };

  return (
    <div
      className={clsx('rounded-3xl overflow-hidden', variants[variant],
        interactive && 'card-interactive cursor-pointer',
        glow !== 'none' && glows[glow], paddings[padding], className)}
      onClick={onClick}
    >{children}</div>
  );
};

// =============================================
// AVATAR
// =============================================
interface AvatarProps {
  src?: string; name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean; className?: string; ring?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', online, className, ring }) => {
  const sizes = { xs: 'w-6 h-6 text-[9px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg' };
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className={clsx('relative flex-shrink-0', className)}>
      <div className={clsx(sizes[size], 'rounded-full overflow-hidden flex items-center justify-center font-bold flex-shrink-0',
        ring && 'ring-2 ring-[var(--green)]/60 ring-offset-2 ring-offset-[var(--bg-base)]',
        !src && 'text-black font-bold'
      )} style={!src ? { background: 'linear-gradient(135deg, var(--green-bright), var(--green-dim))' } : {}}>
        {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : <span>{initials}</span>}
      </div>
      {online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-base)]" style={{ background: 'var(--green)' }} />}
    </div>
  );
};

// =============================================
// BADGE
// =============================================
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'amber' | 'lime' | 'gold' | 'emerald' | 'red' | 'blue' | 'glass' | 'dark';
  size?: 'sm' | 'md'; dot?: boolean; className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'green', size = 'md', dot, className }) => {
  const variants: Record<string, string> = {
    green: 'bg-[rgba(var(--green-rgb),0.12)] text-[var(--green)] border border-[rgba(var(--green-rgb),0.25)]',
    amber: 'bg-[rgba(var(--amber-rgb),0.12)] text-[var(--amber)] border border-[rgba(var(--amber-rgb),0.25)]',
    lime: 'bg-[rgba(var(--green-rgb),0.12)] text-[var(--green)] border border-[rgba(var(--green-rgb),0.25)]',
    gold: 'bg-[rgba(var(--gold-rgb),0.12)] text-amber-300 border border-[rgba(var(--gold-rgb),0.25)]',
    emerald: 'bg-[rgba(var(--green-rgb),0.12)] text-emerald-300 border border-[rgba(var(--green-rgb),0.25)]',
    red: 'bg-[rgba(var(--red-rgb),0.12)] text-red-300 border border-[rgba(var(--red-rgb),0.25)]',
    blue: 'bg-[rgba(96,165,250,0.12)] text-blue-300 border border-[rgba(96,165,250,0.25)]',
    glass: 'bg-white/8 text-white/70 border border-white/10',
    dark: 'bg-[var(--bg-surface-2)] text-white/50 border border-white/8',
  };
  const sizes = { sm: 'text-[10px] px-2 py-0.5', md: 'text-xs px-2.5 py-1' };
  return (
    <span className={clsx('inline-flex items-center gap-1 font-semibold rounded-full', variants[variant], sizes[size], className)}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
};

// =============================================
// SKELETON
// =============================================
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('skeleton rounded-2xl', className)} />
);

// =============================================
// SECTION HEADER
// =============================================
interface SectionHeaderProps {
  title: React.ReactNode; subtitle?: string; action?: React.ReactNode; className?: string;
}
export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, action, className }) => (
  <div className={clsx('flex items-start justify-between', className)}>
    <div>
      <h2 className="font-display font-bold text-white text-[17px] leading-tight section-title">{title}</h2>
      {subtitle && <p className="text-white/40 text-xs mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// =============================================
// PROGRESS BAR
// =============================================
interface ProgressBarProps {
  value: number; max?: number; color?: string;
  size?: 'sm' | 'md'; className?: string;
}
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value, max = 100, color, size = 'md', className
}) => {
  const pct = Math.min(100, (value / max) * 100);
  const barColor = color || 'var(--green)';
  return (
    <div className={clsx('w-full rounded-full overflow-hidden', size === 'sm' ? 'h-1' : 'h-2', 'bg-white/8', className)}>
      <div className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct}%`, background: barColor, boxShadow: `0 0 8px ${barColor}80` }} />
    </div>
  );
};

// =============================================
// STAT CARD
// =============================================
interface StatCardProps {
  label: string; value: string | number;
  icon?: React.ReactNode;
  sub?: string; color?: string; className?: string;
}
export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, sub, color, className }) => (
  <div className={clsx('surface-1 rounded-2xl p-3 flex flex-col gap-1', className)}>
    {icon && <span className="text-lg">{icon}</span>}
    <p className="text-2xl font-display font-black leading-none" style={{ color: color || 'var(--text-primary)' }}>{value}</p>
    <p className="text-[11px] text-white/40 font-medium leading-tight">{label}</p>
    {sub && <p className="text-[10px] text-white/25">{sub}</p>}
  </div>
);

// =============================================
// SPORT ORB (backward-compatible: emoji OR icon)
// =============================================
interface SportOrbProps {
  emoji?: string;
  icon?: React.ReactNode;
  color: string; bg?: string;
  size?: 'sm' | 'md' | 'lg'; className?: string;
}
export const SportOrb: React.FC<SportOrbProps> = ({ emoji, icon, color, bg, size = 'md', className }) => {
  const sizes = { sm: 'w-9 h-9 text-lg rounded-xl', md: 'w-12 h-12 text-xl rounded-2xl', lg: 'w-16 h-16 text-3xl rounded-3xl' };
  const iconSizes = { sm: 18, md: 24, lg: 32 };
  const IconComponent = emoji ? ICON_MAP[emoji] : undefined;
  const content = icon || (IconComponent ? <IconComponent size={iconSizes[size]} /> : emoji);
  return (
    <div className={clsx('flex items-center justify-center flex-shrink-0', sizes[size], className)}
      style={{
        background: bg || `${color}14`,
        border: `1px solid ${color}30`,
      }}>
      {content}
    </div>
  );
};

// =============================================
// DIVIDER
// =============================================
export const Divider: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('h-px bg-white/6', className)} />
);

// =============================================
// CHIP
// =============================================
interface ChipProps { label: string; active?: boolean; onClick?: () => void; className?: string; }
export const Chip: React.FC<ChipProps> = ({ label, active, onClick, className }) => (
  <button onClick={onClick} className={clsx(
    'text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap border tap-scale',
    active
      ? 'bg-[var(--green)] text-black border-[var(--green)] shadow-[0_0_15px_rgba(var(--green-rgb),0.4)]'
      : 'bg-transparent border-[var(--border-medium)] text-white/50 hover:text-white hover:border-white/20',
    className
  )}>{label}</button>
);

// =============================================
// EMPTY STATE (backward-compatible: emoji OR icon)
// =============================================
interface EmptyStateProps {
  emoji?: string;
  icon?: React.ReactNode;
  title: string; description?: string;
  action?: React.ReactNode; className?: string;
}
export const EmptyState: React.FC<EmptyStateProps> = ({ emoji, icon, title, description, action, className }) => (
  <div className={clsx('flex flex-col items-center justify-center text-center py-12 gap-3', className)}>
    <div className="text-5xl mb-1 opacity-60">{icon || emoji}</div>
    <h3 className="font-display font-bold text-white text-lg">{title}</h3>
    {description && <p className="text-white/40 text-sm max-w-xs text-balance">{description}</p>}
    {action}
  </div>
);

// =============================================
// CONFIRM MODAL (replaces window.confirm)
// =============================================
interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'default', onConfirm, onCancel
}) => {
  // iOS-safe scroll lock
  useScrollLock(open);

  if (!open) return null;

  const confirmColor = variant === 'danger' ? '#ef4444' : 'var(--green)';
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onCancel}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="w-full max-w-sm rounded-3xl p-6 relative overflow-hidden"
        style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.15)' }} />
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: variant === 'danger' ? 'rgba(239,68,68,0.12)' : 'rgba(var(--green-rgb),0.1)', border: `1px solid ${variant === 'danger' ? 'rgba(239,68,68,0.2)' : 'rgba(var(--green-rgb),0.2)'}` }}>
            {variant === 'danger' ? (
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            ) : (
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            )}
          </div>
          <h3 className="font-display font-bold text-lg text-white mb-2">{title}</h3>
          <p className="text-sm text-white/50 leading-relaxed mb-6">{message}</p>
          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>
              {cancelLabel}
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
              style={{ background: confirmColor, color: variant === 'danger' ? '#fff' : '#080808' }}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}
export const PageLayout: React.FC<PageLayoutProps> = ({ children, className, padding = true }) => (
  <div className={clsx('page-container', padding && 'pb-24', className)}>
    {children}
  </div>
);
