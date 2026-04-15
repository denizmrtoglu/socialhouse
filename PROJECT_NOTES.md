# socialhouse - Project Notes

## Project Vision

SocialHouse, Ankara merkezli bir event/nightlife markasının community uygulamasıdır. Kullanıcılar etkinliklere guest list başvurusu yapar, admin panel üzerinden başvurular yönetilir. Yüksek profilli bir kitleyi tutmak için başvuru + onay sistemi çalışır.

**Kitle:** Ankara gece hayatı topluluğu  
**Temel değer önerisi:** Seçici guest list sistemi ile kaliteli katılımcı kitlesi  
**MVP kapsamı:** Guest list başvuru + onay, Bistro/Backstage teklif sistemi, admin panel, Expo mobile uygulama

---

## Tech Stack Özeti

| Katman | Teknoloji |
|---|---|
| Monorepo | Turborepo |
| Mobile | Expo (React Native) + RTK Query |
| Admin Panel | Next.js 14 (App Router) |
| Backend | NestJS + Prisma |
| Database | PostgreSQL (Supabase) |
| Auth | Clerk |
| Storage | AWS S3 (presigned URL) |
| Queue | BullMQ + Redis |
| Push | Expo Push Notifications |
| Deploy | Vercel (web) + Railway (api + redis) |

---

## Session Notes

### [2026-04-13] Initial Setup
- Frame project initialized

### [2026-04-14] UI Kit Oluşturuldu

#### Genel Kararlar
- **Web (admin panel):** light mode sabit, Türkçe hardcoded — i18n ve dark mode yok
- **Mobile:** dark mode sabit (lüks estetik), TR + EN dil desteği
- **Theme altyapısı:** pasif ama hazır — ileride sadece `semantic.ts` + `globals.css` güncellemesiyle aktifleşir
- **Primary renk ve font TBD** — placeholder olarak warm gold (`#C4A35A`) kullanıldı

#### packages/tokens
Platform-agnostic TypeScript sabitleri. Hem mobile hem web consume eder.
- `colors.ts` — primitive palette (neutral scale, accent, status)
- `semantic.ts` — dark mode semantic token'ları; `getSemanticColors()` ile theme altyapısı hazır
- `typography.ts`, `spacing.ts`, `radius.ts`, `shadows.ts`

**Renk değiştirmek için:**
- Mobile/ortak: `packages/tokens/src/colors.ts` → `accent.DEFAULT`
- Web: `apps/web/app/globals.css` → `--color-primary`

**Font değiştirmek için:**
- `packages/tokens/src/typography.ts` → `fontFamily.sans`

#### apps/web — Admin Panel UI
- **Tailwind CSS v4** + postcss
- `globals.css`: `@theme` (Tailwind token'ları) + `:root` CSS variables (sidebar koyu, content açık)
- `lib/utils.ts`: `cn()` utility
- `components/ui/`: Button, Input, Label, Badge, Card, Separator, Skeleton, Avatar, Dialog, Select, Textarea, Table, Tabs, DropdownMenu, AlertDialog, Tooltip — hepsi elle yazılmış (shadcn yaklaşımı, Radix UI tabanlı)
- `components/admin/`: AdminLayout, Sidebar, Topbar, PageContent, StatCard, EmptyState, FormField
- Sonner toast provider layout'ta hazır

#### apps/mobile — Mobile UI
- **i18n:** `expo-localization` + `i18next` — cihaz dilini otomatik algılar, fallback: TR
  - `src/i18n/locales/tr.json` + `en.json` (common, auth, events, applications, offers, profile, errors)
- **Primitives** (`src/components/primitives/`):
  - `Text` — 10 variant (h1–h4, body, bodySm, bodyMd, label, caption, overline)
  - `View` — surface prop ile arka plan katmanı
  - `Pressable` — spring animasyonlu (react-native-reanimated), scale + opacity
  - `Divider`, `Spacer`
- **UI Components** (`src/components/ui/`):
  - `Button` — 5 variant (primary, secondary, ghost, danger, outline) × 3 size
  - `Input` — label, error, hint, password toggle
  - `Card` — 3 surface (surface, elevated, overlay), onPress destekli
  - `Badge` — 6 variant (default, success, warning, error, info, muted)
  - `Avatar` — 5 size, URI veya initials fallback
- **Layout** (`src/components/layout/`):
  - `Screen` — SafeAreaView + ScrollView + KeyboardAvoidingView + pull-to-refresh

### [2026-04-15] Expo Mobile Uygulaması Tamamlandı (task-012 → 016)

#### Expo Router + Clerk Auth (task-012)
- `main: "expo-router/entry"` — file-based routing
- `app/_layout.tsx`: ClerkProvider + SecureStore token cache + StatusBar
- `(auth)/index.tsx`: login (email/password), `(auth)/sign-up.tsx`: kayıt + e-posta doğrulama (6 haneli kod)
- `app/index.tsx`: signed in → `/(app)`, değilse → `/(auth)` yönlendirme
- `(app)/_layout.tsx`: korumalı Tabs (4 sekme: Etkinlikler, Başvurularım, Tekliflerim, Profil)
- TypeScript hatası: `View` primitifi `gap/justify/px` prop almıyor → `StyleSheet.create()` ile düzeltildi
- `StyleProp<ViewStyle>` yerine `ViewStyle` kullanımı Pressable/Button/Card'da hata verdi → import düzeltildi

#### API Client (task-013)
- `src/lib/api.ts`: axios instance, `EXPO_PUBLIC_API_URL`, `authHeaders()` helper
- Token her istek öncesinde Clerk'ten alınıyor (`getToken()`)

#### Event List + Detail (task-013)
- `(app)/index.tsx`: FlatList, cover image, tarih/mekan, pull-to-refresh
- `app/event/[id].tsx`: detay ekranı, MetaRow bileşeni, "Başvur" CTA footer'da sabit
- Root Stack'e `event/[id]` eklendi (tabs dışında açılır)

#### Applications Screen + Push Token (task-014)
- `(app)/applications.tsx`: durum badge'leri (+22 hex opacity trick ile arka plan rengi)
- `src/lib/usePushToken.ts`: izin alma → `getExpoPushTokenAsync()` → `PATCH /users/me/push-token`; hata sessizce yutulur
- `expo-notifications` install edildi

#### Offers Screen (task-015)
- `(app)/offers.tsx`: teklif listesi + admin notu gösterimi
- Modal (pageSheet): event picker list, tür chip'leri (Bistro/Backstage), not alanı

#### Profile + Onboarding (task-016)
- `(app)/profile.tsx`: bilgi kartı, gender chip seçimi, meslek/doğum tarihi inputları
- Onboarding eksik banner (gender + birthDate + occupation kontrolü)
- Çıkış: `signOut()` ile

### [2026-04-13] Spec Eklendi — Geliştirmeye Hazır
- `socialhouse-spec.md` dosyası projeye eklendi (teknik spec v2)
- STRUCTURE.json, QUICKSTART.md, tasks.json güncellendi
- Geliştirme sırası spec'teki 17 adımlı plana göre tasks.json'a eklendi
- Kritik kararlar:
  - Clerk ile tek auth instance — admin `privateMetadata.role: "admin"` ile ayrışır
  - Soft-delete tercih edildi (`deletedAt`) — Application/Offer kayıtları audit için korunur
  - S3 presigned URL pattern — backend dosyaya dokunmaz, direkt upload
  - Başvuru ön koşulu: gender + birthDate + occupation zorunlu
  - Push notification BullMQ queue üzerinden async gönderilir
