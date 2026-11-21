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
    default: 'bg-[#0d1527]/90 border border-sky-500/15 text-slate-200 shadow-xl shadow-black/40',
    active: 'bg-[#0f1b33] border border-sky-400/50 shadow-xl shadow-sky-500/10 ring-1 ring-sky-400/30',
    interactive: 'bg-[#0d1527]/80 border border-sky-500/15 hover:border-sky-400/50 hover:bg-[#111e3b] cursor-pointer shadow-lg shadow-black/40 hover:shadow-sky-500/10'
  }[variant]

  return (
    <div className={`${base} ${variants} ${className}`} {...props}>
      {children}
    </div>
  )
}
