import { Outlet } from "react-router-dom"

export default function AppShell() {
  return (
    <div className="min-h-dvh bg-background">
      <Outlet />
    </div>
  )
}
