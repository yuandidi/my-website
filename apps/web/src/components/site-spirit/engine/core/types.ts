/** RAF 每帧输入 */
export interface FrameTick {
  deltaMs: number
  elapsedMs: number
  timestamp: number
}

export interface GameSystem<TState> {
  update(state: TState, tick: FrameTick): TState
}

export interface GameEngine<TState> {
  getState(): TState
  tick(input: FrameTick): void
  subscribe(listener: (state: TState) => void): () => void
  reset(nextState: TState): void
}
