import { AdminLayout } from '@/components/admin/admin-layout'
import { Topbar } from '@/components/admin/topbar'
import { PageContent } from '@/components/admin/page-content'
import { StatCard } from '@/components/admin/stat-card'
import { Users, CalendarDays, ClipboardList } from 'lucide-react'

export default function DashboardPage() {
  return (
    <AdminLayout>
      <Topbar title="Genel Bakış" description="Hoş geldiniz" />
      <PageContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard title="Toplam Kullanıcı" value="—" icon={Users} />
          <StatCard title="Aktif Etkinlik" value="—" icon={CalendarDays} />
          <StatCard title="Bekleyen Başvuru" value="—" icon={ClipboardList} />
        </div>
      </PageContent>
    </AdminLayout>
  )
}
