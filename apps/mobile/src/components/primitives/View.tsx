import React from 'react'
import { View as RNView, ViewStyle, ViewProps as RNViewProps } from 'react-native'
import { theme } from '../../tokens'

type Surface = 'canvas' | 'surface' | 'elevated' | 'overlay' | 'transparent'

const surfaceColors: Record<Surface, string> = {
  canvas:      theme.background.canvas,
  surface:     theme.background.surface,
  elevated:    theme.background.elevated,
  overlay:     theme.background.overlay,
  transparent: 'transparent',
}

interface ViewProps extends RNViewProps {
  surface?: Surface
  flex?: number
  row?: boolean
  center?: boolean
  padding?: number
  paddingH?: number
  paddingV?: number
}

export function View({
  surface,
  flex,
  row,
  center,
  padding,
  paddingH,
  paddingV,
  style,
  ...props
}: ViewProps) {
  const computed: ViewStyle = {
    ...(surface ? { backgroundColor: surfaceColors[surface] } : {}),
    ...(flex !== undefined ? { flex } : {}),
    ...(row ? { flexDirection: 'row' } : {}),
    ...(center ? { alignItems: 'center', justifyContent: 'center' } : {}),
    ...(padding !== undefined ? { padding } : {}),
    ...(paddingH !== undefined ? { paddingHorizontal: paddingH } : {}),
    ...(paddingV !== undefined ? { paddingVertical: paddingV } : {}),
  }

  return <RNView style={[computed, style]} {...props} />
}
