import { createContext, useContext } from 'react'
import { type Gender, gendered } from '../engine/gender'

/** The wording the student chose on the intro page; neutral until then. */
export const GenderContext = createContext<Gender>('n')

/** Returns a function that renders a text in the student's chosen wording. */
export function useG() {
  const gender = useContext(GenderContext)
  return (text: string) => gendered(text, gender)
}
