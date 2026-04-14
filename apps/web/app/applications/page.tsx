import { AdminLayout } from '@/components/admin/admin-layout'
import { Topbar } from '@/components/admin/topbar'
import { PageContent } from '@/components/admin/page-content'
import { apiGet } from '@/lib/api'
import type { Event } from '@repo/types'
import { ApplicationsTable } from './applications-table'

export default async function ApplicationsPage() {
  let events: Event[] = []
  try {
    events = await apiGet<Event[]>('/admin/events')
  } catch {
    // API unreachable
  }

  return (
    <AdminLayout>
      <Topbar title="Başvurular" description="Guest list başvurularını yönetin" />
      <PageContent>
        <ApplicationsTable events={events} />
      </PageContent>
    </AdminLayout>
  )
}
