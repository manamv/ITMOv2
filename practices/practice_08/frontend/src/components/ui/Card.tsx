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
    default: 'bg-[#090d16]/85 backdrop-blur-xl border border-white/[0.07] text-slate-200 shadow-2xl shadow-black/80',
    active: 'bg-white/[0.07] border border-sky-400/50 shadow-2xl shadow-sky-500/10 ring-1 ring-sky-400/30',
    interactive: 'bg-[#090d16]/80 backdrop-blur-md border border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.04] cursor-pointer shadow-xl shadow-black/60 transition-all active:scale-[0.99]'
  }[variant]

  return (
    <div className={`${base} ${variants} ${className}`} {...props}>
      {children}
    </div>
  )
}
