import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const FooterNavigation: GlobalConfig = {
  slug: 'footer-navigation',
  label: { tr: 'Footer Menü', en: 'Footer Navigation' },
  access: {
    read: () => true,
  },
  admin: {
    group: { tr: 'Globaller', en: 'Globals' },
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      label: { tr: 'Menü Öğeleri', en: 'Nav Items' },
      labels: {
        singular: { tr: 'Menü Öğesi', en: 'Nav Item' },
        plural: { tr: 'Menü Öğeleri', en: 'Nav Items' },
      },
      localized: true,
      fields: [
        link({
          appearances: false,
        }),
        {
          name: 'subItems',
          type: 'array',
          label: { tr: 'Alt Öğeler', en: 'Sub Items' },
          labels: {
            singular: { tr: 'Alt Öğe', en: 'Sub Item' },
            plural: { tr: 'Alt Öğeler', en: 'Sub Items' },
          },
          fields: [
            link({
              appearances: false,
            }),
          ],
          admin: {
            initCollapsed: true,
            components: {
              RowLabel: '@/components/MenuRowLabel#MenuRowLabel',
            },
          },
        },
      ],
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/components/MenuRowLabel#MenuRowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
