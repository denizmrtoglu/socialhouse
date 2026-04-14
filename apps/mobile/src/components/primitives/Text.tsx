import React from 'react'
import { Text as RNText, TextStyle, TextProps as RNTextProps } from 'react-native'
import { theme, fontSize, fontWeight, letterSpacing, lineHeight } from '../../tokens'

type Variant =
  | 'h1'        // 36px bold  — ekran başlığı
  | 'h2'        // 30px bold  — section başlığı
  | 'h3'        // 24px semibold
  | 'h4'        // 20px semibold
  | 'body'      // 15px regular — ana metin
  | 'bodyMd'    // 16px regular
  | 'bodySm'    // 13px regular
  | 'label'     // 13px medium — etiket, badge
  | 'caption'   // 12px regular — alt bilgi, zaman
  | 'overline'  // 11px medium uppercase — section header

const variantStyles: Record<Variant, TextStyle> = {
  h1: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['4xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
    color: theme.text.primary,
  },
  h2: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['3xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
    color: theme.text.primary,
  },
  h3: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize['2xl'] * lineHeight.snug,
    color: theme.text.primary,
  },
  h4: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.xl * lineHeight.snug,
    color: theme.text.primary,
  },
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.base * lineHeight.normal,
    color: theme.text.primary,
  },
  bodyMd: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.md * lineHeight.normal,
    color: theme.text.primary,
  },
  bodySm: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: theme.text.secondary,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: theme.text.primary,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.xs * lineHeight.normal,
    color: theme.text.muted,
  },
  overline: {
    fontSize: 11,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase',
    color: theme.text.muted,
  },
}

interface TextProps extends RNTextProps {
  variant?: Variant
  color?: string
  align?: TextStyle['textAlign']
}

export function Text({ variant = 'body', color, align, style, ...props }: TextProps) {
  return (
    <RNText
      style={[
        variantStyles[variant],
        color ? { color } : undefined,
        align ? { textAlign: align } : undefined,
        style,
      ]}
      {...props}
    />
  )
}
