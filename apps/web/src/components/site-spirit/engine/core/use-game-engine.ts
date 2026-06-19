'use client'

import { useEffect, useState } from 'react'
import { createRafLoop } from './raf-loop'
import type { GameEngine } from './types'

export function useGameEngine<TState>(engine: GameEngine<TState>): TState {
  const [state, setState] = useState(engine.getState())

  useEffect(() => {
    return engine.subscribe(setState)
  }, [engine])

  useEffect(() => {
    const loop = createRafLoop()
    loop.start((tick) => {
      engine.tick(tick)
    })
    return () => loop.stop()
  }, [engine])

  return state
}
