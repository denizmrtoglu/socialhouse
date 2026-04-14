import { notFound } from 'next/navigation'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Topbar } from '@/components/admin/topbar'
import { PageContent } from '@/components/admin/page-content'
import { EventForm } from '@/components/admin/event-form'
import { apiGet } from '@/lib/api'
import type { Event } from '@repo/types'

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let event: Event
  try {
    event = await apiGet<Event>(`/admin/events/${id}`)
  } catch {
    notFound()
  }

  return (
    <AdminLayout>
      <Topbar title="Etkinliği Düzenle" description={event.title} />
      <PageContent>
        <EventForm event={event} />
      </PageContent>
    </AdminLayout>
  )
}
