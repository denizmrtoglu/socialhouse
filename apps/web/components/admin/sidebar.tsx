'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  Users,
  ClipboardList,
  Gift,
  LayoutDashboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard',    label: 'Genel Bakış',  icon: LayoutDashboard },
  { href: '/events',       label: 'Etkinlikler',  icon: CalendarDays },
  { href: '/applications', label: 'Başvurular',   icon: ClipboardList },
  { href: '/offers',       label: 'Teklifler',    icon: Gift },
  { href: '/users',        label: 'Kullanıcılar', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-60 flex-col bg-[var(--sidebar-bg)] text-[var(--sidebar-text)]">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-white/10">
        <span className="text-xl font-bold text-white tracking-tight">
          socialhouse
        </span>
        <span className="ml-2 text-[10px] uppercase tracking-widest text-white/40 mt-0.5">
          admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:bg-white/8 hover:text-white/90'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-4 py-4">
        <p className="text-xs text-white/30">socialhouse © 2025</p>
      </div>
    </aside>
  )
}
