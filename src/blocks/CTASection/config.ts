import type { Block } from 'payload'

export const CTASection: Block = {
  slug: 'ctaSection',
  interfaceName: 'CTASectionBlock',
  labels: {
    singular: { en: 'CTA Section', tr: 'CTA Bölümü' },
    plural: { en: 'CTA Sections', tr: 'CTA Bölümleri' },
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { en: 'Title', tr: 'Başlık' } },
    { name: 'subtitle', type: 'textarea', localized: true, label: { en: 'Subtitle', tr: 'Alt başlık' } },
    {
      name: 'buttons',
      type: 'array',
      maxRows: 3,
      labels: { singular: { en: 'Button', tr: 'Buton' }, plural: { en: 'Buttons', tr: 'Butonlar' } },
      fields: [
        { name: 'label', type: 'text', required: true, localized: true, label: { en: 'Label', tr: 'Etiket' } },
        { name: 'url', type: 'text', required: true, label: { en: 'URL', tr: 'URL' } },
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'primary',
          options: [
            { label: { en: 'Primary', tr: 'Birincil' }, value: 'primary' },
            { label: { en: 'Secondary', tr: 'İkincil' }, value: 'secondary' },
            { label: { en: 'Ghost', tr: 'Ghost' }, value: 'ghost' },
          ],
          label: { en: 'Variant', tr: 'Görünüm' },
        },
        { name: 'newTab', type: 'checkbox', defaultValue: false, label: { en: 'Open in new tab', tr: 'Yeni sekmede aç' } },
      ],
    },
    {
      name: 'background',
      type: 'group',
      label: { en: 'Background', tr: 'Arka plan' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', label: { en: 'Image', tr: 'Görsel' } },
        { name: 'overlay', type: 'checkbox', defaultValue: true, label: { en: 'Dark overlay', tr: 'Koyu overlay' } },
      ],
    },
  ],
}
