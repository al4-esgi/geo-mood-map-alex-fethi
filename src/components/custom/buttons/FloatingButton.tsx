import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface FloatingButtonProps {
  icon: LucideIcon
  onClick: () => void
  label?: string
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left'
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-left': 'top-4 left-4',
}

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/50',
  secondary: 'bg-slate-600 hover:bg-slate-700 text-white shadow-slate-500/50',
  success: 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/50',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/50',
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-14 h-14',
  lg: 'w-16 h-16',
}

const iconSizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-7 h-7',
}

export function FloatingButton({
  icon: Icon,
  onClick,
  label,
  position = 'bottom-right',
  variant = 'primary',
  size = 'md',
  className,
}: FloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed z-1000 rounded-full shadow-lg transition-all duration-200',
        'hover:scale-110 active:scale-95',
        'flex items-center justify-center',
        positionClasses[position],
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      aria-label={label}
      title={label}
    >
      <Icon className={iconSizeClasses[size]} />
    </button>
  )
}
