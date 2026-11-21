import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'default' | 'active' | 'interactive'
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const base = 'rounded-2xl p-5 transition-all duration-200'
  
  const variants = {
    default: 'bg-slate-900/90 border border-slate-800 text-slate-200',
    active: 'bg-slate-900 border border-emerald-500/40 shadow-lg shadow-emerald-500/5',
    interactive: 'bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 cursor-pointer'
  }[variant]

  return (
    <div className={`${base} ${variants} ${className}`} {...props}>
      {children}
    </div>
  )
}
