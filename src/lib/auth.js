import { Capacitor } from "@capacitor/core"
import { FirebaseAuthentication } from "@capacitor-firebase/authentication"
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
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

export function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signUpWithEmail(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  if (name) await updateProfile(cred.user, { displayName: name })
  return cred
}

export async function logOut() {
  if (Capacitor.isNativePlatform()) {
    await FirebaseAuthentication.signOut()
  }
  await signOut(auth)
}

const ERROR_MESSAGES = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "No account found with that email.",
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/email-already-in-use": "An account with this email already exists. Try logging in.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/cancelled-popup-request": "Sign-in was cancelled.",
  "auth/network-request-failed": "Network problem. Check your connection and try again.",
  "auth/operation-not-allowed": "This sign-in method isn't enabled in Firebase yet.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
}

export function friendlyAuthError(err) {
  const known = ERROR_MESSAGES[err?.code]
  if (known) return known
  const message = err?.message || ""
  if (/cancel/i.test(message)) return "Sign-in was cancelled."
  return message ? `Sign-in failed: ${message}` : "Sign-in failed. Please try again."
}
