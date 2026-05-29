import type { Endpoint, File, Payload } from 'payload'
import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * GoWay main-page seed.
 *
 * Reads every PNG from <repo>/figma-files/main/ (user-exported assets),
 * uploads each to Payload media, then writes Header + Footer globals and
 * creates/replaces the Home page with the design's 7 sections.
 *
 *   curl -X POST http://127.0.0.1:3000/api/seed-main
 *
 * Idempotent: cleans only the docs it owns (alt-tag `[main] <slot>`).
 */

const FIGMA_DIR = '/Users/volkaninanc/CODEBASE/goway/figma-files/main'

const FILES = {
  logo: 'Group 9.png', // wheelchair-person + "GoWay" wordmark
  hero: 'Mask group.png', // full accessibility-panel illustration
  featurePlug: 'Icons-5.png', // person + laptop — Plug & Play
  featureLightweight: 'Icons-1.png', // two screens + transfer — Lightweight & Fast Loading
  featureLogoRemoval: 'Icons.png', // house + briefcase — Logo Removal
  highlightPrivacy: 'Icons-2.png', // clock — User Privacy
  highlightPackages: 'Icons-3.png', // 3 networked computers — Packages
  highlightWcag: 'Icons-4.png', // workstation — WCAG & ADA
  whyChoosePerson: 'iStock-1170933174-ai-modified-06de800e-f149-4827-9076-8498575d0044 1.png',
  whyChooseRing: 'Group 427320718.png', // dotted ring + 7 small icons around the person
  iconMotor: 'Group 49080.png',
  iconColorBlind: 'Group 49081.png',
  iconBlind: 'Group 49083.png',
  iconSeizure: 'Group 49084.png',
  iconCognitive: 'Group 49085.png',
  iconVisuallyImpaired: 'Group 427320721.png',
  iconDyslexia: 'Group 49082.png',
  iconAdhd: 'Group 49086.png',
} as const

type SlotKey = keyof typeof FILES

async function readLocalFile(filename: string): Promise<File> {
  const full = path.join(FIGMA_DIR, filename)
  const buf = await fs.readFile(full)
  const ext = path.extname(filename).toLowerCase().slice(1) || 'png'
  const mime =
    ext === 'svg' ? 'image/svg+xml' :
    ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
    ext === 'webp' ? 'image/webp' : 'image/png'
  const safe = filename.replace(/\s+/g, '-').replace(/[^A-Za-z0-9._-]/g, '')
  return { name: `main-${safe}`, data: buf, mimetype: mime, size: buf.length }
}

const h1 = (text: string) => ({
  type: 'heading', tag: 'h1', format: '', indent: 0, version: 1, direction: 'ltr',
  children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 }],
})
const para = (text: string) => ({
  type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0,
  children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 }],
})
const richText = (...children: any[]) => ({
  root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children },
})

