import { useEffect, useState } from "react"
import { subscribeToAvailableDonations, subscribeToDonation } from "@/lib/donations"

export function useAvailableDonations() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    return subscribeToAvailableDonations(
      (list) => { setDonations(list); setLoading(false) },
      (err) => { console.error("Donations listener failed:", err); setError(err); setLoading(false) }
    )
  }, [])

  return { donations, loading, error }
}

export function useDonation(id) {
  const [donation, setDonation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    return subscribeToDonation(
      id,
      (d) => { setDonation(d); setLoading(false) },
      (err) => { console.error("Donation listener failed:", err); setError(err); setLoading(false) }
    )
  }, [id])

  return { donation, loading, error }
}
