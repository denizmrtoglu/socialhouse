import '../src/i18n'
import React from 'react'
import { Stack } from 'expo-router'
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'
import { tokenCache } from '../src/lib/clerk-token-cache'
import { StatusBar } from 'expo-status-bar'
import { theme } from '../src/tokens'

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <StatusBar style="light" backgroundColor={theme.background.canvas} />
        <Stack screenOptions={{ headerShown: false }} />
      </ClerkLoaded>
    </ClerkProvider>
  )
}