async function runSeed(payload: Payload) {
  payload.logger.info('🌱 main seed başlıyor…')

  await payload.delete({ collection: 'pages', where: { slug: { equals: 'home' } } })
  await payload.delete({ collection: 'media', where: { alt: { like: '[main] %' } } })

  payload.logger.info('   ↳ figma-files okunuyor…')
  const slotKeys = Object.keys(FILES) as SlotKey[]
  const files = await Promise.all(slotKeys.map((k) => readLocalFile(FILES[k])))

  payload.logger.info('   ↳ media yükleniyor…')
  const mediaDocs = await Promise.all(
    files.map((f, i) =>
      payload.create({
        collection: 'media',
        data: { alt: `[main] ${slotKeys[i]}` },
        file: f,
      }),
    ),
  )
  const M = Object.fromEntries(slotKeys.map((k, i) => [k, mediaDocs[i].id])) as Record<
    SlotKey,
    string | number
  >

  payload.logger.info('   ↳ Header global…')
  await payload.updateGlobal({
    slug: 'header',
    data: {
      logoText: '',
      logoIcon: M.logo,
      navItems: [
        { link: { type: 'custom', label: 'Homepage', url: '/' } },
        { link: { type: 'custom', label: 'About GoWay', url: '#about' } },
        { link: { type: 'custom', label: 'Pricing', url: '#pricing' } },
        { link: { type: 'custom', label: 'FAQ', url: '#faq' } },
      ],
      signIn: { label: 'Sign In', url: '/sign-in', enabled: true },
      cta: { label: 'Request a Demo', url: '#demo', enabled: true },
    },
  })

  payload.logger.info('   ↳ Footer global…')
  await payload.updateGlobal({
    slug: 'footer',
    data: {
      logoText: '',
      logoIcon: M.logo,
      columns: [
        {
          heading: 'Solutions',
          links: [
            { link: { type: 'custom', label: 'GoWay Widget', url: '#widget' } },
            { link: { type: 'custom', label: 'GoWay Audit', url: '#audit' } },
            { link: { type: 'custom', label: 'GoWay Report', url: '#report' } },
          ],
        },
        {
          heading: 'About GoWay',
          links: [
            { link: { type: 'custom', label: 'About Us', url: '#about-us' } },
            { link: { type: 'custom', label: 'Brand', url: '#brand' } },
            { link: { type: 'custom', label: 'Customer Stories', url: '#stories' } },
            { link: { type: 'custom', label: 'Careers', url: '#careers' } },
            { link: { type: 'custom', label: 'Research and Insights', url: '#research' } },
            { link: { type: 'custom', label: 'Contact Us', url: '#contact' } },
          ],
        },
        {
          heading: 'Pricing',
          links: [
            { link: { type: 'custom', label: 'All Pricing', url: '#pricing-all' } },
            { link: { type: 'custom', label: 'Small Business', url: '#small' } },
            { link: { type: 'custom', label: 'Medium Business', url: '#medium' } },
            { link: { type: 'custom', label: 'Agencies', url: '#agencies' } },
            { link: { type: 'custom', label: 'Partners', url: '#partners' } },
          ],
        },
        {
          heading: 'Resources',
          links: [
            { link: { type: 'custom', label: 'FAQ', url: '#faq' } },
            { link: { type: 'custom', label: 'Testimonials', url: '#testimonials' } },
            { link: { type: 'custom', label: 'Tutorials', url: '#tutorials' } },
            { link: { type: 'custom', label: 'Blog', url: '#blog' } },
            { link: { type: 'custom', label: 'Regulatory Compliance', url: '#compliance' } },
            { link: { type: 'custom', label: 'Platforms', url: '#platforms' } },
            { link: { type: 'custom', label: 'API Documentation', url: '#api' } },
          ],
        },
      ],
      copyright: '© 2026 GoWay',
      legalLinks: [
        { link: { type: 'custom', label: 'Terms of Use', url: '#terms' } },
        { link: { type: 'custom', label: 'Privacy Policy', url: '#privacy' } },
        { link: { type: 'custom', label: 'Cookie Policy', url: '#cookie' } },
      ],
    },
  })

  payload.logger.info('   ↳ Home page…')
  await payload.create({
    collection: 'pages',
    data: {
      title: 'Home',
      slug: 'home',
      _status: 'published',
      hero: {
        type: 'highImpact',
        media: M.hero,
        richText: richText(
          h1('Make the digital world accessible to everyone!'),
          para(
            "Add web accessibility right with the world's most popular solution. On one site, or hundreds. For one user. For all users.",
          ),
        ),
        links: [
          {
            link: {
              type: 'custom',
              appearance: 'default',
              label: 'Request a Demo',
              url: '#demo',
            },
          },
        ],
      },
      layout: [
        {
          blockType: 'features',
          heading: 'Features',
          items: [
            {
              icon: M.featurePlug,
              title: 'Plug & Play Integration',
              description:
                'Designed for universal compatibility, offering a simple plug & play integration that’s ready in minutes on any platform.',
            },
            {
              icon: M.featureLightweight,
              title: 'Lightweight and Fast Loading',
              description:
                'Designed to be lightweight and fast-loading, ensuring it won’t negatively affect your search engine rankings.',
            },
            {
              icon: M.featureLogoRemoval,
              title: 'Logo Removal and White Label',
              description:
                'Dedicated case manager, start to finish, Detailed claims analysis and responses, ADA attorney consult, plus $15k+ pledge',
            },
          ],
        },
        {
          blockType: 'highlights',
          heading: 'Highlights',
          items: [
            {
              title: '50+ Languages Support',
              description:
                'Automatically detects your website language and supports more than 50 languages.',
              size: 'small',
              // No matching asset in figma-files/main; admin can upload later.
            },
            {
              title: 'User Privacy and Security',
              description:
                'Designed with user privacy and security as a top priority, ensuring it does not collect or store any personal data.',
              size: 'large',
              image: M.highlightPrivacy,
            },
            {
              title: 'Packages for Every Budget',
              description:
                'Automatically detects your website language and supports more than 50 languages.',
              size: 'small',
              image: M.highlightPackages,
            },
            {
              title: 'Supporting WCAG & ADA',
              description:
                'Designed to ensure digital accessibility, supporting full ADA compliance and WCAG 2.1 & 2.2 conformance.',
              size: 'large',
              image: M.highlightWcag,
            },
          ],
        },
        {
          blockType: 'whyChoose',
          heading: 'Why Choose GoWay Tools?',
          description:
            'For users with motor impairments, the plugin enables web navigation without a mouse. It allows movement between links, buttons, and form fields using the keyboard. It is compatible with assistive devices and ensures interactive elements are accessible via the keyboard, increasing independence.',
          image: M.whyChoosePerson,
          ringImage: M.whyChooseRing,
          items: [
            { icon: M.iconMotor, label: 'Motor Impaired' },
            { icon: M.iconColorBlind, label: 'Color Blind' },
            { icon: M.iconBlind, label: 'Blind' },
            { icon: M.iconSeizure, label: 'Seizure & Epileptic' },
            { icon: M.iconCognitive, label: 'Cognitive & Learning' },
            { icon: M.iconVisuallyImpaired, label: 'Visually Impaired' },
            { icon: M.iconDyslexia, label: 'Dyslexia' },
            { icon: M.iconAdhd, label: 'ADHD' },
          ],
        },
        {
          blockType: 'pricing',
          heading: 'Prices',
          audiences: [{ label: 'Website Owners' }, { label: 'Agencies & Partners' }],
          plans: [
            {
              name: 'GoWay Small',
              monthlyPrice: '$12',
              yearlyPrice: '$120',
              priceSuffix: '/ Monthly',
              capacity: 'Up to 50K website visits / month',
              features: [
                { label: 'Unlimited Website Pages' },
                { label: 'Ticket System Support' },
                { label: 'GoWay Logo Removal Option' },
                { label: '7-Day Free Trial' },
              ],
              cta: { label: 'Start Free Trial', url: '#trial-small' },
            },
            {
              name: 'GoWay Medium',
              popular: true,
              monthlyPrice: '$20',
              yearlyPrice: '$200',
              priceSuffix: '/ Monthly',
              capacity: 'Up to 100K website visits / month',
              features: [
                { label: 'Unlimited Website Pages' },
                { label: 'Ticket System Support' },
                { label: 'GoWay Logo Removal Option' },
                { label: '7-Day Free Trial' },
              ],
              cta: { label: 'Start Free Trial', url: '#trial-medium' },
            },
            {
              name: 'GoWay Large',
              monthlyPrice: '$33',
              yearlyPrice: '$330',
              priceSuffix: '/ Monthly',
              capacity: 'Up to 500K website visits / month',
              features: [
                { label: 'Unlimited Website Pages' },
                { label: 'Ticket System Support' },
                { label: 'GoWay Logo Removal Option' },
                { label: '7-Day Free Trial' },
              ],
              cta: { label: 'Start Free Trial', url: '#trial-large' },
            },
            {
              name: 'GoWay XLarge',
              contactSalesLabel: 'Contact Sales',
              priceSuffix: '',
              capacity: 'More than 500K page views / month',
              features: [
                { label: 'Unlimited Website Pages' },
                { label: 'Ticket System Support' },
                { label: 'GoWay Logo Removal Option' },
                { label: '7-Day Free Trial' },
              ],
              cta: { label: 'Start Free Trial', url: '#trial-xl' },
            },
          ],
        },
        {
          blockType: 'testimonials',
          heading: 'Our Customers Trust GoWay to Power Their Accessibility',
          items: [
            {
              rating: 5,
              quote:
                'An accessible website will enable people with disabilities, as well as older individuals, to browse the site with the same level of efficiency and enjoyment as all users.',
              name: 'Dr. A. Gayret',
              title: 'General Manager',
            },
            {
              rating: 5,
              quote:
                'We emphasize the importance of providing equal opportunities on the internet for every individual who needs support in the digital world, and we are happy to achieve this goal.',
              name: 'B. Mehmetoğlu',
              title: 'Analysis and Marketing Expert',
            },
            {
              rating: 5,
              quote:
                'After a long and arduous effort, we’ve launched our new website. Our initial goal with this project was to create a user-friendly site that our customers could easily use.',
              name: 'E.B. Pamukçu',
              title: 'General Manager',
            },
          ],
        },
        {
          blockType: 'faq',
          heading: 'Frequently Asked Questions',
          items: [
            {
              question: 'Does GoWay comply with legislation?',
              answer:
                'Yes. GoWay supports WCAG 2.1 & 2.2 and ADA conformance and is regularly updated to reflect the latest regulatory guidance.',
            },
            {
              question: "How are GoWay's solutions different from accessibility plugins?",
              answer:
                'GoWay combines AI-assisted remediation with a dedicated case manager so the work continues after install — most plugins stop at scanning.',
            },
            {
              question: "Do GoWay's solutions integrate with website builders and CMSs?",
              answer:
                'GoWay drops into any modern site (WordPress, Shopify, Webflow, Next.js, headless CMS) with a single script tag.',
            },
            {
              question: 'Does GoWay Widget help you conform to WCAG?',
              answer:
                'The widget addresses both perceivable and operable WCAG criteria. The supporting audit and manual remediation cover the rest.',
            },
            {
              question: 'How much does GoWay Widget cost?',
              answer:
                'Pricing starts at $12/month for small sites and scales by monthly visits. See the Prices section above for full plans.',
            },
          ],
        },
      ],
    },
  })

  payload.logger.info('✅ main seed bitti.')
}

export const seedMainEndpoint: Endpoint = {
  path: '/seed-main',
  method: 'post',
  handler: async (req) => {
    try {
      await runSeed(req.payload)
      return Response.json({ ok: true })
    } catch (err: any) {
      req.payload.logger.error({ err: err?.message, stack: err?.stack }, 'seed-main failed')
      return Response.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
    }
  },
}
