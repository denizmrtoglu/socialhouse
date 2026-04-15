import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { useAuth } from '@clerk/clerk-expo'
import type { Application } from '@repo/types'
import { ApplicationStatus } from '@repo/types'
import { Screen } from '../../src/components/layout/Screen'
import { View } from '../../src/components/primitives/View'
import { Text } from '../../src/components/primitives/Text'
import { Card } from '../../src/components/ui/Card'
import { apiClient, authHeaders } from '../../src/lib/api'
import { theme, spacing, radius } from '../../src/tokens'

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]:  'Beklemede',
  [ApplicationStatus.APPROVED]: 'Onaylandı',
  [ApplicationStatus.REJECTED]: 'Reddedildi',
}

const STATUS_COLOR: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]:  theme.status.warning,
  [ApplicationStatus.APPROVED]: theme.status.success,
  [ApplicationStatus.REJECTED]: theme.status.error,
}

export default function ApplicationsScreen() {
  const { getToken } = useAuth()

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const fetchApplications = useCallback(async () => {
    try {
      setError('')
      const token = await getToken()
      const { data } = await apiClient.get<Application[]>('/applications/me', {
        headers: token ? authHeaders(token) : {},
      })
      setApplications(data)
    } catch {
      setError('Başvurular yüklenemedi')
    }
  }, [getToken])

  useEffect(() => {
    fetchApplications().finally(() => setLoading(false))
  }, [fetchApplications])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchApplications()
    setRefreshing(false)
  }, [fetchApplications])

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
        data={applications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="h3">Başvurularım</Text>
          </View>
        }
        ListEmptyComponent={
          <View center style={styles.empty}>
            {error ? (
              <Text variant="body" color="muted">{error}</Text>
            ) : (
              <Text variant="body" color="muted">Henüz başvurun yok</Text>
            )}
          </View>
        }
        renderItem={({ item }) => <ApplicationCard application={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </Screen>
  )
}

function ApplicationCard({ application }: { application: Application }) {
  const event = application.event
  const date = event ? new Date(event.date) : null
  const dateStr = date
    ? date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })
    : '—'
  const status = application.status as ApplicationStatus

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
        <Text variant="bodySm">{dateStr}</Text>
        <Text variant="caption" color="muted">
          Başvuru: {new Date(application.createdAt).toLocaleDateString('tr-TR')}
        </Text>
      </View>
    </Card>
  )
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <View style={[styles.badge, { backgroundColor: STATUS_COLOR[status] + '22' }]}>
      <Text variant="label" style={{ color: STATUS_COLOR[status] }}>
        {STATUS_LABEL[status]}
      </Text>
    </View>
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
    gap: spacing[1],
  },
  badge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
})
