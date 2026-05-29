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
      localized: true,
      fields: [
        link({
          appearances: false,
        }),
        {
          name: 'subItems',
          type: 'array',
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
