import type { Block } from 'payload'

export const StatsBlock: Block = {
  slug: 'stats',
  interfaceName: 'StatsBlock',
  labels: {
    singular: { en: 'Stats', tr: 'İstatistikler' },
    plural: { en: 'Stats', tr: 'İstatistikler' },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      label: { en: 'Section Title', tr: 'Bölüm Başlığı' },
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      labels: {
        singular: { en: 'Stat', tr: 'İstatistik' },
        plural: { en: 'Stats', tr: 'İstatistikler' },
      },
      fields: [
        { name: 'value', type: 'text', required: true, label: { en: 'Value (e.g. "100+")', tr: 'Değer (örn. "100+")' } },
        { name: 'label', type: 'text', localized: true, required: true, label: { en: 'Label', tr: 'Etiket' } },
        { name: 'description', type: 'text', localized: true, label: { en: 'Description', tr: 'Açıklama' } },
      ],
    },
  ],
}
