import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

// Mevcut 8 block (template inheriti — full styled)
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FAQBlock } from '@/blocks/FAQBlock/Component'
import { FeaturesBlock } from '@/blocks/FeaturesBlock/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { TestimonialsBlock } from '@/blocks/TestimonialsBlock/Component'

// 12 yeni block (semi-styled — yapı + işleyiş var, stil yok)
import { HeroSliderBlock } from '@/blocks/HeroSlider/Component'
import { StatsBlock } from '@/blocks/StatsBlock/Component'
import { TeamGridBlock } from '@/blocks/TeamGrid/Component'
import { AccordionBlock } from '@/blocks/AccordionBlock/Component'
import { GalleryBlock } from '@/blocks/GalleryBlock/Component'
import { LogoCloudBlock } from '@/blocks/LogoCloud/Component'
import { MapBlock } from '@/blocks/MapBlock/Component'
import { VideoBlock } from '@/blocks/VideoBlock/Component'
import { CTASectionBlock } from '@/blocks/CTASection/Component'
import { TimelineBlock } from '@/blocks/TimelineBlock/Component'
import { NewsletterSignupBlock } from '@/blocks/NewsletterSignup/Component'
import { ProductGridBlock } from '@/blocks/ProductGrid/Component'

const blockComponents = {
  // Mevcut
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  faq: FAQBlock,
  features: FeaturesBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  testimonials: TestimonialsBlock,
  // Yeni
  heroSlider: HeroSliderBlock,
  stats: StatsBlock,
  teamGrid: TeamGridBlock,
  accordion: AccordionBlock,
  gallery: GalleryBlock,
  logoCloud: LogoCloudBlock,
  map: MapBlock,
  video: VideoBlock,
  ctaSection: CTASectionBlock,
  timeline: TimelineBlock,
  newsletterSignup: NewsletterSignupBlock,
  productGrid: ProductGridBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType as keyof typeof blockComponents]

            if (Block) {
              return (
                <div className="my-16" key={index}>
                  {/* @ts-expect-error props mismatch between block variants */}
                  <Block {...block} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
