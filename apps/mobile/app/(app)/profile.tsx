import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useAuth, useUser } from '@clerk/clerk-expo'
import type { User } from '@repo/types'
import { Gender } from '@repo/types'
import { Screen } from '../../src/components/layout/Screen'
import { View } from '../../src/components/primitives/View'
import { Text } from '../../src/components/primitives/Text'
import { Card } from '../../src/components/ui/Card'
import { Input } from '../../src/components/ui/Input'
import { Button } from '../../src/components/ui/Button'
import { apiClient, authHeaders } from '../../src/lib/api'
import { theme, spacing, radius } from '../../src/tokens'

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: Gender.MALE,   label: 'Erkek' },
  { value: Gender.FEMALE, label: 'Kadın' },
  { value: Gender.OTHER,  label: 'Diğer' },
]

export default function ProfileScreen() {
  const { signOut, getToken } = useAuth()
  const { user: clerkUser } = useUser()

  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  // Edit fields
  const [gender, setGender] = useState<Gender | null>(null)
  const [occupation, setOccupation] = useState('')
  const [birthDate, setBirthDate] = useState('')  // YYYY-MM-DD

  const fetchProfile = useCallback(async () => {
    try {
      const token = await getToken()
      const { data } = await apiClient.get<User>('/users/me', {
        headers: token ? authHeaders(token) : {},
      })
      setProfile(data)
      setGender((data.gender as Gender) ?? null)
      setOccupation(data.occupation ?? '')
      setBirthDate(data.birthDate ? data.birthDate.split('T')[0] : '')
    } catch {
      setError('Profil yüklenemedi')
    }
  }, [getToken])

  useEffect(() => {
    fetchProfile().finally(() => setLoading(false))
  }, [fetchProfile])

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const token = await getToken()
      await apiClient.patch(
        '/users/me',
        {
          ...(gender ? { gender } : {}),
          ...(occupation.trim() ? { occupation: occupation.trim() } : {}),
          ...(birthDate ? { birthDate: new Date(birthDate).toISOString() } : {}),
        },
        { headers: token ? authHeaders(token) : {} },
      )
      await fetchProfile()
      setSaved(true)
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Kaydedilemedi'
      setError(Array.isArray(msg) ? msg[0] : msg)
    } finally {
      setSaving(false)
    }
  }

  const isOnboarded = profile && profile.gender && profile.birthDate && profile.occupation

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
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h3">Profil</Text>
        {clerkUser && (
          <Text variant="body" color="muted">
            {clerkUser.firstName} {clerkUser.lastName}
          </Text>
        )}
      </View>

      {/* Info card */}
      {profile && (
        <Card surface="surface" bordered style={styles.infoCard}>
          <InfoRow label="E-posta" value={profile.email} />
          <InfoRow label="Instagram" value={`@${profile.instagram}`} />
          {profile.occupation && <InfoRow label="Meslek" value={profile.occupation} />}
          {profile.birthDate && (
            <InfoRow
              label="Doğum Tarihi"
              value={new Date(profile.birthDate).toLocaleDateString('tr-TR')}
            />
          )}
        </Card>
      )}

      {/* Onboarding banner */}
      {!isOnboarded && (
        <View style={styles.banner}>
          <Text variant="label" style={{ color: theme.status.warning }}>
            Profil eksik — lütfen bilgileri tamamla
          </Text>
        </View>
      )}

      {/* Edit form */}
      <View style={styles.form}>
        <Text variant="overline">Profili Güncelle</Text>

        {/* Gender */}
        <View style={styles.field}>
          <Text variant="label" style={styles.fieldLabel}>Cinsiyet</Text>
          <View row style={styles.genderRow}>
            {GENDER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setGender(opt.value)}
                style={[
                  styles.chip,
                  gender === opt.value && styles.chipSelected,
                ]}
              >
                <Text
                  variant="label"
                  style={gender === opt.value ? { color: theme.accent.default } : { color: theme.text.secondary }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Input
          label="Meslek"
          placeholder="Öğrenci, mühendis, tasarımcı..."
          value={occupation}
          onChangeText={setOccupation}
          autoCapitalize="sentences"
        />

        <Input
          label="Doğum Tarihi (YYYY-AA-GG)"
          placeholder="1999-01-15"
          value={birthDate}
          onChangeText={setBirthDate}
          keyboardType="numbers-and-punctuation"
        />

        {error ? (
          <Text variant="caption" style={{ color: theme.status.error }}>{error}</Text>
        ) : null}
        {saved ? (
          <Text variant="caption" style={{ color: theme.status.success }}>Kaydedildi!</Text>
        ) : null}

        <Button label="Kaydet" onPress={handleSave} loading={saving} fullWidth />
      </View>

      {/* Sign out */}
      <View style={styles.signOut}>
        <Button
          label="Çıkış Yap"
          variant="ghost"
          onPress={() => signOut()}
          fullWidth
        />
      </View>
    </Screen>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text variant="overline" style={styles.infoLabel}>{label}</Text>
      <Text variant="body">{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    gap: spacing[1],
    marginBottom: spacing[4],
  },
  infoCard: {
    marginBottom: spacing[4],
    gap: 0,
    padding: 0,
  },
  infoRow: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.border.subtle,
    gap: spacing[1],
  },
  infoLabel: {
    marginBottom: 2,
  },
  banner: {
    padding: spacing[3],
    backgroundColor: theme.status.warning + '22',
    borderRadius: radius.md,
    marginBottom: spacing[4],
  },
  form: {
    gap: spacing[4],
    marginBottom: spacing[4],
  },
  field: {
    gap: spacing[2],
  },
  fieldLabel: {},
  genderRow: {
    gap: spacing[2],
  },
  chip: {
    flex: 1,
    paddingVertical: spacing[2],
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.border.default,
  },
  chipSelected: {
    borderColor: theme.accent.default,
    backgroundColor: theme.accent.default + '11',
  },
  signOut: {
    marginTop: spacing[2],
  },
})
