import type { Block } from 'payload'

export const HeroSlider: Block = {
  slug: 'heroSlider',
  interfaceName: 'HeroSliderBlock',
  labels: {
    singular: { en: 'Hero Slider', tr: 'Hero Slider' },
    plural: { en: 'Hero Sliders', tr: "Hero Slider'lar" },
  },
  fields: [
    {
      name: 'slides',
      type: 'array',
      labels: {
        singular: { en: 'Slide', tr: 'Slayt' },
        plural: { en: 'Slides', tr: 'Slaytlar' },
      },
      minRows: 1,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true, label: { en: 'Image', tr: 'Görsel' } },
        { name: 'title', type: 'text', localized: true, label: { en: 'Title', tr: 'Başlık' } },
        { name: 'subtitle', type: 'text', localized: true, label: { en: 'Subtitle', tr: 'Alt başlık' } },
        { name: 'ctaLabel', type: 'text', localized: true, label: { en: 'CTA Label', tr: 'Buton metni' } },
        { name: 'ctaUrl', type: 'text', label: { en: 'CTA URL', tr: 'Buton URL' } },
      ],
    },
    {
      name: 'autoPlay',
      type: 'checkbox',
      defaultValue: true,
      label: { en: 'Auto-play', tr: 'Otomatik geçiş' },
    },
    {
      name: 'interval',
      type: 'number',
      defaultValue: 5000,
      label: { en: 'Interval (ms)', tr: 'Aralık (ms)' },
      admin: { condition: (_, { autoPlay }) => Boolean(autoPlay) },
    },
  ],
}
