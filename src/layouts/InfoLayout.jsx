import MainLayout from "@/layouts/MainLayout"
import PublicInfoShell from "@/layouts/PublicInfoShell"
import { useAuth } from "@/context/AuthContext"

// About / Help / Terms / Privacy / Contact are readable by everyone.
// Signed-in people keep the sidebar + bottom nav; visitors (e.g. from the
// login screen) get a light header instead.
export default function InfoLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background text-muted-foreground">
        Loading...
      </div>
    )
  }

  return user ? <MainLayout /> : <PublicInfoShell />
}
