import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { HashRouter } from "react-router-dom"
import { SocialLogin } from "@capgo/capacitor-social-login"
import "./index.css"
import App from "./App.jsx"

if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark")
}

SocialLogin.initialize({
  google: {
    webClientId: import.meta.env.VITE_FIREBASE_WEB_CLIENT_ID,
  },
})

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
)