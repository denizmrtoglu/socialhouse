import React, { useCallback, useEffect, useState } from 'react'
import {
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native'
import { useAuth } from '@clerk/expo'
import type { Offer, Event } from '@repo/types'
import { OfferType, OfferStatus } from '@repo/types'
import { Screen } from '../../src/components/layout/Screen'
import { View } from '../../src/components/primitives/View'
import { Text } from '../../src/components/primitives/Text'
import { Card } from '../../src/components/ui/Card'
import { Button } from '../../src/components/ui/Button'
import { apiClient, authHeaders } from '../../src/lib/api'
import { theme, spacing, radius } from '../../src/tokens'

const STATUS_LABEL: Record<OfferStatus, string> = {
  [OfferStatus.PENDING]:     'Beklemede',
  [OfferStatus.IN_PROGRESS]: 'İnceleniyor',
  [OfferStatus.COMMUNICATED]:'İletişime Geçildi',
}

const STATUS_COLOR: Record<OfferStatus, string> = {
  [OfferStatus.PENDING]:     theme.status.warning,
  [OfferStatus.IN_PROGRESS]: theme.accent.default,
  [OfferStatus.COMMUNICATED]:theme.status.success,
}

const TYPE_LABEL: Record<OfferType, string> = {
  [OfferType.BISTRO]:    'Bistro / Masa',
  [OfferType.BACKSTAGE]: 'Backstage',
}

export default function OffersScreen() {
  const { getToken } = useAuth()

  const [offers, setOffers] = useState<Offer[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setError('')
      const token = await getToken()
      const headers = token ? authHeaders(token) : {}
      const [offersRes, eventsRes] = await Promise.all([
        apiClient.get<Offer[]>('/offers/me', { headers }),
        apiClient.get<Event[]>('/events', { headers }),
      ])
      setOffers(offersRes.data)
      setEvents(eventsRes.data)
    } catch {
      setError('Veriler yüklenemedi')
    }
  }, [getToken])

  useEffect(() => {
    fetchData().finally(() => setLoading(false))
  }, [fetchData])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }, [fetchData])

  const handleOfferSent = useCallback(() => {
    setShowModal(false)
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <Screen>
        <View flex={1} center>
          <ActivityIndicator color={theme.accent.default} />
        </View>
      </Screen>
    )
  }

  return (
    <Screen scrollable={false} paddingH={0} paddingTop={0}>
      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <View style={styles.header}>
            <View row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="h3">Tekliflerim</Text>
              <Button
                label="+ Teklif Gönder"
                size="sm"
                variant="outline"
                onPress={() => setShowModal(true)}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View center style={styles.empty}>
            {error ? (
              <Text variant="body" color="muted">{error}</Text>
            ) : (
              <Text variant="body" color="muted">Henüz teklifin yok</Text>
            )}
          </View>
        }
        renderItem={({ item }) => <OfferCard offer={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <SendOfferModal
        visible={showModal}
        events={events}
        onClose={() => setShowModal(false)}
        onSent={handleOfferSent}
        getToken={getToken}
      />
    </Screen>
  )
}

function OfferCard({ offer }: { offer: Offer }) {
  const event = offer.event
  const status = offer.status as OfferStatus
  const type = offer.type as OfferType

  return (
    <Card surface="surface" bordered>
      <View style={styles.cardHeader} row>
        <View style={{ flex: 1 }}>
          <Text variant="h4">{event?.title ?? '—'}</Text>
          <Text variant="caption" color="muted">{event?.venue ?? '—'}</Text>
        </View>
        <StatusBadge status={status} />
      </View>
      <View style={styles.cardMeta}>
        <Text variant="label" style={{ color: theme.text.secondary }}>
          {TYPE_LABEL[type]}
        </Text>
        {offer.note ? (
          <Text variant="bodySm" style={{ marginTop: spacing[1] }}>
            {offer.note}
          </Text>
        ) : null}
        {offer.adminNote ? (
          <View style={styles.adminNote}>
            <Text variant="overline">Yönetici Notu</Text>
            <Text variant="bodySm">{offer.adminNote}</Text>
          </View>
        ) : null}
        <Text variant="caption" color="muted" style={{ marginTop: spacing[2] }}>
          Gönderildi: {new Date(offer.createdAt).toLocaleDateString('tr-TR')}
        </Text>
      </View>
    </Card>
  )
}

