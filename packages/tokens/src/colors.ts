/**
 * Primitive color palette.
 * Prefer semantic tokens in application code.
 */

export const neutral = {
  0:    '#000000',
  50:   '#090909',
  100:  '#111111',
  150:  '#141414',
  200:  '#1A1A1A',
  250:  '#202020',
  300:  '#262626',
  400:  '#363636',
  500:  '#555555',
  600:  '#717171',
  700:  '#8F8F8F',
  750:  '#A0A0A0',
  800:  '#B8B8B8',
  850:  '#CACACA',
  900:  '#D9D9D9',
  950:  '#ECECEC',
  1000: '#F5F5F5',
} as const

/**
 * Primary accent color — placeholder warm gold.
 * Change `DEFAULT` when the final primary is decided.
 */
export const accent = {
  DEFAULT: '#C4A35A',
  light:   '#D4B56A',
  dark:    '#A88840',
  subtle:  'rgba(196, 163, 90, 0.15)',
  muted:   'rgba(196, 163, 90, 0.08)',
} as const

export const status = {
  success:       '#22C55E',
  successSubtle: 'rgba(34, 197, 94, 0.15)',
  warning:       '#F59E0B',
  warningSubtle: 'rgba(245, 158, 11, 0.15)',
  error:         '#EF4444',
  errorSubtle:   'rgba(239, 68, 68, 0.15)',
  info:          '#3B82F6',
  infoSubtle:    'rgba(59, 130, 246, 0.15)',
} as const
