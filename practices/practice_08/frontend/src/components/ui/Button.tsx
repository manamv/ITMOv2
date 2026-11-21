import React from 'react'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs px-4 py-2.5 gap-2',
    lg: 'text-sm px-6 py-3 gap-2.5'
  }[size]

  const variantStyles = {
    primary: 'bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold shadow-lg shadow-sky-500/25 focus-visible:ring-sky-400 active:scale-[0.98]',
    secondary: 'bg-white/[0.05] hover:bg-white/[0.09] text-slate-200 border border-white/[0.08] focus-visible:ring-sky-400 active:scale-[0.98]',
    outline: 'border border-white/[0.1] hover:border-white/[0.2] text-slate-300 hover:text-white bg-white/[0.02] focus-visible:ring-sky-400',
    danger: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 focus-visible:ring-rose-400',
    ghost: 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05] focus-visible:ring-sky-400'
  }[variant]

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  )
}
