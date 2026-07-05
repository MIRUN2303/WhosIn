import React from 'react';
import { clsx } from 'clsx';

// =============================================
// BUTTON
// =============================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'lime' | 'amber' | 'ghost' | 'glass' | 'danger' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'lime', size = 'md', icon, iconRight, loading, fullWidth,
  className, children, disabled, ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-[#00ff41] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808] active:scale-95';

  const variants = {
    lime: 'btn-lime text-black',
    amber: 'btn-amber text-black',
    ghost: 'btn-ghost text-white/60 hover:text-[#00ff41] hover:border-[#00ff41]/40',
    glass: 'glass text-white/70 hover:text-white hover:border-white/20',
    danger: 'bg-red-600 text-white hover:bg-red-500',
    dark: 'bg-[#1c1c1c] border border-white/10 text-white hover:border-white/20',
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
  glow?: 'lime' | 'amber' | 'gold' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'amber' | 'lime' | 'dark';
}

export const Card: React.FC<CardProps> = ({
  children, className, onClick, interactive, glow = 'none', padding = 'md', variant = 'default'
}) => {
  const glows = {
    lime: 'hover:shadow-[0_0_30px_rgba(0,255,65,0.2)]',
    amber: 'hover:shadow-[0_0_30px_rgba(249,115,22,0.25)]',
    gold: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    none: '',
  };
  const variants = {
    default: 'glass-card',
    amber: 'glass-amber',
    lime: 'glass-lime',
    dark: 'bg-[#0f0f0f] border border-white/5',
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
        ring && 'ring-2 ring-[#00ff41]/60 ring-offset-2 ring-offset-[#080808]',
        !src && 'text-black font-bold'
      )} style={!src ? { background: 'linear-gradient(135deg, #00ff41, #00aa1e)' } : {}}>
        {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : <span>{initials}</span>}
      </div>
      {online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00ff41] rounded-full border-2 border-[#080808]" />}
    </div>
  );
};

// =============================================
// BADGE
// =============================================
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'lime' | 'amber' | 'gold' | 'green' | 'red' | 'blue' | 'glass' | 'dark';
  size?: 'sm' | 'md'; dot?: boolean; className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'lime', size = 'md', dot, className }) => {
  const variants = {
    lime: 'bg-[#00ff41]/15 text-[#00ff41] border border-[#00ff41]/30',
    amber: 'bg-orange-500/15 text-orange-300 border border-orange-500/30',
    gold: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    green: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    red: 'bg-red-500/15 text-red-300 border border-red-500/25',
    blue: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25',
    glass: 'bg-white/8 text-white/70 border border-white/10',
    dark: 'bg-[#1c1c1c] text-white/50 border border-white/8',
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
  title: string; subtitle?: string; action?: React.ReactNode; className?: string;
}
export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, action, className }) => (
  <div className={clsx('flex items-start justify-between', className)}>
    <div>
      <h2 className="font-display font-bold text-white text-[17px] leading-tight">{title}</h2>
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
  value, max = 100, color = '#00ff41', size = 'md', className
}) => {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={clsx('w-full rounded-full overflow-hidden', size === 'sm' ? 'h-1' : 'h-2', 'bg-white/8', className)}>
      <div className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}80` }} />
    </div>
  );
};

// =============================================
// STAT CARD
// =============================================
interface StatCardProps {
  label: string; value: string | number; icon?: string;
  sub?: string; color?: string; className?: string;
}
export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, sub, color, className }) => (
  <div className={clsx('bg-[#111] border border-white/6 rounded-2xl p-3 flex flex-col gap-1', className)}>
    {icon && <span className="text-xl">{icon}</span>}
    <p className="text-2xl font-display font-black leading-none" style={{ color: color || 'white' }}>{value}</p>
    <p className="text-[11px] text-white/40 font-medium leading-tight">{label}</p>
    {sub && <p className="text-[10px] text-white/25">{sub}</p>}
  </div>
);

// =============================================
// SPORT ORB
// =============================================
interface SportOrbProps {
  emoji: string; color: string; bg: string;
  size?: 'sm' | 'md' | 'lg'; className?: string;
}
export const SportOrb: React.FC<SportOrbProps> = ({ emoji, color, bg, size = 'md', className }) => {
  const sizes = { sm: 'w-9 h-9 text-lg rounded-xl', md: 'w-12 h-12 text-2xl rounded-2xl', lg: 'w-16 h-16 text-3xl rounded-3xl' };
  return (
    <div className={clsx('flex items-center justify-center flex-shrink-0', sizes[size], className)}
      style={{ background: bg, border: `1px solid ${color}30` }}>
      {emoji}
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
    'text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap border',
    active
      ? 'bg-[#00ff41] text-black border-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.4)]'
      : 'bg-transparent border-white/10 text-white/50 hover:text-white hover:border-white/20',
    className
  )}>{label}</button>
);

// =============================================
// EMPTY STATE
// =============================================
interface EmptyStateProps {
  emoji: string; title: string; description?: string;
  action?: React.ReactNode; className?: string;
}
export const EmptyState: React.FC<EmptyStateProps> = ({ emoji, title, description, action, className }) => (
  <div className={clsx('flex flex-col items-center justify-center text-center py-12 gap-3', className)}>
    <span className="text-5xl">{emoji}</span>
    <h3 className="font-display font-bold text-white text-lg">{title}</h3>
    {description && <p className="text-white/40 text-sm max-w-xs">{description}</p>}
    {action}
  </div>
);
