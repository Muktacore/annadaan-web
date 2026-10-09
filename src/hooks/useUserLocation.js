import { useEffect, useState } from "react"

const FALLBACK = { lat: 19.3919, lng: 72.8397, approx: true }

// Returns the user's location, or a default point until/unless the device shares it.
export function useUserLocation() {
  const [loc, setLoc] = useState(FALLBACK)

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude, approx: false }),
      () => {},
      { timeout: 8000 }
    )
  }, [])

  return loc
}