function StatusBadge({ status }: { status: OfferStatus }) {
  return (
    <View style={[styles.badge, { backgroundColor: STATUS_COLOR[status] + '22' }]}>
      <Text variant="label" style={{ color: STATUS_COLOR[status] }}>
        {STATUS_LABEL[status]}
      </Text>
    </View>
  )
}

// ---------- Send Offer Modal ----------

interface SendOfferModalProps {
  visible: boolean
  events: Event[]
  onClose: () => void
  onSent: () => void
  getToken: () => Promise<string | null>
}

function SendOfferModal({ visible, events, onClose, onSent, getToken }: SendOfferModalProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<OfferType>(OfferType.BISTRO)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!selectedEventId) {
      setError('Lütfen bir etkinlik seç')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const token = await getToken()
      await apiClient.post(
        '/offers',
        { eventId: selectedEventId, type: selectedType, note: note.trim() || undefined },
        { headers: token ? authHeaders(token) : {} },
      )
      setNote('')
      setSelectedEventId(null)
      onSent()
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Teklif gönderilemedi'
      setError(Array.isArray(msg) ? msg[0] : msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modal}>
        <View style={styles.modalHeader} row>
          <Text variant="h3">Teklif Gönder</Text>
          <TouchableOpacity onPress={onClose}>
            <Text variant="body" style={{ color: theme.text.muted }}>İptal</Text>
          </TouchableOpacity>
        </View>

        {/* Event picker */}
        <Text variant="label" style={styles.fieldLabel}>Etkinlik</Text>
        <View style={styles.optionList}>
          {events.map((ev) => (
            <TouchableOpacity
              key={ev.id}
              onPress={() => setSelectedEventId(ev.id)}
              style={[
                styles.optionItem,
                selectedEventId === ev.id && styles.optionSelected,
              ]}
            >
              <Text
                variant="body"
                style={selectedEventId === ev.id ? { color: theme.accent.default } : {}}
              >
                {ev.title}
              </Text>
            </TouchableOpacity>
          ))}
          {events.length === 0 && (
            <Text variant="bodySm" color="muted">Aktif etkinlik yok</Text>
          )}
        </View>

        {/* Type picker */}
        <Text variant="label" style={styles.fieldLabel}>Teklif Türü</Text>
        <View row style={styles.typeRow}>
          {(Object.values(OfferType) as OfferType[]).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setSelectedType(t)}
              style={[
                styles.typeChip,
                selectedType === t && styles.typeChipSelected,
              ]}
            >
              <Text
                variant="label"
                style={selectedType === t ? { color: theme.accent.default } : { color: theme.text.secondary }}
              >
                {TYPE_LABEL[t]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note */}
        <Text variant="label" style={styles.fieldLabel}>Not (isteğe bağlı)</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="Eklemek istediğin bir şey var mı?"
          placeholderTextColor={theme.text.muted}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
        />

        {error ? (
          <Text variant="caption" style={{ color: theme.status.error }}>{error}</Text>
        ) : null}

        <Button
          label="Gönder"
          onPress={handleSubmit}
          loading={submitting}
          fullWidth
        />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
  },
  header: {
    paddingBottom: spacing[4],
  },
  empty: {
    paddingTop: spacing[12],
  },
  separator: {
    height: spacing[3],
  },
  cardHeader: {
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  cardMeta: {
    marginTop: spacing[3],
  },
  adminNote: {
    marginTop: spacing[2],
    padding: spacing[3],
    backgroundColor: theme.background.elevated,
    borderRadius: radius.sm,
    gap: spacing[1],
  },
  badge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  // Modal
  modal: {
    flex: 1,
    backgroundColor: theme.background.canvas,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[6],
    gap: spacing[3],
  },
  modalHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  fieldLabel: {
    marginTop: spacing[1],
  },
  optionList: {
    gap: spacing[2],
  },
  optionItem: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.border.default,
  },
  optionSelected: {
    borderColor: theme.accent.default,
    backgroundColor: theme.accent.default + '11',
  },
  typeRow: {
    gap: spacing[3],
  },
  typeChip: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.border.default,
  },
  typeChipSelected: {
    borderColor: theme.accent.default,
    backgroundColor: theme.accent.default + '11',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: theme.border.default,
    borderRadius: radius.md,
    padding: spacing[3],
    color: theme.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
})
