import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { theme, radius, spacing, fontSize, fontWeight } from '../../tokens'
import { Text } from '../primitives/Text'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'muted'

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: theme.accent.subtle,          text: theme.accent.default },
  success: { bg: theme.status.successSubtle,   text: theme.status.success },
  warning: { bg: theme.status.warningSubtle,   text: theme.status.warning },
  error:   { bg: theme.status.errorSubtle,     text: theme.status.error },
  info:    { bg: theme.status.infoSubtle,      text: theme.status.info },
  muted:   { bg: theme.background.elevated,    text: theme.text.muted },
}

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  style?: ViewStyle
}

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const { bg, text } = variantStyles[variant]

  return (
    <View style={[styles.container, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: text }]}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2] + 2,
    paddingVertical: spacing[1] - 1,
    borderRadius: radius.full,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
})
