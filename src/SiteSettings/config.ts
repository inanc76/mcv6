import type { GlobalConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { revalidateSiteSettings } from './hooks/revalidateSiteSettings'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: { tr: 'Site Ayarları', en: 'Site Settings' },
  access: {
    read: () => true,
    update: authenticated,
  },
  admin: {
    group: { en: 'Globals', tr: 'Globaller' },
  },
  fields: [
    // ─── BRANDING ────────────────────────────────────────────────────────
    {
      name: 'branding',
      label: { en: 'Branding', tr: 'Marka' },
      type: 'group',
      fields: [
        {
          name: 'siteName',
          label: { en: 'Site Name', tr: 'Site Adı' },
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'tagline',
          label: { en: 'Tagline', tr: 'Slogan' },
          type: 'text',
          localized: true,
        },
        {
          name: 'logo',
          label: { en: 'Logo (light theme)', tr: 'Logo (açık tema)' },
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'logoDark',
          label: { en: 'Logo (dark theme)', tr: 'Logo (koyu tema)' },
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'favicon',
          label: { en: 'Favicon', tr: 'Favicon' },
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'appleTouchIcon',
          label: { en: 'Apple Touch Icon', tr: 'Apple Touch Icon' },
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'ogImage',
          label: { en: 'Default OG Image (1200×630)', tr: 'Varsayılan OG Görseli (1200×630)' },
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    // ─── CONTACT ─────────────────────────────────────────────────────────
    {
      name: 'contact',
      label: { en: 'Contact', tr: 'İletişim' },
      type: 'group',
      fields: [
        {
          name: 'address',
          label: { en: 'Address', tr: 'Adres' },
          type: 'textarea',
          localized: true,
        },
        {
          name: 'phone',
          label: { en: 'Phone', tr: 'Telefon' },
          type: 'text',
        },
        {
          name: 'phoneSecondary',
          label: { en: 'Secondary Phone', tr: 'İkinci Telefon' },
          type: 'text',
        },
        {
          name: 'email',
          label: { en: 'Email', tr: 'E-posta' },
          type: 'email',
        },
        {
          name: 'whatsapp',
          label: { en: 'WhatsApp', tr: 'WhatsApp' },
          type: 'text',
          admin: {
            description: { en: 'International format e.g. +905XXXXXXXXX', tr: 'Uluslararası format örn. +905XXXXXXXXX' },
          },
        },
        {
          name: 'workingHours',
          label: { en: 'Working Hours', tr: 'Çalışma Saatleri' },
          type: 'text',
          localized: true,
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
}
