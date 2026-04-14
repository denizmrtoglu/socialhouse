import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TopbarProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function Topbar({ title, description, actions, className }: TopbarProps) {
  return (
    <header
      className={cn(
        'flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-surface)] px-6',
        className
      )}
    >
      <div>
        <h1 className="text-base font-semibold text-[var(--text-primary)] leading-none">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
