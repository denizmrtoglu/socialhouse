import React from 'react'
import { View, ViewStyle } from 'react-native'
import { theme } from '../../tokens'

interface DividerProps {
  color?: string
  thickness?: number
  marginV?: number
  style?: ViewStyle
}

export function Divider({
  color = theme.border.subtle,
  thickness = 1,
  marginV = 0,
  style,
}: DividerProps) {
  return (
    <View
      style={[
        {
          height: thickness,
          backgroundColor: color,
          marginVertical: marginV,
        },
        style,
      ]}
    />
  )
}
