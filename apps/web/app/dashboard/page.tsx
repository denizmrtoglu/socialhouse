import { AdminLayout } from '@/components/admin/admin-layout'
import { Topbar } from '@/components/admin/topbar'
import { PageContent } from '@/components/admin/page-content'
import { StatCard } from '@/components/admin/stat-card'
import { apiGet } from '@/lib/api'
import type { Event, Application, User } from '@repo/types'
import { Users, CalendarDays, ClipboardList } from 'lucide-react'

async function getStats() {
  try {
    const [users, events, applications] = await Promise.all([
      apiGet<User[]>('/admin/users'),
      apiGet<Event[]>('/admin/events'),
      apiGet<Application[]>('/admin/applications'),
    ])
    const pending = applications.filter((a) => a.status === 'PENDING').length
    return { userCount: users.length, eventCount: events.length, pendingCount: pending }
  } catch {
    return { userCount: 0, eventCount: 0, pendingCount: 0 }
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  return (
    <AdminLayout>
      <Topbar title="Genel Bakış" description="Hoş geldiniz" />
      <PageContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard title="Toplam Kullanıcı" value={stats.userCount} icon={Users} />
          <StatCard title="Aktif Etkinlik" value={stats.eventCount} icon={CalendarDays} />
          <StatCard title="Bekleyen Başvuru" value={stats.pendingCount} icon={ClipboardList} />
        </div>
      </PageContent>
    </AdminLayout>
  )
}
