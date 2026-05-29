import type { Block } from 'payload'

export const TeamGrid: Block = {
  slug: 'teamGrid',
  interfaceName: 'TeamGridBlock',
  labels: {
    singular: { en: 'Team Grid', tr: 'Ekip Grid' },
    plural: { en: 'Team Grids', tr: 'Ekip Gridleri' },
  },
  fields: [
    { name: 'title', type: 'text', localized: true, label: { en: 'Section Title', tr: 'Bölüm Başlığı' } },
    { name: 'subtitle', type: 'text', localized: true, label: { en: 'Subtitle', tr: 'Alt başlık' } },
    {
      name: 'members',
      type: 'array',
      minRows: 1,
      labels: {
        singular: { en: 'Member', tr: 'Üye' },
        plural: { en: 'Members', tr: 'Üyeler' },
      },
      fields: [
        { name: 'photo', type: 'upload', relationTo: 'media', label: { en: 'Photo', tr: 'Fotoğraf' } },
        { name: 'name', type: 'text', required: true, label: { en: 'Full Name', tr: 'Ad Soyad' } },
        { name: 'role', type: 'text', localized: true, label: { en: 'Role', tr: 'Görev' } },
        { name: 'bio', type: 'textarea', localized: true, label: { en: 'Short Bio', tr: 'Kısa Biyografi' } },
        {
          name: 'social',
          type: 'array',
          labels: { singular: 'Link', plural: 'Links' },
          fields: [
            { name: 'platform', type: 'select', options: ['linkedin', 'x', 'github', 'instagram', 'website'], required: true },
            { name: 'url', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
}
