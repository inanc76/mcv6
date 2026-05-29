import type { Block } from 'payload'

export const FAQBlock: Block = {
  slug: 'faq',
  interfaceName: 'FAQBlock',
  labels: { singular: 'FAQ', plural: 'FAQ' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Frequently Asked Questions' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 30,
      labels: { singular: 'Question', plural: 'Questions' },
      admin: {
        initCollapsed: true,
        components: { RowLabel: '@/blocks/_shared/RowLabel#RowLabel' },
      },
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
  ],
}
