/**
 * Typography tokens.
 * Font family TBD — placeholder değerler kullanılıyor.
 * Değiştirmek için sadece fontFamily sabitlerini güncelle.
 */

export const fontFamily = {
  /** Ana font — başlıklar, body. Değiştirilecek. */
  sans: 'System', // iOS: SF Pro, Android: Roboto — ileride özel font
  /** Monospace — kod gösterimi */
  mono: 'monospace',
} as const

export const fontSize = {
  xs:   12,
  sm:   13,
  base: 15,
  md:   16,
  lg:   18,
  xl:   20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const

export const fontWeight = {
  regular:  '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
} as const

export const lineHeight = {
  tight:   1.2,
  snug:    1.35,
  normal:  1.5,
  relaxed: 1.65,
} as const

export const letterSpacing = {
  tight:  -0.5,
  normal:  0,
  wide:    0.5,
  wider:   1,
  widest:  2,
} as const
