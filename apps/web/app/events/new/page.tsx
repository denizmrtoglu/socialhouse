import { AdminLayout } from '@/components/admin/admin-layout'
import { Topbar } from '@/components/admin/topbar'
import { PageContent } from '@/components/admin/page-content'
import { EventForm } from '@/components/admin/event-form'

export default function NewEventPage() {
  return (
    <AdminLayout>
      <Topbar title="Yeni Etkinlik" description="Yeni bir etkinlik oluşturun" />
      <PageContent>
        <EventForm />
      </PageContent>
    </AdminLayout>
  )
}
