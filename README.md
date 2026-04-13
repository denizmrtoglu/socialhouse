# SocialHouse

Ankara merkezli event/nightlife topluluğu uygulaması. Kullanıcılar etkinliklere guest list başvurusu yapar; admin panelden başvurular yönetilir.

## Monorepo Yapısı

```
socialhouse/
├── apps/
│   ├── mobile/     # Expo React Native (iOS & Android)
│   ├── web/        # Next.js 16 admin panel
│   └── api/        # NestJS backend
├── packages/
│   ├── types/      # @repo/types — paylaşılan TypeScript tipleri
│   ├── utils/      # @repo/utils — paylaşılan utility fonksiyonları
│   ├── ui/         # @repo/ui — paylaşılan React bileşenleri
│   ├── eslint-config/
│   └── typescript-config/
├── turbo.json
└── package.json
```

## Tech Stack

| Katman | Teknoloji |
|---|---|
| Monorepo | Turborepo |
| Mobile | Expo 54 (React Native) |
| Admin Panel | Next.js 16 (App Router) |
| Backend | NestJS 11 |
| ORM | Prisma |
| Database | PostgreSQL (Supabase) |
| Auth | Clerk |
| Storage | AWS S3 |
| Queue | BullMQ + Redis |
| Push | Expo Push Notifications |
| Deploy (web) | Vercel |
| Deploy (api) | Railway |

## Kurulum

```bash
git clone <repo-url>
cd socialhouse
npm install
```

## Komutlar

```bash
# Tüm uygulamaları başlat
npm run dev

# Sadece API
npx turbo dev --filter=api

# Sadece admin panel
npx turbo dev --filter=web

# Sadece mobile
npx turbo dev --filter=mobile

# Build
npm run build

# Lint
npm run lint
```

## Environment Variables

`socialhouse-spec.md` dosyasının "Environment Variables" bölümüne bakın.

## Dokümantasyon

| Dosya | İçerik |
|---|---|
| `socialhouse-spec.md` | Teknik spec (kaynak doğruluk) |
| `STRUCTURE.json` | Mimari ve modül haritası |
| `PROJECT_NOTES.md` | Kararlar ve bağlam |
| `tasks.json` | Görev takibi |
| `QUICKSTART.md` | Hızlı başlangıç |
