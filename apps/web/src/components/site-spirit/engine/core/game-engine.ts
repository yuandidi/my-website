import type { FrameTick, GameEngine, GameSystem } from './types'

export function createGameEngine<TState>(
  initialState: TState,
  systems: readonly GameSystem<TState>[],
): GameEngine<TState> {
  let state = initialState
  const listeners = new Set<(next: TState) => void>()

  function notify(): void {
    for (const listener of listeners) {
      listener(state)
    }
  }

  return {
    getState() {
      return state
    },
    tick(input: FrameTick) {
      let next = state
      for (const system of systems) {
        next = system.update(next, input)
      }
      if (next === state) return
      state = next
      notify()
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    reset(nextState) {
      state = nextState
      notify()
    },
  }
}
