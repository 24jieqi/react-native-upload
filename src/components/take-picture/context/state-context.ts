import { createContext } from 'react'
import { WatermarkOperations } from '../../../utils'
import { PrintWaterMarkFn } from '../../../interface'

export type StateType = 'photograph' | 'picture'

export const StateContext = createContext<{
  state?: StateType
  setState?: React.Dispatch<React.SetStateAction<StateType>>
  watermark?: WatermarkOperations
  shouldPrintWatermark?: boolean | PrintWaterMarkFn
}>({
  state: 'photograph',
})
