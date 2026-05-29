'use client'

import React from 'react'

import type { MainMenu as MainMenuType } from '@/payload-types'

import { CMSLink } from '@/components/Link'

export const MainMenuClient: React.FC<{ data: MainMenuType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="container border-t border-border py-3">
      <ul className="flex flex-wrap gap-x-6 gap-y-2 items-center">
        {navItems.map(({ link, subItems }, i) => (
          <li key={i} className="relative group">
            <CMSLink {...link} appearance="link" className="font-medium" />
            {subItems && subItems.length > 0 && (
              <div className="hidden group-hover:block absolute top-full left-0 z-50 min-w-56 bg-background border border-border rounded-md shadow-lg p-3 mt-1">
                <ul className="space-y-2">
                  {subItems.map(({ link: subLink, children }, j) => (
                    <li key={j}>
                      <CMSLink {...subLink} appearance="link" className="block py-1" />
                      {children && children.length > 0 && (
                        <ul className="pl-3 mt-1 space-y-1 border-l border-border">
                          {children.map(({ link: cLink }, k) => (
                            <li key={k}>
                              <CMSLink {...cLink} appearance="link" className="block py-0.5 text-sm text-muted-foreground" />
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
