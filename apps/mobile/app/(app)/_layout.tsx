import React from 'react'
import { Tabs, Redirect } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { CalendarDays, ClipboardList, Gift, User } from 'lucide-react-native'
import { theme } from '../../src/tokens'
import { usePushToken } from '../../src/lib/usePushToken'

export default function AppLayout() {
  const { isSignedIn, isLoaded } = useAuth()
  usePushToken()

  if (!isLoaded) return null
  if (!isSignedIn) return <Redirect href="/(auth)" />

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background.surface,
          borderTopColor: theme.border.default,
        },
        tabBarActiveTintColor: theme.accent.default,
        tabBarInactiveTintColor: theme.text.muted,
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Etkinlikler',
          tabBarIcon: ({ color, size }) => <CalendarDays size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Başvurularım',
          tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="offers"
        options={{
          title: 'Tekliflerim',
          tabBarIcon: ({ color, size }) => <Gift size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
