import type { Block } from 'payload'

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  interfaceName: 'TestimonialsBlock',
  labels: { singular: 'Testimonials', plural: 'Testimonials' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Our Customers Trust GoWay to Power Their Accessibility',
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 9,
      labels: { singular: 'Testimonial', plural: 'Testimonials' },
      admin: {
        initCollapsed: true,
        components: { RowLabel: '@/blocks/_shared/RowLabel#RowLabel' },
      },
      fields: [
        { name: 'rating', type: 'number', min: 1, max: 5, defaultValue: 5 },
        { name: 'quote', type: 'textarea', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'title', type: 'text' },
        { name: 'avatar', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
