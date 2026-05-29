# mcv6 — Payload CMS Template

Payload CMS 3 + Next.js 16 tabanlı "default-zengin" proje şablonu. Her kurumsal site için tekrar tekrar gereken altyapıyı (auth, collections, navigation globals, blocks, locale routing, admin) hazır sunar. Yeni proje açılır açılmaz **iskelet işliyor** — her projeye özgü kısım (sitemap'ten gelen sayfalar, müşterinin tasarım stilleri, custom collection'lar) `/proje-kur` skill'i ile spec YAML'dan üretilir.

---

## İçindekiler

1. [Payload Nedir? (Genel)](#payload-nedir-genel)
2. [mcv6 Nedir? Niye Var?](#mcv6-nedir-niye-var)
3. [Mimari Karar — Neden Default-Zengin?](#mimari-karar--neden-default-zengin)
4. [Aktif Bileşenler (Bu Repo'da Hazır)](#aktif-bileşenler-bu-repoda-hazır)
5. [Pasif / Henüz Yapılandırılmamış](#pasif--henüz-yapılandırılmamış)
6. [Block Kataloğu](#block-kataloğu)
   - 6.1 [Aktif 20 Block](#aktif-20-block)
   - 6.2 [Spec.extras ile Eklenebilecek Alternatifler](#spec-extras-ile-eklenebilecek-alternatifler)
7. [Tasarım Yaklaşımı — Semi-Styled](#tasarım-yaklaşımı--semi-styled)
8. [Pluginler (Yapılandırma Beklemede)](#pluginler-yapılandırma-beklemede)
9. [Kullanım](#kullanım)
10. [Yapı](#yapı)
11. [Lisans](#lisans)

---

## Payload Nedir? (Genel)

**Payload CMS** açık kaynaklı, TypeScript-first, headless CMS. Özellikleri:

- **Self-hosted**: Kendi sunucunda çalışır (Vercel, AWS, kendi VPS — fark etmez)
- **Code-first config**: Collections, fields, hooks — hepsi TypeScript dosyalarında. Admin UI bunlardan otomatik üretilir
- **Headless**: REST + GraphQL + Local API (server component'lerden direkt)
- **Auth built-in**: Kullanıcı/oturum/JWT/roller hazır
- **Localized fields**: Tek bir doc, birden fazla dil — kutudan
- **Versions + Drafts**: İçerik geçmişi, taslak/yayın ayrımı, schedule publish
- **Live Preview**: Editör admin'de yazarken frontend canlı güncellenir
- **Folder-based admin organization**: Collection içeriği "By Folder" görünüm desteği

Stack: **Node.js + Payload (core) + PostgreSQL (DB) + React admin (Next.js)**.

Detay: https://payloadcms.com/docs

---

## mcv6 Nedir? Niye Var?

Her ay 1-2 yeni kurumsal site açılıyor. Her seferinde:
- Aynı klasör yapısı kurulur
- Aynı Pages/Posts/Media/Categories collection'ları tanımlanır
- Aynı Header/MainMenu/Footer global'leri yaratılır
- Aynı 5-10 block (CallToAction, Content, FAQ, Testimonial vs.) yapılır
- Aynı locale routing kurulur

Bu tekrarı kaldırmak için `mcv6` — **bir kez hazırlanır, her projede `gh repo create --template inanc76/mcv6` ile clone'lanır**.

`/proje-kur` skill'i de bu repo'yu kaynak alır; spec YAML'dan müşteri-özgü bölümleri (sitemap, navigation içeriği, form alanları, custom block ihtiyaçları) üretir.

---

## Mimari Karar — Neden Default-Zengin?

İki yol vardı:

**(A) Bare template** — Sadece Users + altyapı; her şey spec'ten üretilir
**(B) Default-zengin template** — Yaygın collections/globals/blocks hazır gelir; spec sadece içerik koyar

**Seçim: B.** Sebep:
- Pages, Posts, Media, Categories — her kurumsal sitede VAR. Tekrar yaratmak boş iş.
- Header, MainMenu, Footer — her sitede VAR.
- Generic content layer (block sistemi) — her sitede VAR; sadece **hangi block'lar kullanılır** değişir.
- Müşteri-özgü olanlar (örneğin BasinBultenleri collection, custom Pricing block) spec'in `extras` bölümünden eklenir.

Sonuç: clone edildiğinde site **anında çalışır**, sıfır soru ile yeni proje açılır.

---

## Aktif Bileşenler (Bu Repo'da Hazır)

### Collections

| Slug | Görevi |
|---|---|
| `users` | Auth (admin login). MUTLAKA gerekli — Payload kuralı. |
| `pages` | Statik sayfalar — `folders: true` ile "By Folder" view aktif. Pages.parent + breadcrumbs (nestedDocsPlugin) ile hiyerarşi. Block-based layout. |
| `posts` | Blog yazıları — Categories ile taxonomy. RichText editor + MediaBlock embed. |
| `media` | Görsel/video/PDF kütüphanesi. Local disk storage (production'da S3'e bağlanır). |
| `categories` | Posts taxonomy (nested) — örn. "Haberler > Şirket", "Haberler > Sektör". **Sadece Posts için**; sitemap [grup] node'ları Folders'a gider, Categories'e DEĞİL. |
| `forms` *(auto)* | formBuilderPlugin tarafından otomatik. |
| `form-submissions` *(auto)* | Form gönderimleri storage. |
| `payload-folders` *(auto)* | Pages.folders=true ile otomatik. Admin "By Folder" view. |

### Globals

| Slug | İçerik |
|---|---|
| `site-settings` | **Branding** (siteName, tagline, logo, logoDark, favicon, appleTouchIcon, ogImage) + **Contact** (address, phone, phoneSecondary, email, whatsapp, workingHours). Tüm sitede ortak. |
| `header-navigation` | Üst menü — array of links (internal/external/group). |
| `main-navigation` | Ana menü — 3 seviye nested (navItems > subItems > children). |
| `footer-navigation` | Alt menü — düz liste. |

### Localization

- **Content i18n**: `locales: [tr, en]`, `defaultLocale: tr`, `fallback: true`. Pages/Posts/Categories/globals — tüm content field'ları localized.
- **Admin UI i18n**: `fallbackLanguage: tr`. Sidebar, butonlar, sistem mesajları default Türkçe. Per-user override sağ üst menüden.
- **Field label'ları**: TR + EN — admin diline göre dinamik (örn. "Başlık" / "Title").
- **Slug stratejisi**: per-locale (her dil kendi slug'ı tutar).

### Frontend Routes

| Path | Görevi |
|---|---|
| `/[locale]/page.tsx` | Anasayfa (locale-aware) |
| `/[locale]/[...slug]/page.tsx` | Dinamik Pages render (breadcrumbs.url query) |
| `/[locale]/posts/page.tsx` | Blog listesi |
| `/[locale]/posts/[slug]/page.tsx` | Tek blog yazısı |
| `/[locale]/posts/page/[pageNumber]/page.tsx` | Blog pagination |
| `/[locale]/search/page.tsx` | Site içi arama sonuçları |
| `/(sitemaps)/pages-sitemap.xml/route.ts` | Pages sitemap.xml |
| `/(sitemaps)/posts-sitemap.xml/route.ts` | Posts sitemap.xml |
| `/admin` | Payload admin paneli |
| `/api/*` | Payload REST + custom endpoints |
| `/next/preview`, `/next/exit-preview` | Draft preview |

### Middleware

`src/middleware.ts` — locale detection + redirect. **Generic** — locales `.env`'den okur:
```
PUBLIC_LOCALES=tr,en
PUBLIC_DEFAULT_LOCALE=tr
```
Tek dilli proje istersen `PUBLIC_LOCALES=tr` yeter, middleware bypass eder.

### Build Setup

- Next.js 16.2.6 + Turbopack
- TypeScript 6
- Tailwind CSS 4 + tw-animate-css
- ESLint + Prettier
- Vitest (unit) + Playwright (e2e)
- Dockerfile + docker-compose.yml

---

## Pasif / Henüz Yapılandırılmamış

### Plugins (Wire Edilmemiş)

Tüm Payload pluginleri **`package.json`'da dependency olarak kurulu** ama `payload.config.ts`'in `plugins: []` dizisinde wire edilmiş değil. `/proje-kur` skill'i spec'e göre wire eder:

| Plugin | Ne için |
|---|---|
| `@payloadcms/plugin-nested-docs` | Pages.parent + breadcrumbs hiyerarşisi |
| `@payloadcms/plugin-form-builder` | Forms collection + FormBlock |
| `@payloadcms/plugin-seo` | Meta tag yönetimi (Pages/Posts üzerine) |
| `@payloadcms/plugin-redirects` | URL redirects collection |
| `@payloadcms/plugin-search` | Site içi arama indexi |
| `@payloadcms/richtext-lexical` | Lexical RichText editor (zaten editor olarak aktif) |

> **Not:** Bu bölüm ilerleyen iterasyonda detaylandırılacak — hangi plugin default açık, hangisi spec opt-in.

### S3 / Cloud Storage

Şu an Media collection local disk kullanır (`media/`). Production'da S3 / R2 / Cloudinary için skill spec'in `storage` bloğuna bakıp `@payloadcms/storage-s3` ile wire eder.

### Email Adapter

Şu an console adapter (dev için). Production SMTP için `@payloadcms/email-nodemailer` skill spec'in `email` bloğuna bakıp wire eder.

---

## Block Kataloğu

### Aktif 20 Block

| # | Slug | İsim | Tasarım | Açıklama |
|---|---|---|---|---|
| 1 | `cta` | CallToAction | **Full styled** | Başlık + buton |
| 2 | `content` | Content | **Full styled** | RichText + 1/2/3 kolon layout |
| 3 | `mediaBlock` | MediaBlock | **Full styled** | Tek görsel/video + caption |
| 4 | `archive` | Archive | **Full styled** | Posts/Pages listesi (kategoriye filtreli) |
| 5 | `formBlock` | FormBlock | **Full styled** | formBuilderPlugin'den form embed |
| 6 | `faq` | FAQBlock | **Full styled** | SSS — başlık + soru/cevap arrayi |
| 7 | `features` | FeaturesBlock | **Full styled** | İkon + başlık + açıklama kartları |
| 8 | `testimonials` | TestimonialsBlock | **Full styled** | Müşteri yorumu carousel |
| 9 | `heroSlider` | HeroSlider | *Semi-styled* | Anasayfa full-width slider + auto-play |
| 10 | `stats` | StatsBlock | *Semi-styled* | Büyük sayı + label (4-6 metric) |
| 11 | `teamGrid` | TeamGrid | *Semi-styled* | Ekip üyesi (foto + isim + rol + sosyal) |
| 12 | `accordion` | AccordionBlock | *Semi-styled* | Collapsible Q&A (allowMultiple opsiyonu) |
| 13 | `gallery` | GalleryBlock | *Semi-styled* | Görsel grid + lightbox (grid/masonry) |
| 14 | `logoCloud` | LogoCloud | *Semi-styled* | Müşteri logo grid'i |
| 15 | `map` | MapBlock | *Semi-styled* | Google Maps / Mapbox / iframe embed |
| 16 | `video` | VideoBlock | *Semi-styled* | YouTube/Vimeo/direct video embed |
| 17 | `ctaSection` | CTASection | *Semi-styled* | Background-image hero CTA (title + subtitle + 1-3 button) |
| 18 | `timeline` | TimelineBlock | *Semi-styled* | Tarih + olay (vertical/horizontal) |
| 19 | `newsletterSignup` | NewsletterSignup | *Semi-styled* | Email input + submit endpoint |
| 20 | `productGrid` | ProductGrid | *Semi-styled* | Ürün kartları (görsel + ad + fiyat + badge) |

Block'lar Pages collection'ının `layout` field'ında kullanılabilir — admin'de editör doldurur, frontend lazy-load eder.

### Spec.extras ile Eklenebilecek Alternatifler

Bu liste mcv6'da **YOK** ama `/proje-kur` skill'inin `spec.extras.blocks` alanından eklenebilecek yaygın block'lar:

#### Hero / Üst Bölüm
- **HeroVideo** — Background video + üstüne metin (sessiz autoplay)
- **HeroSplit** — Sol metin / sağ görsel (50/50)
- **HeroCarousel** — Manuel ok kontrollü slider

#### Tanıtım
- **FeatureList** — Checkmark list, dikey tek sütun
- **FeatureAlternating** — Görsel sağ-sol değişen zig-zag layout
- **FeatureComparison** — ✓/✗ karşılaştırma tablosu
- **BenefitsBlock** — Büyük ikon + başlık

#### Sosyal Kanıt
- **CaseStudyBlock** — Vaka çalışması kartları
- **AwardsBlock** — Ödüller / sertifikalar
- **PressBlock** — "Basında çıkanlar" alıntılar

#### Ekip / Kişiler
- **TeamSpotlight** — Tek kişi vurgusu (CEO için büyük foto + alıntı)
- **OrgChart** — Hiyerarşik organizasyon şeması
- **PersonCard** — Tek kişi mini kart

#### Sayılar / Metrikler
- **ProgressBars** — Yüzde göstergeleri
- **CounterBlock** — Tek büyük sayı vurgusu

#### İçerik
- **TwoColumnText** — Sol başlık / sağ açıklama
- **QuoteBlock** — Büyük alıntı + yazar
- **TextWithImage** — Görsel + uzun metin
- **DropCapContent** — Magazin tarzı

#### Görsel / Medya
- **BeforeAfterSlider** — Önce/sonra kıyas
- **MediaCarousel** — Görsel slider
- **InstagramFeed** — Instagram embed
- **Lottie** — Lottie animasyon embed

#### CTA
- **BannerBlock** — Ekran üstü ince duyuru şeridi
- **PopupBlock** — Modal trigger
- **DownloadBlock** — PDF/dosya indirme kartı

#### Liste / Arşiv
- **PostsCarousel** — Slider'lı yatay post listesi
- **RelatedPosts** — Sayfa içi "ilgili yazılar"
- **CategoryGrid** — Kategori kartları

#### Etkileşim / UI
- **TabsBlock** — Sekmeli içerik
- **StepsBlock** — Numaralı süreç anlatımı
- **ProcessFlowBlock** — Yatay akış (ok'larla)
- **ToggleBlock** — Aç/kapa ince satır liste

#### Form / İletişim
- **ContactInfoBlock** — Adres/telefon/email büyük kartlar
- **OfficeLocations** — Birden fazla ofis + harita
- **SocialLinks** — Sosyal medya icon strip

#### E-ticaret / Ürün
- **PricingTable** — Fiyat paketleri
- **FeaturedProduct** — Tek ürün vurgusu
- **ProductCompareTable** — Karşılaştırma
- **CategoryShowcase** — Kategori vitrini

#### Bilgilendirme
- **InfoBox** — İkon + başlık + kısa metin uyarı kutusu
- **AlertBlock** — Renkli uyarı şeridi (info/warn/error)
- **CertificateBlock** — Sertifika logo grid'i
- **JobListings** — Açık pozisyonlar

#### Sosyal / Topluluk
- **CommentsBlock** — Disqus/native comments
- **ReviewsBlock** — Yıldız puanlı yorumlar
- **EventsList** — Yaklaşan etkinlikler

#### Embed
- **CodeBlock** — Kod snippet (geliştirici doc)
- **IframeBlock** — Generic iframe
- **TwitterEmbed**, **CalendlyEmbed**, **TypeformEmbed** — 3rd party embed

#### SEO
- **FAQBlock + structured data** — Rich snippet için
- **TableOfContents** — Uzun içerik için sayfa içi nav

> Bu alternatifler `/proje-kur` skill'in **template library**'sinde bulunur. Spec'te listed olunca otomatik üretilir.

---

## Tasarım Yaklaşımı — Semi-Styled

mcv6'daki 20 block'tan:
- **8'i Full styled** (template'ten miras: CallToAction, Content, MediaBlock, Archive, FormBlock, FAQ, Features, Testimonials) — Tailwind ile production-ready tasarım, clone edildiğinde "çalışan demo" gibi açılır
- **12'si Semi-styled** (yeni eklenenler) — **işleyiş mantığı (state, click handler, accordion/slider/lightbox logic) + HTML semantik yapısı tam, ama TASARIM YOK**

### Semi-Styled Felsefesi

Her müşteri kendi tasarımcısıyla özel tasarım yapıyor. Mcv6'da generic Tailwind stilleri eklemek demek:
- Her projede önce **eski stilleri silmek** sonra yeni stilleri eklemek (ekstra iş)
- `!important` override karmaşası
- Müşteri tasarımına uymayan generic pattern'ler

Semi-styled yaklaşımda:
- ✅ Accordion mantığı (state + toggle) hazır → tasarımcı sadece stilini ekler
- ✅ Slider auto-play + click handler hazır → tasarımcı sadece görünümünü ekler
- ✅ HTML semantik doğru → SEO + accessibility baseline tam
- ❌ Tailwind class'ları YOK → tasarımcı sıfırdan, override derdi olmadan

**Pratik örnek (semi-styled AccordionBlock):**
```tsx
'use client'
const [openSet, setOpenSet] = useState<Set<number>>(new Set())
const toggle = (i) => { /* allowMultiple desteği */ }

return (
  <section data-block="accordion">
    {title && <h2>{title}</h2>}
    <ul>
      {items.map((item, i) => (
        <li data-open={openSet.has(i)}>
          <button onClick={() => toggle(i)} aria-expanded={openSet.has(i)}>
            {item.heading}
          </button>
          {openSet.has(i) && <div role="region">{item.content}</div>}
        </li>
      ))}
    </ul>
  </section>
)
```
Tüm `data-*` attribute'ları + ARIA + state hazır. Tasarımcı `[data-block="accordion"] li[data-open="true"]` selector'ları ile stil yazar.

---

## Pluginler

Plugin'ler **paket olarak `package.json`'da kurulu** ama `payload.config.ts`'in `plugins: []` dizisinde wire edilmemiş. `/proje-kur` skill spec.payloadHints'e göre projeye özgü wire eder.

### 🟢 Kurulu Plugin'ler (12)

#### Resmî — Payload ekibi (8)
| Paket | Görevi |
|---|---|
| `@payloadcms/plugin-seo` | Meta tag yönetimi (title, description, OG, canonical) |
| `@payloadcms/plugin-form-builder` | Drag-drop form yapıcı + Forms collection + FormBlock |
| `@payloadcms/plugin-search` | Site içi arama indexi |
| `@payloadcms/plugin-nested-docs` | Pages hierarchy + breadcrumbs |
| `@payloadcms/plugin-redirects` | URL redirect yönetimi |
| `@payloadcms/storage-s3` | S3 / R2 / MinIO media storage (production) |
| `@payloadcms/email-resend` | Transactional email (Resend) |
| `@payloadcms/plugin-sentry` (+ `@sentry/nextjs`) | Hata izleme — **Bugsink DSN ile çalışır** (Sentry-uyumlu API) |

#### Community (4)
| Paket | Görevi |
|---|---|
| `@oversightstudio/encrypted-fields` | AES field-level encryption — **KVKK uyumu** için. PII/API key field'ları DB'de encrypted, transparent decrypt |
| `payload-auth-plugin` | Better Auth — 2FA (TOTP), magic link, OAuth (Google/Microsoft/GitHub), passkey, session management |
| `payload-rbac` | Role-based access control — Users.roles + hasRole / hasAnyRole helper'lar |
| `@payload-bites/broken-link-checker` | RichText + link field'larını tarar; 404/timeout/SSL hatalarını admin'de işaretler |

### 🟡 İleride Eklenebilecek Plugin'ler

Müşteri profiline göre tek `pnpm add` ile gelir. Tam katalog için [payload-cms-eklentiler.md](../payload-cms-eklentiler.md) (40 plugin rehberi).

#### Resmî ek (Payload ekibi)
- `@payloadcms/storage-vercel-blob` — Vercel Blob storage
- `@payloadcms/email-nodemailer` — SMTP alternatifi (Resend yerine)
- `@payloadcms/plugin-stripe` — Stripe webhook + customer sync
- `@payloadcms/plugin-multi-tenant` — Tek instance'ta çoklu tenant (franchise)
- `@payloadcms/plugin-import-export` — CSV/JSON ile bulk import/export

#### AI & İçerik Üretimi
- `@ai-stack/payloadcms` (ashbuilds/payload-ai) — Field başına AI assist (yazım, görsel, alt-text)
- `@payload-enchants/translator` (r1tsuu) — OpenAI/Google çeviri (TR→EN tek tıkla)
- `payload-translator` (azhao6060) — DeepL ile otomatik çeviri

#### Editör & Sayfa Yapıcı
- `payload-visual-editor` (pemedia) — Storyblok tarzı canlı görsel düzenleyici
- `@forrestjs/payload-gutenberg` — WordPress Gutenberg tarzı block editor
- `payload-lexical-typography` (AdrianMaj) — Lexical'a text color, font size, letter spacing
- `@nhayhoc/payloadcms-lexical-ext` (rubn-g) — Lexical'a background, YouTube/Vimeo embed
- `payload-better-fields-plugin` — Color picker, icon picker, range slider

#### İçerik Kalitesi & Workflow
- `@payload-bites/image-search` — Upload picker'da Unsplash + Pexels arama
- `@payload-bites/content-freeze` — Launch sırasında içerik kilidi
- `@payload-bites/soft-delete` — `deletedAt` field + Trash view (Payload 3.45+ native Trash de var)
- `payload-versions-cleanup` — Draft/version retention (cron)
- `payload-plugin-scheduler` (wkentdag) — WordPress tarzı scheduled publish
- `@harrytwigg/plugin-editorial-workflow` — Çok aşamalı onay (Draft → Review → Approved → Published)

#### Media & Optimizasyon
- `@oversightstudio/mux-video` — Mux video upload + playback
- `@oversightstudio/blur-data-urls` — Otomatik blur placeholder (Core Web Vitals)
- `payload-blurhash-plugin` — BlurHash/LQIP (next/image placeholder için)

#### Analitik & A/B Testing
- `payload-posthog-analytics` (sampennington) — PostHog admin widget
- `payload-ab` (brijr) — A/B testing for collections

#### Güvenlik & Erişim
- `payload-rate-limit` — Login + public API rate limit (brute force koruma)
- `payload-audit-log` — Kim, ne zaman, ne değiştirdi (ISO/KVKK compliance)
- `payload-cloudflare-turnstile` — Bot koruması (form-builder ile)
- `payload-oauth2` / `@payloadcms/plugin-oauth` — Tekil OAuth2 (Google SSO)

#### Form & Entegrasyon
- `payload-webhooks-plugin` — Slack/Discord/Zapier webhook
- `payload-public-api` — Public REST API + API key

#### Developer & DevOps
- `payload-oapi` (janbuchar) — OpenAPI 3.0 spec + Swagger UI (SDK üretmek için)
- `@payloadcms/plugin-sentry` — Sentry/Bugsink (kurulu)

#### Niş
- `payload-appointments-plugin` (ahmetskilinc) — Services + Appointments + calendar
- `payload-comments` — Blog yorum sistemi
- `payload-meilisearch` — Tipo-toleranslı arama (Türkçe karakter sorunsuz)

---

## Environment Variables

Tüm env'ler **`.env.example`'da örnek değerleriyle**. Yeni proje açtığında:
```bash
cp .env.example .env
# .env'i düzenle
```

### Zorunlu (Core)

| Var | Açıklama |
|---|---|
| `DATABASE_URL` | Postgres bağlantı string'i |
| `PAYLOAD_SECRET` | JWT/session encryption (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_SERVER_URL` | Site URL (CORS + meta tags) |

### Önerilen (Core)

| Var | Açıklama |
|---|---|
| `CRON_SECRET` | Vercel/cron job auth |
| `PREVIEW_SECRET` | Draft preview validation |
| `PUBLIC_LOCALES` | Aktif locale'ler (örn. `tr,en`) — middleware |
| `PUBLIC_DEFAULT_LOCALE` | Accept-Language eşleşmediğinde fallback |

### Plugin Env'leri (ilgili plugin wire edildiğinde aktif)

| Plugin | Env Değişkenleri |
|---|---|
| `storage-s3` | `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_REGION`, `S3_BUCKET`, `S3_ENDPOINT` (R2/MinIO için) |
| `email-resend` | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME` |
| `plugin-sentry` (Bugsink) | `BUGSINK_DSN` (Bugsink veya Sentry SaaS DSN) |
| `encrypted-fields` | `ENCRYPTION_KEY` (`openssl rand -hex 32`) ⚠️ kayıp = veri okunamaz |
| `payload-auth-plugin` | `AUTH_SECRET` (+ opsiyonel: `GOOGLE_CLIENT_ID/SECRET`, `MICROSOFT_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET`) |
| `payload-rbac` | — yok |
| `broken-link-checker` | — yok (cron config'te) |

---

## Kullanım

### Yeni Proje (Önerilen: /proje-kur skill ile)

```bash
# Spec dosyanı hazırla (örn. egeseramik.yaml)
# Sonra:
claude
> /proje-kur ./egeseramik.yaml
```

Skill bu repo'yu template clone'lar (`gh repo create --template inanc76/mcv6`), spec'i uygular, içeriği seed eder, push'lar. Sıfır soru, ~12 dakikada hazır.

### Manuel Deneme

```bash
gh repo create my-project --template inanc76/mcv6 --private --clone
cd my-project
pnpm install

cp .env.example .env
# .env'i düzenle:
#   DATABASE_URL=postgres://USER@localhost:5432/my-project
#   PAYLOAD_SECRET=<openssl rand -hex 32>
#   PUBLIC_LOCALES=tr,en
#   PUBLIC_DEFAULT_LOCALE=tr

createdb my-project
pnpm dev
# → http://localhost:3000/tr (frontend — placeholder)
# → http://localhost:3000/admin (Payload — ilk açılışta admin user yarat)
```

---

## Seed Workflow (sitemap + navigation + forms)

mcv6 üç dosyadan beslenen idempotent seed sistemi sağlar:

| Dosya | Hedef | Yöntem |
|---|---|---|
| `sitemap.yml` | Pages + folders (multi-locale) | `POST /api/seed-from-sitemap` |
| `navigation.yml` | 3 navigation global | `pnpm exec tsx scripts/seed-navigation.ts` |
| `forms.yml` | Forms collection (stub veya tam) | `pnpm exec tsx scripts/seed-forms.ts` |

Hepsi idempotent — aynı dosya birden çok kez çalıştırılabilir, yenilenir.

### sitemap.yml schema (multi-locale)

```yaml
site:
  name: "Site Adı"
  defaultLocale: "tr"          # PUBLIC_DEFAULT_LOCALE ile eşleşmeli
  locales: ["tr", "en"]        # opsiyonel; yoksa [defaultLocale]

pages:
  - slug: anasayfa             # default locale slug (zorunlu)
    title: "Ana Sayfa"         # default locale title (zorunlu)
    slugs:                     # opsiyonel: locale-spesifik slug override
      tr: anasayfa
      en: home
    titles:                    # opsiyonel: locale-spesifik title override
      tr: "Ana Sayfa"
      en: "Home"
    path: /anasayfa
    type: landing              # landing | content | group | form | archive | external

  - slug: hakkimizda
    title: "Hakkımızda"
    slugs: { tr: hakkimizda, en: about }
    titles: { tr: "Hakkımızda", en: "About" }
    path: /hakkimizda
    type: group                # group → Page yaratmaz, folder + children için header
    children:
      - slug: ege-seramik
        title: "Ege Seramik"
        slugs: { tr: ege-seramik, en: ege-seramik }
        titles: { tr: "Ege Seramik", en: "Ege Seramik" }
        path: /hakkimizda/ege-seramik
        type: content
```

**Davranış:**
- `type: group` → Page yaratılmaz; admin'de folder olur, children parent ID'sini bir üst seviyeden alır.
- `type: external` → tamamen atlanır (URL navigation'a koy).
- `slugs` / `titles` yoksa → sadece default locale seed edilir, ek locale boş kalır.
- `slugs` var ama `titles` yok → ek locale title `Title-Case-From-Slug` ile otomatik (admin'den düzeltilebilir).
- Sayfalar idempotent: default-locale slug üzerinden eşleşir; varsa update, yoksa create.

### navigation.yml schema

```yaml
defaultLocale: tr
locales: [tr, en]              # opsiyonel

header:                        # → global slug: header-navigation (2 seviye)
  - label: "Online Satış"
    labels: { tr: "Online Satış", en: "Online Sales" }   # opsiyonel
    url: "https://online.example.com"
    type: external

  - label: "İndirme Merkezi"
    ref: "indirme-merkezi"     # = Page slug (default locale)
    type: internal

  - label: "Sanal Deneyim"
    type: group                # sayfasız başlık (link.type='group')
    children:
      - label: "Sanal Odalar"
        ref: "sanal-odalar"
        type: internal

main: [...]                    # → main-navigation (3 seviye)
footer: [...]                  # → footer-navigation (2 seviye)
```

**Type → Payload link mapping:**

| navigation.yml type | Payload link.type | Diğer alanlar |
|---|---|---|
| `external` | `custom` | `url`, `newTab: true` |
| `internal` | `reference` | `reference: { relationTo: 'pages', value: <id> }` |
| `group` | `group` | sadece `label` (sayfasız başlık) |

### forms.yml schema

```yaml
forms:
  - title: "İş Başvuru Formu"
    submitLabel: "Gönder"                                    # opsiyonel
    confirmationMessage: "Başvurunuz alındı, teşekkürler."   # plain text
    fields: []                                               # admin'den doldur
    # veya inline:
    # fields:
    #   - { type: text, name: adsoyad, label: "Ad Soyad", required: true }
    #   - { type: email, name: email, label: "E-posta", required: true }
```

İdempotent: title üzerinden eşleşir.

---

## Custom Admin Route

Default admin route `/admin`. Bunu özelleştirmek (örn. `/admin/<proje>`) **iki dosyada birden** değişiklik gerektirir — `routes.admin` config'i yetmez:

**1. `src/payload.config.ts`'e route ekle:**

```ts
export default buildConfig({
  routes: {
    admin: '/admin/<proje>',
  },
  // ...
})
```

**2. Next.js app klasörünü taşı** (kritik — atlanırsa **sonsuz redirect loop**):

```bash
cd src/app/\(payload\)/admin
mkdir -p <proje>
git mv "[[...segments]]" <proje>/
```

**3. Taşınan `page.tsx` ve `not-found.tsx`'de import path'i düzelt:**

```ts
// ESKİ:  import { importMap } from '../importMap'
import { importMap } from '../../importMap'
```

**Test:**
```bash
curl -I http://127.0.0.1:3000/admin/<proje>          # 200
curl -I http://127.0.0.1:3000/admin                  # 404 (eski yol gitmiş olmalı)
curl -I http://127.0.0.1:3000/admin/<proje>/create-first-user  # 200
```

`/admin` ve `/admin/<proje>` ikisi de 200 dönüyorsa → klasör taşıması başarısız; geri dön.

---

## Yapı

```
src/
├── access/                          # Generic access control helpers
│   ├── anyone.ts
│   ├── authenticated.ts
│   └── authenticatedOrPublished.ts
├── app/
│   ├── (frontend)/                  # Public site
│   │   ├── [locale]/
│   │   │   ├── page.tsx             # Anasayfa
│   │   │   ├── [...slug]/page.tsx   # Dinamik Pages
│   │   │   ├── posts/               # Blog
│   │   │   └── search/              # Site içi arama
│   │   ├── (sitemaps)/              # sitemap.xml routes
│   │   ├── next/                    # preview, seed routes
│   │   └── globals.css
│   └── (payload)/                   # Payload admin
│       ├── admin/[[...segments]]/
│       └── api/[...slug]/
├── blocks/                          # 20 aktif block
│   ├── (Mevcut 8 — full styled)
│   │   ├── ArchiveBlock/
│   │   ├── CallToAction/
│   │   ├── Content/
│   │   ├── FAQBlock/
│   │   ├── FeaturesBlock/
│   │   ├── Form/
│   │   ├── MediaBlock/
│   │   └── TestimonialsBlock/
│   ├── (Yeni 12 — semi-styled)
│   │   ├── AccordionBlock/
│   │   ├── CTASection/
│   │   ├── GalleryBlock/
│   │   ├── HeroSlider/
│   │   ├── LogoCloud/
│   │   ├── MapBlock/
│   │   ├── NewsletterSignup/
│   │   ├── ProductGrid/
│   │   ├── StatsBlock/
│   │   ├── TeamGrid/
│   │   ├── TimelineBlock/
│   │   └── VideoBlock/
│   └── RenderBlocks.tsx
├── collections/
│   ├── Categories.ts
│   ├── Media.ts
│   ├── Pages/                       # folders: true, nested, layout blocks
│   ├── Posts/                       # Categories taxonomy
│   └── Users/                       # auth zorunlu
├── HeaderNavigation/                # slug: header-navigation
├── MainNavigation/                  # slug: main-navigation, 3-seviye nested
├── FooterNavigation/                # slug: footer-navigation
├── SiteSettings/                    # slug: site-settings (branding + contact)
├── heros/                           # lowImpact, mediumImpact, highImpact
├── fields/
│   ├── defaultLexical.ts
│   ├── link.ts
│   └── linkGroup.ts
├── components/                      # AdminBar, BeforeDashboard, RichText, PayloadRedirects, vs.
├── hooks/                           # populatePublishedAt, formatSlug
├── utilities/                       # getURL, getGlobals, getDocument, vs.
├── middleware.ts                    # generic locale-aware
└── payload.config.ts                # Bare wire — collections, globals, i18n, localization
```

---

## Lisans

MIT
