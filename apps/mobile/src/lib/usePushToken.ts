import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { useAuth } from '@clerk/clerk-expo'
import { apiClient, authHeaders } from './api'

/**
 * Registers for push notifications and saves the Expo push token to the API.
 * Call this once at app startup (e.g. in the (app) layout).
 */
export function usePushToken() {
  const { getToken, isSignedIn } = useAuth()

  useEffect(() => {
    if (!isSignedIn) return

    async function register() {
      try {
        // Permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync()
        let finalStatus = existingStatus
        if (finalStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync()
          finalStatus = status
        }
        if (finalStatus !== 'granted') return

        // Android channel
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
          })
        }

        // Expo push token
        const tokenData = await Notifications.getExpoPushTokenAsync()
        const expoPushToken = tokenData.data

        // Save to API
        const jwt = await getToken()
        if (!jwt) return
        await apiClient.patch(
          '/users/me/push-token',
          { expoPushToken },
          { headers: authHeaders(jwt) },
        )
      } catch {
        // Non-critical — silently ignore
      }
    }

    register()
  }, [isSignedIn, getToken])
}
