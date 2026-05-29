import type { Field, GroupField } from 'payload'

import deepMerge from '@/utilities/deepMerge'

export type LinkAppearances = 'default' | 'outline'

export const appearanceOptions: Record<
  LinkAppearances,
  { label: { tr: string; en: string }; value: string }
> = {
  default: {
    label: { tr: 'Varsayılan', en: 'Default' },
    value: 'default',
  },
  outline: {
    label: { tr: 'Çerçeveli', en: 'Outline' },
    value: 'outline',
  },
}

type LinkType = (options?: {
  appearances?: LinkAppearances[] | false
  disableLabel?: boolean
  overrides?: Partial<GroupField>
}) => Field

export const link: LinkType = ({ appearances, disableLabel = false, overrides = {} } = {}) => {
  const linkResult: GroupField = {
    name: 'link',
    type: 'group',
    label: { tr: 'Bağlantı', en: 'Link' },
    admin: {
      hideGutter: true,
    },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'type',
            type: 'radio',
            label: { tr: 'Tip', en: 'Type' },
            admin: {
              layout: 'horizontal',
              width: '50%',
            },
            defaultValue: 'reference',
            options: [
              {
                label: { tr: 'Sayfa Bağlantısı', en: 'Internal link' },
                value: 'reference',
              },
              {
                label: { tr: 'Özel URL', en: 'Custom URL' },
                value: 'custom',
              },
              {
                label: { tr: 'Grup (sayfasız başlık)', en: 'Group (pageless heading)' },
                value: 'group',
              },
            ],
          },
          {
            name: 'newTab',
            type: 'checkbox',
            admin: {
              style: {
                alignSelf: 'flex-end',
              },
              width: '50%',
            },
            label: { tr: 'Yeni sekmede aç', en: 'Open in new tab' },
          },
        ],
      },
    ],
  }

  const linkTypes: Field[] = [
    {
      name: 'reference',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'reference',
      },
      label: { tr: 'Bağlanılacak Sayfa', en: 'Document to link to' },
      relationTo: ['pages', 'posts'],
      // required koşullu olduğu için false; group tipinde Page seçilmek zorunda değil
      required: false,
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'custom',
      },
      label: { tr: 'Özel URL', en: 'Custom URL' },
      required: false,
    },
  ]

  if (!disableLabel) {
    linkTypes.map((linkType) => ({
      ...linkType,
      admin: {
        ...linkType.admin,
        width: '50%',
      },
    }))

    linkResult.fields.push({
      type: 'row',
      fields: [
        ...linkTypes,
        {
          name: 'label',
          type: 'text',
          admin: {
            width: '50%',
          },
          label: { tr: 'Etiket', en: 'Label' },
          required: true,
        },
      ],
    })
  } else {
    linkResult.fields = [...linkResult.fields, ...linkTypes]
  }

  if (appearances !== false) {
    let appearanceOptionsToUse = [appearanceOptions.default, appearanceOptions.outline]

    if (appearances) {
      appearanceOptionsToUse = appearances.map((appearance) => appearanceOptions[appearance])
    }

    linkResult.fields.push({
      name: 'appearance',
      type: 'select',
      label: { tr: 'Görünüm', en: 'Appearance' },
      admin: {
        description: { tr: 'Bağlantının nasıl görüneceğini seçin.', en: 'Choose how the link should be rendered.' },
      },
      defaultValue: 'default',
      options: appearanceOptionsToUse,
    })
  }

  return deepMerge(linkResult, overrides)
}
