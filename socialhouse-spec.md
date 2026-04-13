# SocialHouse App — Technical Specification (v2)

## Proje Özeti

SocialHouse, Ankara merkezli bir event/nightlife markasının community uygulamasıdır. Kullanıcılar etkinliklere guest list başvurusu yapar, admin panel üzerinden başvurular yönetilir. Yüksek profilli bir kitleyi tutmak için başvuru + onay sistemi çalışır.

---

## Tech Stack

| Katman | Teknoloji |
|---|---|
| Monorepo | Turborepo |
| Mobile | Expo (React Native) |
| Admin Panel | Next.js 14 (App Router) |
| Backend | NestJS |
| ORM | Prisma |
| Database | PostgreSQL (Supabase) |
| Auth | Clerk |
| Storage | AWS S3 |
| Queue | BullMQ + Redis |
| Push Notifications | Expo Push Notifications |
| Email | Resend (sonraki faz) |
| State (mobile) | RTK Query + Redux Toolkit |
| HTTP | Axios |
| Styling | Tailwind CSS |
| Language | TypeScript (tüm paketler) |
| Deploy — Web | Vercel |
| Deploy — API | Railway |
| Deploy — Redis | Railway |

---

## Monorepo Yapısı

```
socialhouse/
├── apps/
│   ├── mobile/          # Expo React Native
│   ├── web/             # Next.js admin panel
│   └── api/             # NestJS backend
├── packages/
│   ├── types/           # Shared TypeScript types
│   └── utils/           # Shared utility functions
├── turbo.json
├── package.json
└── tsconfig.base.json
```

---

## Prisma Schema

```prisma
model User {
  id             String        @id @default(cuid())
  clerkId        String        @unique
  firstName      String
  lastName       String
  instagram      String        @unique
  email          String        @unique
  gender         Gender?
  birthDate      DateTime?
  occupation     String?
  profilePhoto   String?       // S3 URL
  expoPushToken  String?       // Expo push notification token
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  applications   Application[]
  offers         Offer[]
}

model Event {
  id                  String        @id @default(cuid())
  title               String
  description         String?
  coverImage          String?       // S3 URL
  date                DateTime
  venue               String
  ticketUrl           String?       // biletleme platformu URL (yoksa buton gizlenir)
  guestLimit          Int
  autoApproveAll      Boolean       @default(false)
  autoApproveFemale   Boolean       @default(false)
  isActive            Boolean       @default(true)
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt
  applications        Application[]
  offers              Offer[]
}

model Application {
  id          String            @id @default(cuid())
  userId      String
  eventId     String
  status      ApplicationStatus @default(PENDING)
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  user        User              @relation(fields: [userId], references: [id])
  event       Event             @relation(fields: [eventId], references: [id])

  @@unique([userId, eventId])
}

model Offer {
  id          String      @id @default(cuid())
  userId      String
  eventId     String
  type        OfferType
  note        String?     // Kullanıcının taleple birlikte gönderdiği not
  adminNote   String?     // Admin'in kendi notu (ör: "7000TL teklif verdik, kabul etti")
  status      OfferStatus @default(PENDING)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  user        User        @relation(fields: [userId], references: [id])
  event       Event       @relation(fields: [eventId], references: [id])
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

enum ApplicationStatus {
  PENDING
  APPROVED
  REJECTED
}

enum OfferType {
  BISTRO
  BACKSTAGE
}

enum OfferStatus {
  PENDING
  IN_PROGRESS
  COMMUNICATED
}
```

---

## Auth Stratejisi (Clerk)

### Kullanıcı Tarafı
- Clerk ile email/password veya sosyal login
- Signup sırasında alınan bilgiler: firstName, lastName, instagram, email
- Clerk webhook'ları ile Prisma senkronizasyonu sağlanır (detay aşağıda)

### Admin Tarafı
- Aynı Clerk instance
- Admin kullanıcısına Clerk Dashboard'dan manuel olarak `privateMetadata: { role: "admin" }` set edilir
- Next.js admin panel middleware'de `auth()` ile role kontrol edilir, admin değilse redirect
- NestJS'te tüm admin endpoint'leri `AdminGuard` ile korunur — Clerk JWT verify + `privateMetadata.role === "admin"` kontrolü

### Clerk Webhook'ları

Tüm webhook'lar Svix ile verify edilir. `CLERK_WEBHOOK_SECRET` env variable olarak saklanır.

