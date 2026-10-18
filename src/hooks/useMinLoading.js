import { useEffect, useState } from "react"

// Keeps a loading flag true for at least `minMs` after the component mounts, so
// skeletons never flash for a few frames when the data arrives almost instantly
// (fast network, or Firestore answering from its local cache).
export function useMinLoading(loading, minMs = 350) {
  const [waiting, setWaiting] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setWaiting(false), minMs)
    return () => clearTimeout(timer)
  }, [minMs])

  return loading || waiting
}
