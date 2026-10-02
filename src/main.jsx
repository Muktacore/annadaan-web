import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { HashRouter } from "react-router-dom"
import "./index.css"
import App from "./App.jsx"

if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark")
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
)