import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
// Mevcut 8 (template — full styled)
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FAQBlock as FAQ } from '../../blocks/FAQBlock/config'
import { FeaturesBlock as Features } from '../../blocks/FeaturesBlock/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { TestimonialsBlock as Testimonials } from '../../blocks/TestimonialsBlock/config'
// 12 yeni (semi-styled — yapı + işleyiş tam, stil yok)
import { HeroSlider } from '../../blocks/HeroSlider/config'
import { StatsBlock } from '../../blocks/StatsBlock/config'
import { TeamGrid } from '../../blocks/TeamGrid/config'
import { AccordionBlock } from '../../blocks/AccordionBlock/config'
import { GalleryBlock } from '../../blocks/GalleryBlock/config'
import { LogoCloud } from '../../blocks/LogoCloud/config'
import { MapBlock } from '../../blocks/MapBlock/config'
import { VideoBlock } from '../../blocks/VideoBlock/config'
import { CTASection } from '../../blocks/CTASection/config'
import { TimelineBlock } from '../../blocks/TimelineBlock/config'
import { NewsletterSignup } from '../../blocks/NewsletterSignup/config'
import { ProductGrid } from '../../blocks/ProductGrid/config'
import { hero } from '@/heros/config'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  labels: {
    singular: { tr: 'Sayfa', en: 'Page' },
    plural: { tr: 'Sayfalar', en: 'Pages' },
  },
  folders: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    group: { tr: 'İçerik', en: 'Content' },
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [{ ...hero, localized: true }],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                CallToAction, Content, MediaBlock, Archive, FormBlock,
                FAQ, Features, Testimonials,
                HeroSlider, StatsBlock, TeamGrid, AccordionBlock, GalleryBlock,
                LogoCloud, MapBlock, VideoBlock, CTASection, TimelineBlock,
                NewsletterSignup, ProductGrid,
              ],
              required: true,
              localized: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Content',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    slugField({ localized: true }),
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
