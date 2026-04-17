import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, StyleSheet, Image, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@clerk/expo'
import type { Event } from '@repo/types'
import { Screen } from '../../src/components/layout/Screen'
import { View } from '../../src/components/primitives/View'
import { Text } from '../../src/components/primitives/Text'
import { Card } from '../../src/components/ui/Card'
import { apiClient, authHeaders } from '../../src/lib/api'
import { theme, spacing, radius } from '../../src/tokens'

export default function EventsScreen() {
  const router = useRouter()
  const { getToken } = useAuth()

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const fetchEvents = useCallback(async () => {
    try {
      setError('')
      const token = await getToken()
      const { data } = await apiClient.get<Event[]>('/events', {
        headers: token ? authHeaders(token) : {},
      })
      setEvents(data)
    } catch {
      setError('Etkinlikler yüklenemedi')
    }
  }, [getToken])

  useEffect(() => {
    fetchEvents().finally(() => setLoading(false))
  }, [fetchEvents])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchEvents()
    setRefreshing(false)
  }, [fetchEvents])

  if (loading) {
    return (
      <Screen>
        <View flex={1} center>
          <ActivityIndicator color={theme.accent.default} />
        </View>
      </Screen>
    )
  }

  if (error) {
    return (
      <Screen>
        <View flex={1} center>
          <Text variant="body" color="muted">{error}</Text>
        </View>
      </Screen>
    )
  }

  return (
    <Screen scrollable={false} paddingH={0} paddingTop={0}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="h2" style={{ color: theme.accent.default }}>socialhouse</Text>
            <Text variant="body" color="muted">Yaklaşan etkinlikler</Text>
          </View>
        }
        ListEmptyComponent={
          <View center style={styles.empty}>
            <Text variant="body" color="muted">Şu an aktif etkinlik yok</Text>
          </View>
        }
        renderItem={({ item }) => (
          <EventCard event={item} onPress={() => router.push(`/(app)/event/${item.id}`)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </Screen>
  )
}

function EventCard({ event, onPress }: { event: Event; onPress: () => void }) {
  const date = new Date(event.date)
  const dateStr = date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  })
  const timeStr = date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Card onPress={onPress} surface="surface" style={styles.card} bordered>
      {event.coverImage ? (
        <Image source={{ uri: event.coverImage }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Text variant="caption" color="muted">Görsel yok</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text variant="h4">{event.title}</Text>
        <Text variant="caption" color="muted" style={styles.venue}>
          {event.venue}
        </Text>
        <View style={styles.dateRow} row>
          <Text variant="caption" style={{ color: theme.accent.default }}>
            {dateStr}
          </Text>
          <Text variant="caption" color="muted">  ·  {timeStr}</Text>
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
    gap: spacing[3],
  },
  header: {
    paddingBottom: spacing[4],
    gap: spacing[1],
  },
  empty: {
    paddingTop: spacing[12],
  },
  separator: {
    height: spacing[3],
  },
  card: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: radius.lg,
  },
  cover: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  coverPlaceholder: {
    backgroundColor: theme.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: spacing[4],
    gap: spacing[1],
  },
  venue: {
    marginTop: spacing[1],
  },
  dateRow: {
    marginTop: spacing[2],
    flexWrap: 'wrap',
  },
})
