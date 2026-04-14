import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageContentProps {
  children: ReactNode
  className?: string
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <main className={cn('flex-1 overflow-y-auto p-6', className)}>
      {children}
    </main>
  )
}
