import Link from 'next/link'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Topbar } from '@/components/admin/topbar'
import { PageContent } from '@/components/admin/page-content'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiGet } from '@/lib/api'
import type { Event } from '@repo/types'
import { Plus, CalendarDays, MapPin, Users } from 'lucide-react'
import { EventDeleteButton } from './event-delete-button'

export default async function EventsPage() {
  let events: Event[] = []
  try {
    events = await apiGet<Event[]>('/admin/events')
  } catch {
    // API unreachable — show empty state
  }

  return (
    <AdminLayout>
      <Topbar
        title="Etkinlikler"
        description={`${events.length} etkinlik`}
        actions={
          <Button asChild size="sm">
            <Link href="/events/new">
              <Plus className="h-4 w-4 mr-1" />
              Yeni Etkinlik
            </Link>
          </Button>
        }
      />
      <PageContent>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CalendarDays className="h-12 w-12 text-[var(--text-muted)] mb-4" />
            <p className="text-[var(--text-secondary)] font-medium">Henüz etkinlik yok</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">İlk etkinliği eklemek için butona tıklayın</p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/events/new">
                <Plus className="h-4 w-4 mr-1" />
                Yeni Etkinlik
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </PageContent>
    </AdminLayout>
  )
}

function EventCard({ event }: { event: Event }) {
  const date = new Date(event.date)
  const dateStr = date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
      {event.coverImage ? (
        <img
          src={event.coverImage}
          alt={event.title}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-[var(--bg-subtle)] flex items-center justify-center">
          <CalendarDays className="h-10 w-10 text-[var(--text-muted)]" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] leading-tight">{event.title}</h2>
          <Badge variant={event.isActive ? 'default' : 'secondary'}>
            {event.isActive ? 'Aktif' : 'Pasif'}
          </Badge>
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <CalendarDays className="h-3 w-3 shrink-0" />
            {dateStr}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <MapPin className="h-3 w-3 shrink-0" />
            {event.venue}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Users className="h-3 w-3 shrink-0" />
            {event.guestLimit} kişi kapasitesi
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/events/${event.id}/edit`}>Düzenle</Link>
          </Button>
          <EventDeleteButton eventId={event.id} />
        </div>
      </div>
    </div>
  )
}
