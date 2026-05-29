import type { Block } from 'payload'

export const GalleryBlock: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  labels: {
    singular: { en: 'Gallery', tr: 'Galeri' },
    plural: { en: 'Galleries', tr: 'Galeriler' },
  },
  fields: [
    { name: 'title', type: 'text', localized: true, label: { en: 'Title', tr: 'Başlık' } },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: { en: 'Grid', tr: 'Grid' }, value: 'grid' },
        { label: { en: 'Masonry', tr: 'Masonry' }, value: 'masonry' },
      ],
      label: { en: 'Layout', tr: 'Yerleşim' },
    },
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      labels: { singular: { en: 'Image', tr: 'Görsel' }, plural: { en: 'Images', tr: 'Görseller' } },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text', localized: true, label: { en: 'Caption', tr: 'Açıklama' } },
      ],
    },
  ],
}
