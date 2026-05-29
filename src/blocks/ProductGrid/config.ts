import type { Block } from 'payload'

export const ProductGrid: Block = {
  slug: 'productGrid',
  interfaceName: 'ProductGridBlock',
  labels: {
    singular: { en: 'Product Grid', tr: 'Ürün Grid' },
    plural: { en: 'Product Grids', tr: 'Ürün Gridleri' },
  },
  fields: [
    { name: 'title', type: 'text', localized: true, label: { en: 'Section Title', tr: 'Bölüm Başlığı' } },
    { name: 'subtitle', type: 'text', localized: true, label: { en: 'Subtitle', tr: 'Alt başlık' } },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      options: ['2', '3', '4'],
      label: { en: 'Columns', tr: 'Kolon sayısı' },
    },
    {
      name: 'products',
      type: 'array',
      minRows: 1,
      labels: { singular: { en: 'Product', tr: 'Ürün' }, plural: { en: 'Products', tr: 'Ürünler' } },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', label: { en: 'Image', tr: 'Görsel' } },
        { name: 'name', type: 'text', required: true, localized: true, label: { en: 'Name', tr: 'Ad' } },
        { name: 'description', type: 'textarea', localized: true, label: { en: 'Description', tr: 'Açıklama' } },
        { name: 'price', type: 'text', label: { en: 'Price (display)', tr: 'Fiyat (görünüm)' } },
        { name: 'url', type: 'text', label: { en: 'Product URL', tr: 'Ürün URL' } },
        { name: 'badge', type: 'text', localized: true, label: { en: 'Badge (e.g. "New")', tr: 'Etiket (örn. "Yeni")' } },
      ],
    },
  ],
}
