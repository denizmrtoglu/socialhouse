'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import type { Application, Event } from '@repo/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Bekliyor',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'success' | 'error'> = {
  PENDING: 'outline',
  APPROVED: 'success',
  REJECTED: 'error',
}

const GENDER_LABELS: Record<string, string> = {
  MALE: 'Erkek',
  FEMALE: 'Kadın',
  OTHER: 'Diğer',
}

function calculateAge(birthDate: string | null): string {
  if (!birthDate) return '—'
  const diff = Date.now() - new Date(birthDate).getTime()
  return String(Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)))
}

interface ApplicationsTableProps {
  events: Event[]
}

export function ApplicationsTable({ events }: ApplicationsTableProps) {
  const { getToken } = useAuth()

  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const fetchApplications = useCallback(async (eventId: string) => {
    if (!eventId) return
    setLoading(true)
    setSelected(new Set())
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/admin/applications?eventId=${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('Başvurular yüklenemedi')
      setApplications(await res.json())
    } catch {
      toast.error('Başvurular yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  async function updateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    setActionLoading(id)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/admin/applications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: status as Application['status'] } : a))
      )
      toast.success(status === 'APPROVED' ? 'Onaylandı' : 'Reddedildi')
    } catch {
      toast.error('İşlem başarısız')
    } finally {
      setActionLoading(null)
    }
  }

  async function bulkUpdate(status: 'APPROVED' | 'REJECTED') {
    if (selected.size === 0) return
    setActionLoading('bulk')
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/admin/applications/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: Array.from(selected), status }),
      })
      if (!res.ok) throw new Error()
      setApplications((prev) =>
        prev.map((a) =>
          selected.has(a.id) ? { ...a, status: status as Application['status'] } : a
        )
      )
      setSelected(new Set())
      toast.success(`${selected.size} başvuru ${status === 'APPROVED' ? 'onaylandı' : 'reddedildi'}`)
    } catch {
      toast.error('İşlem başarısız')
    } finally {
      setActionLoading(null)
    }
  }

  async function exportExcel() {
    if (!selectedEventId) return
    setActionLoading('export')
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/admin/applications/export/${selectedEventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const event = events.find((e) => e.id === selectedEventId)
      a.download = `guest-list-${event?.title ?? selectedEventId}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Excel indirildi')
    } catch {
      toast.error('Excel indirilemedi')
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = applications.filter(
    (a) => statusFilter === 'ALL' || a.status === statusFilter
  )

  const allFilteredIds = filtered.map((a) => a.id)
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selected.has(id))

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        allFilteredIds.forEach((id) => next.delete(id))
        return next
      })
    } else {
      setSelected((prev) => new Set([...prev, ...allFilteredIds]))
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={selectedEventId}
          onValueChange={(val) => {
            setSelectedEventId(val)
            setStatusFilter('ALL')
            fetchApplications(val)
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Etkinlik seçin" />
          </SelectTrigger>
          <SelectContent>
            {events.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
          disabled={!selectedEventId}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tümü ({applications.length})</SelectItem>
            <SelectItem value="PENDING">
              Bekliyor ({applications.filter((a) => a.status === 'PENDING').length})
            </SelectItem>
            <SelectItem value="APPROVED">
              Onaylı ({applications.filter((a) => a.status === 'APPROVED').length})
            </SelectItem>
            <SelectItem value="REJECTED">
              Reddedildi ({applications.filter((a) => a.status === 'REJECTED').length})
            </SelectItem>
          </SelectContent>
        </Select>

        {selectedEventId && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchApplications(selectedEventId)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        )}

        <div className="ml-auto flex gap-2">
          {selected.size > 0 && (
            <>
              <Button
                size="sm"
                onClick={() => bulkUpdate('APPROVED')}
                disabled={actionLoading === 'bulk'}
              >
                {actionLoading === 'bulk' ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-1" />
                )}
                Onayla ({selected.size})
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => bulkUpdate('REJECTED')}
                disabled={actionLoading === 'bulk'}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reddet ({selected.size})
              </Button>
            </>
          )}
          {selectedEventId && (
            <Button
              size="sm"
              variant="outline"
              onClick={exportExcel}
              disabled={actionLoading === 'export'}
            >
              {actionLoading === 'export' ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              Excel
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {!selectedEventId ? (
        <div className="flex items-center justify-center py-20 text-[var(--text-muted)] text-sm">
          Başvuruları görmek için bir etkinlik seçin
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-[var(--text-muted)] text-sm">
          Bu filtreye uygun başvuru yok
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--bg-subtle)]">
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-[var(--border)] cursor-pointer"
                  />
                </TableHead>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>Yaş</TableHead>
                <TableHead>Meslek</TableHead>
                <TableHead>Cinsiyet</TableHead>
                <TableHead>Instagram</TableHead>
                <TableHead>Başvuru Tarihi</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">Aksiyon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((app) => {
                const user = app.user
                const isLoading = actionLoading === app.id
                return (
                  <TableRow key={app.id} className={selected.has(app.id) ? 'bg-[var(--bg-subtle)]' : ''}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected.has(app.id)}
                        onChange={() => toggleOne(app.id)}
                        className="h-4 w-4 rounded border-[var(--border)] cursor-pointer"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {user ? `${user.firstName} ${user.lastName}` : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-[var(--text-secondary)]">
                      {calculateAge(user?.birthDate ?? null)}
                    </TableCell>
                    <TableCell className="text-sm text-[var(--text-secondary)]">
                      {user?.occupation ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm text-[var(--text-secondary)]">
                      {user?.gender ? GENDER_LABELS[user.gender] ?? user.gender : '—'}
                    </TableCell>
                    <TableCell>
                      {user?.instagram ? (
                        <a
                          href={`https://instagram.com/${user.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-[color:var(--color-primary)] hover:underline"
                        >
                          @{user.instagram}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-[var(--text-muted)]">
                      {new Date(app.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[app.status] ?? 'outline'}>
                        {STATUS_LABELS[app.status] ?? app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {app.status !== 'APPROVED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-green-700 hover:text-green-800"
                            onClick={() => updateStatus(app.id, 'APPROVED')}
                            disabled={isLoading}
                          >
                            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                          </Button>
                        )}
                        {app.status !== 'REJECTED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-red-600 hover:text-red-700"
                            onClick={() => updateStatus(app.id, 'REJECTED')}
                            disabled={isLoading}
                          >
                            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
