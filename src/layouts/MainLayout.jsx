import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

// focus = pages that hide the bottom nav on mobile (donate, detail, history).
// On laptop the sidebar is always there.
export default function MainLayout({ focus = false }) {
  return (
    <div className="min-h-dvh md:flex">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-6xl flex-1 md:px-6 lg:px-8">
          <Outlet />
        </main>
        {!focus && <BottomNav />}
      </div>
    </div>
  );
}
