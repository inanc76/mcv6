import type { Block } from 'payload'

export const TimelineBlock: Block = {
  slug: 'timeline',
  interfaceName: 'TimelineBlock',
  labels: {
    singular: { en: 'Timeline', tr: 'Zaman Çizelgesi' },
    plural: { en: 'Timelines', tr: 'Zaman Çizelgeleri' },
  },
  fields: [
    { name: 'title', type: 'text', localized: true, label: { en: 'Section Title', tr: 'Bölüm Başlığı' } },
    {
      name: 'orientation',
      type: 'select',
      defaultValue: 'vertical',
      options: [
        { label: { en: 'Vertical', tr: 'Dikey' }, value: 'vertical' },
        { label: { en: 'Horizontal', tr: 'Yatay' }, value: 'horizontal' },
      ],
      label: { en: 'Orientation', tr: 'Yön' },
    },
    {
      name: 'events',
      type: 'array',
      minRows: 1,
      labels: { singular: { en: 'Event', tr: 'Olay' }, plural: { en: 'Events', tr: 'Olaylar' } },
      fields: [
        { name: 'date', type: 'text', required: true, label: { en: 'Date / Year', tr: 'Tarih / Yıl' } },
        { name: 'title', type: 'text', required: true, localized: true, label: { en: 'Title', tr: 'Başlık' } },
        { name: 'description', type: 'textarea', localized: true, label: { en: 'Description', tr: 'Açıklama' } },
        { name: 'image', type: 'upload', relationTo: 'media', label: { en: 'Image', tr: 'Görsel' } },
      ],
    },
  ],
}
