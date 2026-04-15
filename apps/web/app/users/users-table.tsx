'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import type { User } from '@repo/types'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ExternalLink, Loader2, Search } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

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

export function UsersTable() {
  const { getToken } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchUsers = useCallback(async (q: string) => {
    setLoading(true)
    try {
      const token = await getToken()
      const url = q
        ? `${API_URL}/admin/users?search=${encodeURIComponent(q)}`
        : `${API_URL}/admin/users`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (!res.ok) throw new Error()
      setUsers(await res.json())
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchUsers(debouncedSearch)
  }, [debouncedSearch, fetchUsers])

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
        <Input
          placeholder="Ad, soyad veya Instagram..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-[var(--text-muted)] text-sm">
          {search ? 'Aramayla eşleşen kullanıcı bulunamadı' : 'Henüz kullanıcı yok'}
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--bg-subtle)]">
                <TableHead>Ad Soyad</TableHead>
                <TableHead>E-posta</TableHead>
                <TableHead>Yaş</TableHead>
                <TableHead>Meslek</TableHead>
                <TableHead>Cinsiyet</TableHead>
                <TableHead>Instagram</TableHead>
                <TableHead>Kayıt Tarihi</TableHead>
                <TableHead>Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-sm">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell className="text-sm text-[var(--text-secondary)]">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-sm text-[var(--text-secondary)]">
                    {calculateAge(user.birthDate)}
                  </TableCell>
                  <TableCell className="text-sm text-[var(--text-secondary)]">
                    {user.occupation ?? '—'}
                  </TableCell>
                  <TableCell className="text-sm text-[var(--text-secondary)]">
                    {user.gender ? GENDER_LABELS[user.gender] ?? user.gender : '—'}
                  </TableCell>
                  <TableCell>
                    {user.instagram ? (
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
                    {new Date(user.createdAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    {user.deletedAt ? (
                      <Badge variant="error">Silindi</Badge>
                    ) : (
                      <Badge variant="success">Aktif</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-xs text-[var(--text-muted)]">{users.length} kullanıcı</p>
    </div>
  )
}
