import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuth } from '@clerk/expo'
import type { Event } from '@repo/types'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View } from '../../src/components/primitives/View'
import { Text } from '../../src/components/primitives/Text'
import { Button } from '../../src/components/ui/Button'
import { apiClient, authHeaders } from '../../src/lib/api'
import { theme, spacing, radius } from '../../src/tokens'

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { getToken } = useAuth()

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken()
        const { data } = await apiClient.get<Event>(`/events/${id}`, {
          headers: token ? authHeaders(token) : {},
        })
        setEvent(data)
      } catch {
        setError('Etkinlik yüklenemedi')
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id, getToken])

  async function handleApply() {
    if (!event) return
    setApplying(true)
    setError('')
    try {
      const token = await getToken()
      await apiClient.post(
        '/applications',
        { eventId: event.id },
        { headers: token ? authHeaders(token) : {} },
      )
      setApplied(true)
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Başvuru gönderilemedi'
      setError(Array.isArray(msg) ? msg[0] : msg)
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <View flex={1} center>
          <ActivityIndicator color={theme.accent.default} />
        </View>
      </SafeAreaView>
    )
  }

  if (!event || error) {
    return (
      <SafeAreaView style={styles.root}>
        <View flex={1} center style={styles.centered}>
          <Text variant="body" color="muted">{error || 'Etkinlik bulunamadı'}</Text>
          <Button label="Geri" onPress={() => router.back()} variant="ghost" />
        </View>
      </SafeAreaView>
    )
  }

  const date = new Date(event.date)
  const dateStr = date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  })
  const timeStr = date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <View style={styles.backRow}>
          <Button label="← Geri" onPress={() => router.back()} variant="ghost" size="sm" />
        </View>

        {/* Cover image */}
        {event.coverImage ? (
          <Image source={{ uri: event.coverImage }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <Text variant="caption" color="muted">Görsel yok</Text>
          </View>
        )}

        {/* Content */}
        <View style={styles.body}>
          <Text variant="h3">{event.title}</Text>

          {/* Meta info */}
          <View style={styles.meta}>
            <MetaRow label="Mekan" value={event.venue} />
            <MetaRow label="Tarih" value={`${dateStr}, ${timeStr}`} />
            <MetaRow label="Kontenjan" value={`${event.guestLimit} kişi`} />
          </View>

          {event.description ? (
            <View style={styles.section}>
              <Text variant="overline">Hakkında</Text>
              <Text variant="body" style={{ marginTop: spacing[2] }}>
                {event.description}
              </Text>
            </View>
          ) : null}

          {error ? (
            <Text variant="caption" style={{ color: theme.status.error }}>
              {error}
            </Text>
          ) : null}
        </View>
      </ScrollView>

      {/* Apply CTA */}
      <View style={styles.footer}>
        {applied ? (
          <View style={styles.appliedBadge}>
            <Text variant="body" style={{ color: theme.status.success }}>
              Başvurun alındı!
            </Text>
          </View>
        ) : (
          <Button
            label="Başvur"
            onPress={handleApply}
            loading={applying}
            fullWidth
          />
        )}
      </View>
    </SafeAreaView>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text variant="overline" style={styles.metaLabel}>{label}</Text>
      <Text variant="body">{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.background.canvas,
  },
  scroll: {
    flex: 1,
  },
  backRow: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
  },
  cover: {
    width: '100%',
    height: 240,
  },
  coverPlaceholder: {
    backgroundColor: theme.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[4],
    gap: spacing[4],
  },
  meta: {
    backgroundColor: theme.background.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.border.subtle,
    paddingVertical: spacing[2],
  },
  metaRow: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[1],
  },
  metaLabel: {
    marginBottom: 2,
  },
  section: {
    gap: spacing[2],
  },
  centered: {
    gap: spacing[4],
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderTopColor: theme.border.subtle,
    backgroundColor: theme.background.canvas,
  },
  appliedBadge: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
