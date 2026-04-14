import React from 'react'
import { Screen } from '../../src/components/layout/Screen'
import { View } from '../../src/components/primitives/View'
import { Text } from '../../src/components/primitives/Text'

export default function ApplicationsScreen() {
  return (
    <Screen>
      <View flex={1} center>
        <Text variant="h3">Başvurularım</Text>
      </View>
    </Screen>
  )
}
