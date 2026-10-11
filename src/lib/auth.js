import { Capacitor } from "@capacitor/core"
import { SocialLogin } from "@capgo/capacitor-social-login"
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

// Native app: native Google Sign-In via @capgo/capacitor-social-login, then hand
// the ID token to Firebase manually. Avoids both the broken Android Credential
// Manager path AND signInWithRedirect's storage-partitioning failure in a
// Capacitor WebView. Browser (laptop demo): normal popup, unaffected.
export async function signInWithGoogle() {
  if (Capacitor.isNativePlatform()) {
    const result = await SocialLogin.login({
      provider: "google",
      options: {},
    })
    const idToken = result.result.idToken
    const credential = GoogleAuthProvider.credential(idToken)
    return signInWithCredential(auth, credential)
  }
  const provider = new GoogleAuthProvider()
  return signInWithPopup(auth, provider)
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