import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateMainMenu } from './hooks/revalidateMainMenu'

export const MainNavigation: GlobalConfig = {
  slug: 'main-navigation',
  label: { tr: 'Ana Menü', en: 'Main Navigation' },
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
            {
              name: 'children',
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
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/components/MenuRowLabel#MenuRowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateMainMenu],
  },
}
