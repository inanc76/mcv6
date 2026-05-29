import type { Block } from 'payload'

export const AccordionBlock: Block = {
  slug: 'accordion',
  interfaceName: 'AccordionBlock',
  labels: {
    singular: { en: 'Accordion', tr: 'Akordeon' },
    plural: { en: 'Accordions', tr: 'Akordeonlar' },
  },
  fields: [
    { name: 'title', type: 'text', localized: true, label: { en: 'Section Title', tr: 'Bölüm Başlığı' } },
    {
      name: 'allowMultiple',
      type: 'checkbox',
      defaultValue: false,
      label: { en: 'Allow multiple open', tr: 'Birden fazla açık olabilsin' },
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      labels: { singular: { en: 'Item', tr: 'Madde' }, plural: { en: 'Items', tr: 'Maddeler' } },
      fields: [
        { name: 'heading', type: 'text', required: true, localized: true, label: { en: 'Heading', tr: 'Başlık' } },
        { name: 'content', type: 'textarea', required: true, localized: true, label: { en: 'Content', tr: 'İçerik' } },
      ],
    },
  ],
}
