import React, { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native'
import { Link } from 'expo-router'
import { useSignIn } from '@clerk/expo'
import { Screen } from '../../src/components/layout/Screen'
import { View } from '../../src/components/primitives/View'
import { Text } from '../../src/components/primitives/Text'
import { Input } from '../../src/components/ui/Input'
import { Button } from '../../src/components/ui/Button'
import { theme, spacing } from '../../src/tokens'

export default function LoginScreen() {
  const { signIn, setActive, isLoaded } = useSignIn()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!isLoaded) return
    setError('')
    setLoading(true)
    try {
      const result = await signIn.create({ identifier: email, password })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? 'Giriş yapılamadı')
    } finally {
      setLoading(false)
    }
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
            {/* Logo */}
            <View style={styles.logoSection}>
              <Text variant="h2" style={{ color: theme.accent.default }}>
                socialhouse
              </Text>
              <Text variant="body" color="muted">
                Ankara'nın gece hayatı
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
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
                placeholder="••••••••"
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
                label="Giriş Yap"
                onPress={handleLogin}
                loading={loading}
                fullWidth
              />
            </View>

            {/* Signup link */}
            <View center>
              <Text variant="body" color="muted">
                Hesabın yok mu?{' '}
                <Link href="/(auth)/sign-up">
                  <Text variant="body" style={{ color: theme.accent.default }}>
                    Kayıt ol
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
  logoSection: {
    gap: spacing[2],
  },
  form: {
    gap: spacing[4],
  },
})
