import React from 'react'
import { ActivityIndicator, StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native'
import { theme, spacing, radius, fontSize, fontWeight } from '../../tokens'
import { Pressable } from '../primitives/Pressable'
import { Text } from '../primitives/Text'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  label: string
  onPress?: () => void
  variant?: Variant
  size?: Size
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  style?: StyleProp<ViewStyle>
}

const containerStyles: Record<Variant, ViewStyle> = {
  primary: {
    backgroundColor: theme.accent.default,
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: theme.background.elevated,
    borderWidth: 0,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  danger: {
    backgroundColor: theme.status.error,
    borderWidth: 0,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.border.default,
  },
}

const textColors: Record<Variant, string> = {
  primary:   '#FFFFFF',
  secondary: theme.text.primary,
  ghost:     theme.text.secondary,
  danger:    '#FFFFFF',
  outline:   theme.text.primary,
}

const sizeStyles: Record<Size, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: { height: 36, paddingHorizontal: spacing[3], borderRadius: radius.sm },
    text: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  },
  md: {
    container: { height: 48, paddingHorizontal: spacing[5], borderRadius: radius.md },
    text: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  },
  lg: {
    container: { height: 56, paddingHorizontal: spacing[6], borderRadius: radius.lg },
    text: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  },
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      scaleOnPress={0.97}
      style={[
        styles.base,
        containerStyles[variant],
        sizeStyles[size].container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColors[variant]} />
      ) : (
        <Text
          style={[
            sizeStyles[size].text,
            { color: textColors[variant] },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },
})
