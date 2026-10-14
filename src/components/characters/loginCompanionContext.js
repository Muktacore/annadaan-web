import { createContext, useContext } from "react"

export const LoginCompanionContext = createContext(null)

const noop = () => {}
const fallback = {
  focus: null,
  typing: false,
  phase: "idle",
  pulse: 0,
  setFocus: noop,
  markTyping: noop,
  setPhase: noop,
}

export const useLoginCompanion = () => useContext(LoginCompanionContext) ?? fallback
