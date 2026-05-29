import React from 'react'
import { Media } from '@/components/Media'
import type { FeaturesBlock as FeaturesBlockProps } from '@/payload-types'

export const FeaturesBlock: React.FC<FeaturesBlockProps> = ({ heading, items }) => {
  return (
    <section data-section="features" className="py-16 md:py-24 bg-white">
      <div className="container max-w-6xl mx-auto">
        {heading && (
          <h2 className="text-center text-3xl md:text-4xl font-semibold tracking-tight text-black mb-12">
            {heading}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {(items || []).map((item, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="flex items-start gap-4">
                {typeof item.icon === 'object' && item.icon && (
                  <Media
                    resource={item.icon}
                    imgClassName="w-14 h-14 md:w-16 md:h-16 object-contain shrink-0"
                  />
                )}
                <h3 className="text-lg md:text-xl font-semibold text-black leading-tight pt-2">
                  {item.title}
                </h3>
              </div>
              <p className="text-sm md:text-base text-[#3F4848] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
