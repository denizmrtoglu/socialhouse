'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { Event } from '@repo/types'
import { ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface EventFormProps {
  event?: Event
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter()
  const { getToken } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [coverImage, setCoverImage] = useState(event?.coverImage ?? '')
  const [coverPreview, setCoverPreview] = useState(event?.coverImage ?? '')

  const isEdit = !!event

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const token = await getToken()

      // 1. Presigned URL al
      const presignRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/storage/presigned-url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
          }),
        }
      )
      if (!presignRes.ok) throw new Error('Presigned URL alınamadı')
      const { uploadUrl, fileUrl } = await presignRes.json()

      // 2. S3'e direkt yükle
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!uploadRes.ok) throw new Error('Görsel yüklenemedi')

      setCoverImage(fileUrl)
      setCoverPreview(URL.createObjectURL(file))
      toast.success('Görsel yüklendi')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Görsel yüklenemedi')
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const data = {
      title: (form.elements.namedItem('title') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value || undefined,
      coverImage: coverImage || undefined,
      date: (form.elements.namedItem('date') as HTMLInputElement).value,
      venue: (form.elements.namedItem('venue') as HTMLInputElement).value,
      ticketUrl: (form.elements.namedItem('ticketUrl') as HTMLInputElement).value || undefined,
      guestLimit: parseInt((form.elements.namedItem('guestLimit') as HTMLInputElement).value, 10),
      autoApproveAll: (form.elements.namedItem('autoApproveAll') as HTMLInputElement).checked,
      autoApproveFemale: (form.elements.namedItem('autoApproveFemale') as HTMLInputElement).checked,
    }

    try {
      const token = await getToken()
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/events/${event.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/events`

      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'İşlem başarısız')
      }

      toast.success(isEdit ? 'Etkinlik güncellendi' : 'Etkinlik oluşturuldu')
      router.push('/events')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  // datetime-local input için ISO'dan local format'a çevir
  const defaultDate = event?.date
    ? new Date(event.date).toISOString().slice(0, 16)
    : ''

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Kapak Görseli */}
      <div className="space-y-2">
        <Label>Kapak Görseli</Label>
        <div
          className="relative flex h-48 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-canvas)] transition-colors overflow-hidden"
          onClick={() => fileInputRef.current?.click()}
        >
          {coverPreview ? (
            <img src={coverPreview} alt="Kapak" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
              <ImageIcon className="h-8 w-8" />
              <span className="text-sm">Görsel seçmek için tıklayın</span>
            </div>
          )}
          {uploadingImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>

      {/* Başlık */}
      <div className="space-y-2">
        <Label htmlFor="title">Başlık *</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={event?.title}
          placeholder="Etkinlik başlığı"
        />
      </div>

      {/* Açıklama */}
      <div className="space-y-2">
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={event?.description ?? ''}
          placeholder="Etkinlik hakkında kısa bir açıklama..."
        />
      </div>

      {/* Tarih & Mekan */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Tarih & Saat *</Label>
          <Input
            id="date"
            name="date"
            type="datetime-local"
            required
            defaultValue={defaultDate}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="venue">Mekan *</Label>
          <Input
            id="venue"
            name="venue"
            required
            defaultValue={event?.venue}
            placeholder="Mekan adı"
          />
        </div>
      </div>

      {/* Ticket URL & Guest Limit */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ticketUrl">Bilet URL (opsiyonel)</Label>
          <Input
            id="ticketUrl"
            name="ticketUrl"
            type="url"
            defaultValue={event?.ticketUrl ?? ''}
            placeholder="https://biletinial.com/..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guestLimit">Kontenjan *</Label>
          <Input
            id="guestLimit"
            name="guestLimit"
            type="number"
            required
            min={1}
            defaultValue={event?.guestLimit ?? 100}
          />
        </div>
      </div>

      {/* Auto Approve */}
      <div className="space-y-3">
        <Label>Otomatik Onay</Label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="autoApproveAll"
              defaultChecked={event?.autoApproveAll ?? false}
              className="h-4 w-4 rounded border-[var(--border)]"
            />
            <span className="text-sm text-[var(--text-secondary)]">Herkesi otomatik onayla</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="autoApproveFemale"
              defaultChecked={event?.autoApproveFemale ?? false}
              className="h-4 w-4 rounded border-[var(--border)]"
            />
            <span className="text-sm text-[var(--text-secondary)]">Kadın başvurularını otomatik onayla</span>
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading || uploadingImage}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEdit ? 'Güncelle' : 'Oluştur'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          İptal
        </Button>
      </div>
    </form>
  )
}
