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
