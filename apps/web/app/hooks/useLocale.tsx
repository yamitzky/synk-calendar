import { createContext, useContext } from 'react'

export const LocaleContext = createContext<string | undefined>(undefined)

export default function useLocale() {
  return useContext(LocaleContext)
}
