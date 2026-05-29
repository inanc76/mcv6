# mcv6 — MediaClick CMS Template

MediaClick Ajansı için Payload CMS 3 + Next.js 16 tabanlı "default-zengin" proje şablonu. Her kurumsal site için tekrar tekrar gereken altyapıyı (auth, collections, navigation globals, blocks, locale routing, admin) hazır sunar. Yeni proje açılır açılmaz **iskelet işliyor** — her projeye özgü kısım (sitemap'ten gelen sayfalar, müşterinin tasarım stilleri, custom collection'lar) `/proje-kur` skill'i ile spec YAML'dan üretilir.

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

MediaClick her ay 1-2 yeni kurumsal site açıyor. Her seferinde:
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

MediaClick'te her müşteri kendi tasarımcısıyla özel tasarım yapıyor. Mcv6'da generic Tailwind stilleri eklemek demek:
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

## Pluginler (Yapılandırma Beklemede)

> Bu bölüm ilerleyen iterasyonda detaylandırılacak. Şu an plugin'ler `package.json`'da kurulu ama `payload.config.ts`'in `plugins: []` dizisi BOŞ. `/proje-kur` skill'inin spec.payloadHints'e göre nasıl wire edeceği ayrı bir konuşma konusu.

Hazır plugin'ler:
- `@payloadcms/plugin-nested-docs@3.85.0` — Pages hierarchy + breadcrumbs
- `@payloadcms/plugin-form-builder@3.85.0` — Forms collection + FormBlock entegrasyonu
- `@payloadcms/plugin-seo@3.85.0` — Meta tag fields
- `@payloadcms/plugin-redirects@3.85.0` — URL redirect collection
- `@payloadcms/plugin-search@3.85.0` — Search index
- `@payloadcms/storage-s3` — S3 cloud storage (production)
- `@payloadcms/email-nodemailer` — SMTP email adapter (production)

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
