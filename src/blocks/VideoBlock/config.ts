import type { Block } from 'payload'

export const VideoBlock: Block = {
  slug: 'video',
  interfaceName: 'VideoBlock',
  labels: {
    singular: { en: 'Video', tr: 'Video' },
    plural: { en: 'Videos', tr: 'Videolar' },
  },
  fields: [
    { name: 'title', type: 'text', localized: true, label: { en: 'Title', tr: 'Başlık' } },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'youtube',
      options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'Vimeo', value: 'vimeo' },
        { label: { en: 'Direct URL (mp4 etc.)', tr: 'Direkt URL (mp4 vb.)' }, value: 'direct' },
      ],
      label: { en: 'Source', tr: 'Kaynak' },
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      label: { en: 'Video URL or ID', tr: 'Video URL veya ID' },
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      label: { en: 'Poster Image', tr: 'Önizleme Görseli' },
    },
    {
      name: 'autoplay',
      type: 'checkbox',
      defaultValue: false,
      label: { en: 'Autoplay', tr: 'Otomatik oynat' },
    },
  ],
}
