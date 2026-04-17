import React, { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native'
import { Link } from 'expo-router'
import { useSignUp } from '@clerk/expo'
import { Screen } from '../../src/components/layout/Screen'
import { View } from '../../src/components/primitives/View'
import { Text } from '../../src/components/primitives/Text'
import { Input } from '../../src/components/ui/Input'
import { Button } from '../../src/components/ui/Button'
import { theme, spacing } from '../../src/tokens'

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [instagram, setInstagram] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')

  async function handleSignUp() {
    if (!isLoaded) return
    setError('')
    setLoading(true)
    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
        unsafeMetadata: { instagram: instagram.replace('@', '') },
      })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? 'Kayıt olunamadı')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify() {
    if (!isLoaded) return
    setError('')
    setLoading(true)
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? 'Doğrulama başarısız')
    } finally {
      setLoading(false)
    }
  }

  if (pendingVerification) {
    return (
      <Screen>
        <View flex={1} style={styles.container}>
          <View style={styles.header}>
            <Text variant="h3">E-postanı doğrula</Text>
            <Text variant="body" color="muted">
              {email} adresine gönderilen kodu gir
            </Text>
          </View>
          <View style={styles.form}>
            <Input
              label="Doğrulama kodu"
              placeholder="123456"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
            />
            {error ? (
              <Text variant="caption" style={{ color: theme.status.error }}>
                {error}
              </Text>
            ) : null}
            <Button label="Doğrula" onPress={handleVerify} loading={loading} fullWidth />
          </View>
        </View>
      </Screen>
    )
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View flex={1} style={styles.container}>
            <View style={styles.header}>
              <Text variant="h3">Hesap oluştur</Text>
              <Text variant="body" color="muted">
                socialhouse'a katıl
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Ad"
                    placeholder="Ad"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Soyad"
                    placeholder="Soyad"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
              <Input
                label="Instagram kullanıcı adı"
                placeholder="kullaniciadi"
                value={instagram}
                onChangeText={setInstagram}
                autoCapitalize="none"
              />
              <Input
                label="E-posta"
                placeholder="ornek@mail.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <Input
                label="Şifre"
                placeholder="En az 8 karakter"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              {error ? (
                <Text variant="caption" style={{ color: theme.status.error }}>
                  {error}
                </Text>
              ) : null}
              <Button
                label="Kayıt Ol"
                onPress={handleSignUp}
                loading={loading}
                fullWidth
              />
            </View>

            <View center>
              <Text variant="body" color="muted">
                Zaten hesabın var mı?{' '}
                <Link href="/(auth)">
                  <Text variant="body" style={{ color: theme.accent.default }}>
                    Giriş yap
                  </Text>
                </Link>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[8],
    justifyContent: 'center',
    gap: spacing[8],
  },
  header: {
    gap: spacing[2],
  },
  form: {
    gap: spacing[4],
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
})
