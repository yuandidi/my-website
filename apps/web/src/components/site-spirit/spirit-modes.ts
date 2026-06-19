import { SPIRIT_STATE_SHEETS } from './generated/sprite-sheets.generated'

export type SpiritSheetId = keyof typeof SPIRIT_STATE_SHEETS

/** 逻辑状态：含不单独出图的 front-idle */
export type SpiritMode = SpiritSheetId | 'front-idle'

export const SPIRIT_SHEET_MODES = Object.keys(
  SPIRIT_STATE_SHEETS,
) as SpiritSheetId[]

export const SPIRIT_DEFAULT_MODE: SpiritMode = 'front-idle'
