import type { Block } from 'payload'

export const LogoCloud: Block = {
  slug: 'logoCloud',
  interfaceName: 'LogoCloudBlock',
  labels: {
    singular: { en: 'Logo Cloud', tr: 'Logo Bulutu' },
    plural: { en: 'Logo Clouds', tr: 'Logo Bulutları' },
  },
  fields: [
    { name: 'title', type: 'text', localized: true, label: { en: 'Title', tr: 'Başlık' } },
    { name: 'subtitle', type: 'text', localized: true, label: { en: 'Subtitle', tr: 'Alt başlık' } },
    {
      name: 'logos',
      type: 'array',
      minRows: 1,
      labels: { singular: { en: 'Logo', tr: 'Logo' }, plural: { en: 'Logos', tr: 'Logolar' } },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'name', type: 'text', label: { en: 'Brand name', tr: 'Marka adı' } },
        { name: 'url', type: 'text', label: { en: 'Link (optional)', tr: 'Bağlantı (opsiyonel)' } },
      ],
    },
  ],
}
