'use client'
import React, { useState } from 'react'
import type { FAQBlock as FAQBlockProps } from '@/payload-types'

export const FAQBlock: React.FC<FAQBlockProps> = ({ heading, items }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  return (
    <section data-section="faq" className="py-16 md:py-24 bg-white">
      <div className="container max-w-3xl mx-auto">
        {heading && (
          <h2 className="text-center text-3xl md:text-4xl font-semibold tracking-tight text-black mb-10">
            {heading}
          </h2>
        )}
        <div className="flex flex-col">
          {(items || []).map((item, i) => {
            const isOpen = openIdx === i
            return (
              <div key={i} className="border-b border-black/10 last:border-b-0">
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-base md:text-lg font-medium text-black">
                    {item.question}
                  </span>
                  <span
                    className={[
                      'text-xl text-black transition-transform shrink-0',
                      isOpen ? 'rotate-180' : '',
                    ].join(' ')}
                    aria-hidden="true"
                  >
                    ⌄
                  </span>
                </button>
                {isOpen && (
                  <div className="pb-5 text-sm md:text-base text-[#3F4848] leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
