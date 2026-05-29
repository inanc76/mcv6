import type { Block } from 'payload'

export const MapBlock: Block = {
  slug: 'map',
  interfaceName: 'MapBlock',
  labels: {
    singular: { en: 'Map', tr: 'Harita' },
    plural: { en: 'Maps', tr: 'Haritalar' },
  },
  fields: [
    { name: 'title', type: 'text', localized: true, label: { en: 'Title', tr: 'Başlık' } },
    {
      name: 'provider',
      type: 'select',
      defaultValue: 'google',
      options: [
        { label: 'Google Maps', value: 'google' },
        { label: 'Mapbox', value: 'mapbox' },
        { label: { en: 'Generic iframe (embed URL)', tr: 'Generic iframe (embed URL)' }, value: 'iframe' },
      ],
      label: { en: 'Provider', tr: 'Sağlayıcı' },
    },
    { name: 'latitude', type: 'number', label: { en: 'Latitude', tr: 'Enlem' } },
    { name: 'longitude', type: 'number', label: { en: 'Longitude', tr: 'Boylam' } },
    { name: 'zoom', type: 'number', defaultValue: 15, label: { en: 'Zoom', tr: 'Yakınlaştırma' } },
    {
      name: 'embedUrl',
      type: 'text',
      label: { en: 'Embed URL (for iframe)', tr: 'Embed URL (iframe için)' },
      admin: { condition: (_, { provider }) => provider === 'iframe' },
    },
    {
      name: 'markers',
      type: 'array',
      labels: { singular: { en: 'Marker', tr: 'İşaretçi' }, plural: { en: 'Markers', tr: 'İşaretçiler' } },
      fields: [
        { name: 'label', type: 'text', localized: true, label: { en: 'Label', tr: 'Etiket' } },
        { name: 'lat', type: 'number', required: true },
        { name: 'lng', type: 'number', required: true },
      ],
    },
  ],
}