| Webhook Event | Aksiyon |
|---|---|
| `user.created` | Prisma'da yeni User kaydı oluşturulur (clerkId, firstName, lastName, email ile) |
| `user.updated` | Prisma'daki User kaydı güncellenir (firstName, lastName, email sync) |
| `user.deleted` | Prisma'daki User kaydı soft-delete veya hard-delete edilir (ilişkili application'lar korunur) |

**Not:** `user.deleted` durumunda ilişkili Application ve Offer kayıtları korunur (audit trail). User tablosuna `deletedAt DateTime?` alanı eklenerek soft-delete uygulanabilir. Alternatif olarak hard-delete tercih edilirse, cascade delete ile tüm bağlı kayıtlar silinir — MVP'de soft-delete önerilir.

```
Clerk webhook: user.created / user.updated / user.deleted
→ POST /webhooks/clerk
→ Event type'a göre Prisma işlemi yapılır
→ clerkId ile ilişkilendirilir
```

---

## Backend — NestJS Modülleri

### Modül Listesi

```
src/
├── auth/           # Clerk JWT guard, AdminGuard
├── users/          # Kullanıcı profil CRUD + push token
├── events/         # Event CRUD (admin)
├── applications/   # Başvuru işlemleri
├── offers/         # Teklif işlemleri
├── notifications/  # Expo push notification servisi
├── queue/          # BullMQ queue setup
├── storage/        # AWS S3 upload servisi (presigned URL)
├── webhooks/       # Clerk webhook handler (created/updated/deleted)
└── prisma/         # Prisma service
```

### API Endpoint Listesi

#### Auth / Webhooks
```
POST /webhooks/clerk          # Clerk user.created / user.updated / user.deleted webhook
```

#### Users
```
GET    /users/me              # Kendi profilini getir
PATCH  /users/me              # Profil güncelle (gender, birthDate, occupation, profilePhoto)
PATCH  /users/me/push-token   # Expo push token kaydet/güncelle
```

#### Storage
```
POST   /storage/presigned-url   # S3 presigned upload URL al (type: "profile" | "event-cover")
```

#### Events (Public)
```
GET    /events                # Aktif eventleri listele
GET    /events/:id            # Event detayı
```

#### Events (Admin)
```
POST   /admin/events          # Event oluştur
PATCH  /admin/events/:id      # Event güncelle
DELETE /admin/events/:id      # Event sil
```

#### Applications
```
POST   /applications          # Guest list başvurusu yap (profil tamamlanmış olmalı)
GET    /applications/me       # Kendi başvurularım
```

#### Applications (Admin)
```
GET    /admin/applications              # Tüm başvurular (event filtreli)
PATCH  /admin/applications/:id         # Tekil onayla/reddet
POST   /admin/applications/bulk        # Toplu onayla/reddet
GET    /admin/applications/export/:eventId  # Excel export
```

#### Offers
```
POST   /offers                # Bistro/backstage teklif talebi gönder
GET    /offers/me             # Kendi tekliflerimi listele (statü takibi)
```

#### Offers (Admin)
```
GET    /admin/offers          # Tüm teklifler
PATCH  /admin/offers/:id      # Statü güncelle + adminNote yaz
```

#### Users (Admin)
```
GET    /admin/users           # Tüm kullanıcılar (arama + filtre)
GET    /admin/users/:id       # Kullanıcı detayı
```

---

## BullMQ Queue

### Queue: notifications
Başvuru durumu değiştiğinde (onay/red) push notification kuyruğa eklenir.

```typescript
// Job: send-push
{
  expoPushToken: string,
  title: string,
  body: string,
  data?: object
}
```

**Push token akışı:**
1. Kullanıcı uygulamayı açtığında Expo'dan push token alınır
2. `PATCH /users/me/push-token` ile backend'e gönderilir
3. Token her app launch'ta güncellenir (token değişebilir)
4. Bildirim gönderilirken User tablosundan `expoPushToken` okunur
5. Token null ise bildirim sessizce skip edilir (hata fırlatmaz)

### Queue: auto-approve
Event oluşturulurken `autoApproveAll` veya `autoApproveFemale` seçiliyse mevcut başvurular kuyruğa alınır, toplu işlenir.

---

## Bildirim Mesajları

| Durum | Başlık | Mesaj |
|---|---|---|
| APPROVED | "Harika haber! 🎉" | "[Event adı] için guest list başvurunuz onaylandı." |
| REJECTED | "Üzgünüz 😔" | "[Event adı] için guest listemiz maalesef doldu. Bize ulaşmak için Instagram'dan DM atabilirsin." |

