import { createContext } from 'react'

export type StateType = 'photograph' | 'picture'

export const StateContext = createContext<{
  state?: StateType
  setState?: React.Dispatch<React.SetStateAction<StateType>>
}>({
  state: 'photograph',
})
