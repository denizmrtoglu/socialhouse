import { accent, neutral, status } from './colors'

/**
 * Semantic color tokens — dark scheme (always dark for mobile).
 *
 * Theme altyapısı hazır; ileride ColorScheme tipi genişletilebilir.
 * Şimdilik sadece dark değerleri döner.
 */

export type ColorScheme = 'dark' // | 'light'  ← ileride

export const darkColors = {
  background: {
    canvas:   neutral[50],   // #090909 — en altta, root bg
    surface:  neutral[100],  // #111111 — card, section
    elevated: neutral[200],  // #1A1A1A — modal, dropdown
    overlay:  neutral[300],  // #262626 — aktif state, hover bg
  },
  border: {
    subtle:  'rgba(255, 255, 255, 0.06)',
    default: 'rgba(255, 255, 255, 0.10)',
    strong:  'rgba(255, 255, 255, 0.18)',
  },
  text: {
    primary:   neutral[1000], // #F5F5F5
    secondary: neutral[750],  // #A0A0A0
    muted:     neutral[500],  // #555555
    disabled:  neutral[400],  // #363636
    inverse:   neutral[100],  // koyu bg üzerine
  },
  accent: {
    default: accent.DEFAULT,
    light:   accent.light,
    dark:    accent.dark,
    subtle:  accent.subtle,
    muted:   accent.muted,
  },
  status: { ...status },
} as const

export function getSemanticColors(_scheme: ColorScheme = 'dark') {
  // ileride: if (scheme === 'light') return lightColors
  return darkColors
}

export const colors = darkColors
