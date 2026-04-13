<!-- FRAME AUTO-GENERATED FILE -->
<!-- Purpose: Quick onboarding guide for developers and AI assistants -->
<!-- For Claude: Read this FIRST to quickly understand how to work with this project. Contains setup instructions, common commands, and key files to know. -->
<!-- Last Updated: 2026-04-13 -->

# socialhouse - Quick Start Guide

## Proje Özeti

SocialHouse — Ankara merkezli event/nightlife topluluğu uygulaması.  
Turborepo monorepo: Expo mobile + Next.js 14 admin panel + NestJS API.

## Setup

```bash
# Clone and install
git clone <repo-url>
cd socialhouse
pnpm install
```

## Common Commands

```bash
# Tüm uygulamaları geliştirme modunda başlat
pnpm dev

# Sadece API
pnpm dev --filter=api

# Sadece web (admin panel)
pnpm dev --filter=web

# Sadece mobile
pnpm dev --filter=mobile

# Build (tüm paketler)
pnpm build

# Prisma migration
cd apps/api && pnpm prisma migrate dev

# Prisma studio
cd apps/api && pnpm prisma studio
```

## Environment Variables

### apps/api/.env
```
DATABASE_URL=
DIRECT_URL=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=
REDIS_URL=
```

### apps/web/.env.local
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_API_URL=
```

### apps/mobile/.env
```
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
```

## Project Structure

```
socialhouse/
├── apps/
│   ├── mobile/          # Expo React Native
│   ├── web/             # Next.js 14 admin panel
│   └── api/             # NestJS backend
├── packages/
│   ├── types/           # Shared TypeScript types
│   └── utils/           # Shared utility functions
├── turbo.json
├── package.json
└── tsconfig.base.json
```

## Key Files

| File | Purpose |
|------|---------|
| `STRUCTURE.json` | Mimari ve modül haritası |
| `PROJECT_NOTES.md` | Kararlar ve bağlam |
| `tasks.json` | Görev takibi |
| `socialhouse-spec.md` | Teknik spec (kaynak doğruluk) |
| `QUICKSTART.md` | Bu dosya |

## For AI Assistants (Claude)

1. **First**: Read `STRUCTURE.json` for architecture overview
2. **Then**: Check `PROJECT_NOTES.md` for decisions and context
3. **Check**: `tasks.json` for pending tasks
4. **Spec**: `socialhouse-spec.md` is the source of truth for business logic
5. **Follow**: Existing code patterns and conventions
6. **Update**: These files as you make changes

## Geliştirme Sırası

Spec'teki 17 adımlı plan takip edilmektedir — `tasks.json`'a bakın.
