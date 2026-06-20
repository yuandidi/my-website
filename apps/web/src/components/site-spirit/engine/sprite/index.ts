export {
  createInitialAnimationState,
  createSpriteAnimationSystem,
  getCompletedLoopCount,
  getFrameDurationMs,
  isAtLoopCycleStart,
  isOneShotAnimationComplete,
} from './sprite-animation-system'
export type { SpriteAnimationState } from './sprite-animation-system'
export { getSpriteDisplayWidth, getStridePerFrame } from './sprite-metrics'
export {
  getSpriteRenderCache,
  SpriteRenderCache,
} from './sprite-render-cache'
export { getSpriteSourceRect, paintSpriteFrame } from './sprite-canvas-renderer'
export type { SpriteSourceRect } from './sprite-canvas-renderer'
