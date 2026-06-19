import type { SpiritMode } from '../../spirit-modes'
import { SPIRIT_DEFAULT_MODE } from '../../spirit-modes'

export const FRONT_IDLE_HOLD_MS = 3600

/** 从 front-idle 随机抽取的动作（不含 hub 本身） */
export const SPIRIT_ACTION_MODES = [
  'walk-right-staff',
  'cast-left',
  'walk-back',
  'knockdown',
  'walk-left',
] as const satisfies readonly SpiritMode[]

export type SpiritActionMode = (typeof SPIRIT_ACTION_MODES)[number]

export type AdvanceRule =
  | { type: 'hold'; ms: number }
  | { type: 'one-shot' }
  | { type: 'loops'; count: number }

export interface ActionNode {
  moveDirection?: 1 | -1
  advance: AdvanceRule
  /** 走到左右边后结束动作 */
  completeOnEdge?: 'left' | 'right'
}

export const HUB_STATE = {
  advance: { type: 'hold', ms: FRONT_IDLE_HOLD_MS },
} as const satisfies { advance: { type: 'hold'; ms: number } }

export const ACTION_STATES: Record<SpiritActionMode, ActionNode> = {
  'walk-right-staff': {
    moveDirection: 1,
    advance: { type: 'loops', count: Number.POSITIVE_INFINITY },
    completeOnEdge: 'right',
  },
  'cast-left': {
    advance: { type: 'one-shot' },
  },
  'walk-back': {
    advance: { type: 'loops', count: 2 },
  },
  knockdown: {
    advance: { type: 'one-shot' },
  },
  'walk-left': {
    moveDirection: -1,
    advance: { type: 'loops', count: Number.POSITIVE_INFINITY },
    completeOnEdge: 'left',
  },
}

export function pickRandomSpiritAction(
  random: () => number = Math.random,
): SpiritActionMode {
  const index = Math.floor(random() * SPIRIT_ACTION_MODES.length)
  return SPIRIT_ACTION_MODES[Math.min(index, SPIRIT_ACTION_MODES.length - 1)]!
}

export function isActionMode(mode: SpiritMode): mode is SpiritActionMode {
  return (SPIRIT_ACTION_MODES as readonly SpiritMode[]).includes(mode)
}

export function resolveNextMode(
  currentMode: SpiritMode,
  random: () => number,
): SpiritMode {
  if (currentMode === SPIRIT_DEFAULT_MODE) {
    return pickRandomSpiritAction(random)
  }
  return SPIRIT_DEFAULT_MODE
}
