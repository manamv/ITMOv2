import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'emerald' | 'cyan' | 'purple' | 'amber' | 'rose' | 'slate' | 'sky' | 'indigo'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'emerald',
  className = ''
}) => {
  const styles = {
    sky: 'bg-sky-500/15 text-sky-300 border-sky-500/30 shadow-sm shadow-sky-500/10',
    indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    slate: 'bg-slate-800 text-slate-400 border-slate-700/60'
  }[variant]

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border ${styles} ${className}`}>
      {children}
    </span>
  )
}
