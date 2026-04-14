import './src/i18n'
import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { theme } from './src/tokens'
import { View } from './src/components/primitives/View'
import { Text } from './src/components/primitives/Text'

export default function App() {
  return (
    <View surface="canvas" flex={1} center>
      <StatusBar style="light" backgroundColor={theme.background.canvas} />
      <Text variant="h3">socialhouse</Text>
      <Text variant="caption" style={{ marginTop: 8 }}>
        UI Kit hazır
      </Text>
    </View>
  )
}
