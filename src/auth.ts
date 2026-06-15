import { createContext, useContext } from 'react'

/** The unlocked session password, provided once the gate is passed. */
export const PasswordContext = createContext<string>('')

export function usePassword(): string {
  return useContext(PasswordContext)
}
