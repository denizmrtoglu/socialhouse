'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import type { Offer, OfferStatus } from '@repo/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ExternalLink, Loader2, Gift } from 'lucide-react'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Bekliyor',
  IN_PROGRESS: 'Çalışılıyor',
  COMMUNICATED: 'İletildi',
}

const STATUS_VARIANTS: Record<string, 'outline' | 'warning' | 'success'> = {
  PENDING: 'outline',
  IN_PROGRESS: 'warning',
  COMMUNICATED: 'success',
}

const TYPE_LABELS: Record<string, string> = {
  BISTRO: 'Bistro',
  BACKSTAGE: 'Backstage',
}

import { OfferStatus as OS } from '@repo/types'

const STATUS_FLOW: OfferStatus[] = [OS.PENDING, OS.IN_PROGRESS, OS.COMMUNICATED]

function nextStatus(current: OfferStatus): OfferStatus | null {
  const idx = STATUS_FLOW.indexOf(current)
  return idx < STATUS_FLOW.length - 1 ? (STATUS_FLOW[idx + 1] ?? null) : null
}

interface OffersInboxProps {
  initialOffers: Offer[]
}

export function OffersInbox({ initialOffers }: OffersInboxProps) {
  const { getToken } = useAuth()
  const [offers, setOffers] = useState<Offer[]>(initialOffers)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [loading, setLoading] = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteValues, setNoteValues] = useState<Record<string, string>>(
    Object.fromEntries(initialOffers.map((o) => [o.id, o.adminNote ?? '']))
  )

  async function updateOffer(id: string, body: { status?: OfferStatus; adminNote?: string }) {
    setLoading(id)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/admin/offers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      const updated: Offer = await res.json()
      setOffers((prev) => prev.map((o) => (o.id === id ? updated : o)))
      if (body.adminNote !== undefined) {
        toast.success('Not kaydedildi')
        setEditingNote(null)
      } else {
        toast.success('Statü güncellendi')
      }
    } catch {
      toast.error('İşlem başarısız')
    } finally {
      setLoading(null)
    }
  }

  const filtered = offers.filter(
    (o) => statusFilter === 'ALL' || o.status === statusFilter
  )

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tümü ({offers.length})</SelectItem>
            <SelectItem value="PENDING">
              Bekliyor ({offers.filter((o) => o.status === 'PENDING').length})
            </SelectItem>
            <SelectItem value="IN_PROGRESS">
              Çalışılıyor ({offers.filter((o) => o.status === 'IN_PROGRESS').length})
            </SelectItem>
            <SelectItem value="COMMUNICATED">
              İletildi ({offers.filter((o) => o.status === 'COMMUNICATED').length})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Gift className="h-12 w-12 text-[var(--text-muted)] mb-4" />
          <p className="text-sm text-[var(--text-muted)]">Bu filtreye uygun teklif yok</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((offer) => {
            const user = offer.user
            const event = offer.event
            const next = nextStatus(offer.status)
            const isLoading = loading === offer.id
            const isEditingNote = editingNote === offer.id

            return (
              <div
                key={offer.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4 space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {user ? `${user.firstName} ${user.lastName}` : '—'}
                    </p>
                    {user?.instagram && (
                      <a
                        href={`https://instagram.com/${user.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-[color:var(--color-primary)] hover:underline mt-0.5"
                      >
                        @{user.instagram}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <Badge variant={STATUS_VARIANTS[offer.status] ?? 'outline'}>
                    {STATUS_LABELS[offer.status] ?? offer.status}
                  </Badge>
                </div>

                {/* Meta */}
                <div className="space-y-1 text-xs text-[var(--text-muted)]">
                  <div className="flex items-center justify-between">
                    <span>Etkinlik</span>
                    <span className="text-[var(--text-secondary)] font-medium">
                      {event?.title ?? '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tür</span>
                    <span className="text-[var(--text-secondary)] font-medium">
                      {TYPE_LABELS[offer.type] ?? offer.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tarih</span>
                    <span className="text-[var(--text-secondary)]">
                      {new Date(offer.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* User note */}
                {offer.note && (
                  <div className="rounded-md bg-[var(--bg-subtle)] px-3 py-2">
                    <p className="text-xs text-[var(--text-muted)] mb-1">Kullanıcı notu</p>
                    <p className="text-xs text-[var(--text-secondary)]">{offer.note}</p>
                  </div>
                )}

                {/* Admin note */}
                <div>
                  {isEditingNote ? (
                    <div className="space-y-2">
                      <Textarea
                        rows={2}
                        value={noteValues[offer.id] ?? ''}
                        onChange={(e) =>
                          setNoteValues((prev) => ({ ...prev, [offer.id]: e.target.value }))
                        }
                        placeholder="Admin notu..."
                        className="text-xs"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          disabled={isLoading}
                          onClick={() =>
                            updateOffer(offer.id, { adminNote: noteValues[offer.id] ?? '' })
                          }
                        >
                          {isLoading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                          Kaydet
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => setEditingNote(null)}
                        >
                          İptal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="w-full text-left rounded-md bg-[var(--bg-subtle)] px-3 py-2 hover:bg-[var(--bg-canvas)] transition-colors"
                      onClick={() => setEditingNote(offer.id)}
                    >
                      <p className="text-xs text-[var(--text-muted)] mb-0.5">Admin notu</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {offer.adminNote || (
                          <span className="italic text-[var(--text-disabled)]">Not ekle...</span>
                        )}
                      </p>
                    </button>
                  )}
                </div>

                {/* Status advance */}
                {next && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 text-xs"
                    disabled={isLoading}
                    onClick={() => updateOffer(offer.id, { status: next })}
                  >
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : null}
                    {STATUS_LABELS[next]} olarak işaretle →
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