Red bildiriminde deep link veya Instagram URL açılır.

---

## Business Kuralları

### Başvuru Kuralları
1. Bir kullanıcı aynı event'e yalnızca bir kez başvurabilir (`@@unique([userId, eventId])`)
2. REJECTED statüsündeki başvuru sonrası aynı event'e tekrar başvurulamaz
3. Bir kullanıcı birden fazla farklı event'e başvurabilir — event bazında kısıtlama yoktur
4. Guest limit dolduğunda yeni başvurular kabul edilmez (backend kontrolü)
5. `autoApproveAll`: event'e gelen tüm başvurular anında onaylanır
6. `autoApproveFemale`: Gender.FEMALE olan kullanıcıların başvuruları anında onaylanır
7. Admin, herhangi bir başvuruyu manuel olarak her zaman override edebilir

### Onboarding & Profil Tamamlama
8. Uygulamaya kayıt: firstName, lastName, instagram, email, password — signup sonrası uygulamayı gezebilir
9. **Başvuru ön koşulu:** gender, birthDate ve occupation alanları dolu olmalıdır. Eksik alan varsa başvuru butonu "Profilini Tamamla" yönlendirmesi gösterir
10. Gender'ı null olan kullanıcı başvuru yapamaz → autoApproveFemale her zaman güvenilir şekilde çalışır

### Offer Kuralları
11. Kullanıcı herhangi bir event için Bistro veya Backstage teklif talebi gönderebilir (event bazlı kısıtlama yok)
12. Offer statü akışı: PENDING → IN_PROGRESS → COMMUNICATED
13. Admin, her offer'a kendi notu ekleyebilir (`adminNote` — ör: "7000TL teklif verdik, kabul etti")
14. Fiyat iletimi uygulama dışında yapılır (telefon/Instagram); uygulama sadece talep toplama ve statü takibi aracıdır

---

## Mobile App — Ekran Listesi

### Navigation Yapısı
```
Stack Navigator (Auth)
├── SplashScreen
├── SignUpScreen
└── LoginScreen

Tab Navigator (Ana uygulama)
├── EventsTab
│   ├── EventListScreen
│   └── EventDetailScreen
├── ApplicationsTab
│   └── MyApplicationsScreen
├── OffersTab
│   └── MyOffersScreen
└── ProfileTab
    ├── ProfileScreen
    └── EditProfileScreen
```

### Ekran Detayları

#### EventListScreen
- Aktif eventlerin listesi
- Her kart: kapak görseli, isim, tarih, mekan
- Profil tamamlama banner'ı (gender/birthDate/occupation eksikse gösterilir)

#### EventDetailScreen
- Kapak görseli, başlık, açıklama, tarih, mekan
- "Bilet Al" butonu → `ticketUrl` açılır (Linking.openURL) — **ticketUrl yoksa buton gizlenir**
- "Guest List'e Başvur" butonu
  - Profil eksikse: "Profilini Tamamla" → EditProfileScreen'e yönlendir
  - PENDING ise: "Başvurunuz değerlendiriliyor"
  - APPROVED ise: "Başvurunuz onaylandı ✓"
  - REJECTED ise: "Liste dolu" + Instagram DM butonu
  - Limit dolduysa: "Guest list kapandı"
- Bistro/Backstage teklif al butonu — her event'te gösterilir

#### MyApplicationsScreen
- Başvuru geçmişi listesi
- Her item: event adı, tarih, durum badge'i

#### MyOffersScreen
- Teklif geçmişi listesi
- Her item: event adı, tür (Bistro/Backstage), durum (Bekleniyor / Çalışılıyor / İletildi)

#### ProfileScreen
- İsim, instagram, fotoğraf
- Profil tamamlama progress bar (gender, birthDate, occupation)
- Çıkış yap

#### EditProfileScreen
- Gender seçimi
- Doğum tarihi seçimi (date picker)
- Meslek
- Profil fotoğrafı (S3 upload)

#### SignUpScreen
- firstName, lastName, instagram, email, password
- Sonrasında yönlendirme: EventList

---

## Admin Panel — Sayfa Listesi (Next.js)

### Route Yapısı
```
/                     → redirect to /dashboard
/login                → Clerk SignIn
/dashboard            → Genel bakış
/events               → Event listesi
/events/new           → Yeni event formu
/events/[id]/edit     → Event düzenle
/applications         → Başvuru yönetimi (event filtreli)
/offers               → Teklif inbox'ı
/users                → Kullanıcı listesi
```

