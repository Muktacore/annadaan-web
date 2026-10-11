import { useEffect, useState } from "react"
import {
  subscribeToMyClaims,
  subscribeToDonationClaims,
  subscribeToClaim,
} from "@/lib/claims"

// Claims the signed-in user made as a recipient.
export function useMyClaims(uid) {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    return subscribeToMyClaims(
      uid,
      (list) => { setClaims(list); setLoading(false) },
      (err) => { console.error("My claims listener failed:", err); setLoading(false) }
    )
  }, [uid])

  return { claims, loading }
}

// Incoming claims on one donation (donor view).
export function useDonationClaims(donorId, donationId) {
  const [claims, setClaims] = useState([])

  useEffect(() => {
    if (!donorId || !donationId) return
    return subscribeToDonationClaims(
      donorId,
      donationId,
      setClaims,
      (err) => console.error("Donation claims listener failed:", err)
    )
  }, [donorId, donationId])

  return { claims: donorId && donationId ? claims : [] }
}

// One claim by id. claim is null if it does not exist or you cannot read it.
export function useClaim(id) {
  const [claim, setClaim] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    return subscribeToClaim(id, (c) => { setClaim(c); setLoading(false) })
  }, [id])

  return { claim, loading }
}
