import React from 'react';

interface PrivacyBadgeProps {
  isPrivate?: boolean;
  size?: 'sm' | 'md';
}

const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({ isPrivate, size = 'md' }) => {
  if (isPrivate === undefined) return null;
  const cls =
    size === 'sm'
      ? isPrivate
        ? 'flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 ring-1 ring-slate-200'
        : 'flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-200'
      : isPrivate
        ? 'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm shadow-sm border bg-amber-50/90 text-amber-800 border-amber-200/60'
        : 'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm shadow-sm border bg-emerald-50/90 text-emerald-800 border-emerald-200/60';
  const icon = isPrivate ? '🔒' : '🌐';
  const text = isPrivate ? 'Private' : 'Public';
  const title = isPrivate ? 'Only you can see this memory' : 'Anyone can see this memory';
  return (
    <div className={cls} title={title}>
      {size === 'md' && icon}
      <span className="leading-none">{text}</span>
    </div>
  );
};

export default PrivacyBadge;

