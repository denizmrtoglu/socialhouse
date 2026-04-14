import React, { ReactNode } from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'
import { theme, radius, spacing, shadows } from '../../tokens'
import { Pressable } from '../primitives/Pressable'
import { View } from '../primitives/View'

type CardSurface = 'surface' | 'elevated' | 'overlay'

interface CardProps {
  children: ReactNode
  onPress?: () => void
  surface?: CardSurface
  padding?: number
  style?: StyleProp<ViewStyle>
  /** Kenarlık göster */
  bordered?: boolean
}

const surfaceBg: Record<CardSurface, string> = {
  surface:  theme.background.surface,
  elevated: theme.background.elevated,
  overlay:  theme.background.overlay,
}

export function Card({
  children,
  onPress,
  surface = 'surface',
  padding = spacing[4],
  bordered = true,
  style,
}: CardProps) {
  const cardStyle: ViewStyle = {
    backgroundColor: surfaceBg[surface],
    borderRadius: radius.lg,
    padding,
    borderWidth: bordered ? 1 : 0,
    borderColor: theme.border.subtle,
    ...shadows.sm,
  }

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={[cardStyle, style]}>
        {children}
      </Pressable>
    )
  }

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  )
}
