import type { Block } from 'payload'

export const FeaturesBlock: Block = {
  slug: 'features',
  interfaceName: 'FeaturesBlock',
  labels: { singular: 'Features', plural: 'Features' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Features' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: { RowLabel: '@/blocks/_shared/RowLabel#RowLabel' },
      },
      fields: [
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Square illustration (recommended ~200×200).' },
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
  ],
}
