import { createContext } from 'react'

import type { PrintWaterMarkFn } from '../../../interface'
import type { WatermarkOperations } from '../../../utils'

export type StateType = 'photograph' | 'picture'

export const StateContext = createContext<{
  state?: StateType
  setState?: React.Dispatch<React.SetStateAction<StateType>>
  watermark?: WatermarkOperations
  shouldPrintWatermark?: boolean | PrintWaterMarkFn
}>({
  state: 'photograph',
})
