import React from 'react'
import { Image, View, StyleSheet, ViewStyle, Text } from 'react-native'
import { theme, radius, fontSize, fontWeight } from '../../tokens'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const sizeMap: Record<AvatarSize, number> = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 72,
}

const fontSizeMap: Record<AvatarSize, number> = {
  xs: fontSize.xs,
  sm: fontSize.sm,
  md: fontSize.md,
  lg: fontSize.xl,
  xl: fontSize['2xl'],
}

interface AvatarProps {
  uri?: string | null
  initials?: string
  size?: AvatarSize
  style?: ViewStyle
}

export function Avatar({ uri, initials, size = 'md', style }: AvatarProps) {
  const dimension = sizeMap[size]

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
    overflow: 'hidden',
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  }

  return (
    <View style={[containerStyle, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      ) : (
        <Text
          style={{
            fontSize: fontSizeMap[size],
            fontWeight: fontWeight.semibold,
            color: theme.text.secondary,
            textAlign: 'center',
          }}
        >
          {initials ?? '?'}
        </Text>
      )}
    </View>
  )
}
