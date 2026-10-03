import { Capacitor } from "@capacitor/core"
import { FirebaseAuthentication } from "@capacitor-firebase/authentication"
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signOut,
} from "firebase/auth"
import { auth } from "@/lib/firebase"

// Native app: Google's own sign-in sheet via the Capacitor plugin, then hand the ID token to the web SDK.
// Browser (laptop demo): normal popup sign-in. signInWithPopup is never used inside the native WebView.
export async function signInWithGoogle() {
  if (Capacitor.isNativePlatform()) {
    const result = await FirebaseAuthentication.signInWithGoogle()
    const idToken = result.credential?.idToken
    if (!idToken) throw new Error("Google sign-in returned no ID token")
    return signInWithCredential(auth, GoogleAuthProvider.credential(idToken))
  }
  return signInWithPopup(auth, new GoogleAuthProvider())
}

export async function logOut() {
  if (Capacitor.isNativePlatform()) {
    await FirebaseAuthentication.signOut()
  }
  await signOut(auth)
}
