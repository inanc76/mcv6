import React from 'react'
import { Media } from '@/components/Media'
import type { TestimonialsBlock as TestimonialsBlockProps } from '@/payload-types'

export const TestimonialsBlock: React.FC<TestimonialsBlockProps> = ({ heading, items }) => {
  return (
    <section data-section="testimonials" className="py-16 md:py-24 bg-[#DAE7E9]">
      <div className="container max-w-6xl mx-auto">
        {heading && (
          <h2 className="text-center text-3xl md:text-4xl font-semibold tracking-tight text-black mb-12 max-w-2xl mx-auto">
            {heading}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {(items || []).map((t, i) => (
            <div key={i} className="flex flex-col gap-5">
              <div className="flex gap-1 text-[#7FD4D4] text-lg">
                {Array.from({ length: t.rating || 5 }).map((_, j) => (
                  <span key={j}>★</span>
                ))}
              </div>
              <p className="text-sm md:text-base text-[#3F4848] leading-relaxed">{t.quote}</p>
              <div className="flex items-center gap-3 mt-2">
                {typeof t.avatar === 'object' && t.avatar && (
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                    <Media resource={t.avatar} imgClassName="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-black">{t.name}</p>
                  {t.title && <p className="text-xs text-[#6B7373]">{t.title}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
