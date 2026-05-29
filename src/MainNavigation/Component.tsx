import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import { MainMenuClient } from './Component.client'

export async function MainMenu() {
  const data = await getCachedGlobal('main-navigation', 2)()

  return <MainMenuClient data={data} />
}