### Middleware
```typescript
// middleware.ts
export default clerkMiddleware((auth, req) => {
  const { sessionClaims } = auth();
  if (req.nextUrl.pathname.startsWith('/') && 
      req.nextUrl.pathname !== '/login') {
    if (sessionClaims?.privateMetadata?.role !== 'admin') {
      return redirectToSignIn();
    }
  }
});
```

### Dashboard
- Toplam kullanıcı sayısı
- Aktif event sayısı
- Bekleyen başvuru sayısı
- Son 10 başvuru listesi

### Event Formu Alanları
- Kapak görseli (S3 upload)
- Başlık
- Açıklama
- Tarih / Saat
- Mekan
- Biletleme URL'i (opsiyonel)
- Guest list limiti
- Otomatik onay: [ ] Herkesi onayla [ ] Kadınları onayla

### Başvuru Tablosu Kolonları
- Ad Soyad
- Yaş (birthDate'ten hesaplanır)
- Meslek
- Cinsiyet
- Başvuru tarihi
- Instagram (tıklanabilir link → instagram.com/[username])
- Durum (Bekliyor / Onaylandı / Liste Dolu)
- Aksiyon (Onayla / Reddet)

Filtreleme: event seçimi, durum filtresi
Toplu işlem: seçili başvuruları onayla / reddet
Excel export butonu (event bazlı)

### Teklif Sayfası
- Her teklif kartı: kullanıcı adı, instagram, event, tür (Bistro/Backstage), kullanıcı notu, tarih
- Statü güncelleme: Bekleniyor → Çalışılıyor → İletildi
- Admin not alanı (tek alan, serbestçe düzenlenebilir — ör: "7000TL teklif verdik")

---

## AWS S3 Yapısı

```
bucket: socialhouse-uploads/
├── events/
│   └── {eventId}/cover.{ext}
└── users/
    └── {userId}/profile.{ext}
```

### Upload Akışı
1. Client → `POST /storage/presigned-url` (type: "profile" veya "event-cover", dosya uzantısı)
2. Backend presigned PUT URL döner (5 dakika geçerli)
3. Client → Direkt S3'e yükler
4. Client → `PATCH /users/me` veya `PATCH /admin/events/:id` ile S3 URL'ini kaydeder

---

## Environment Variables

### API (.env)
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

### Web (.env.local)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_API_URL=
```

### Mobile (.env)
```
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
```

---

## Excel Export Formatı

Guest list export kolonları:
1. Ad
2. Soyad
3. Cinsiyet
4. Yaş (birthDate'ten hesaplanır)
5. Meslek
6. Instagram
7. Başvuru Tarihi
8. Durum

Kütüphane: `exceljs`

---

## Geliştirme Sırası (Önerilen)

1. Turborepo scaffold + shared types paketi
2. NestJS — Prisma setup + Clerk webhook handler (created/updated/deleted)
3. NestJS — S3 presigned URL servisi
4. NestJS — Events CRUD
5. NestJS — Applications iş mantığı + BullMQ
6. NestJS — Offers CRUD
7. NestJS — Push notification servisi + push token endpoint
8. Next.js admin panel — Auth middleware
9. Next.js admin panel — Event yönetimi
10. Next.js admin panel — Başvuru yönetimi + Excel export
11. Next.js admin panel — Teklif inbox'ı (statü + admin not)
12. Expo — Auth flow (Clerk)
13. Expo — Event list + detay
14. Expo — Başvuru akışı + push token kayıt
15. Expo — Offer talebi + takip ekranı
16. Expo — Profil + onboarding tamamlama (gender, birthDate, occupation zorunlu)
17. Test + deployment (Railway + Vercel)

---

## Notlar

- Tüm tarihler UTC olarak saklanır, mobile'da locale'e göre gösterilir
- Instagram kullanıcı adları `@` olmadan saklanır, link oluştururken eklenir
- Push token Expo'dan alınır, `PATCH /users/me/push-token` ile backend'e gönderilir, her app launch'ta güncellenir
- Red durumunda Instagram DM linki: `https://instagram.com/socialhouse` (sabit)
- birthDate'ten yaş hesaplaması admin panelde ve Excel export'ta otomatik yapılır
- MVP sonrası eklenecekler: Resend email entegrasyonu, doğum günü bildirimleri, event sonrası feed, analytics dashboard
