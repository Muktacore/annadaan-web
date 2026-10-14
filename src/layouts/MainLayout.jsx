import { Outlet, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { pageEnter } from "@/lib/motion";

// focus = pages that hide the bottom nav on mobile (donate, detail, history).
// On laptop the sidebar is always there.
export default function MainLayout({ focus = false }) {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-6xl flex-1 md:px-6 lg:px-8">
          <motion.div key={pathname} {...pageEnter}>
            <Outlet />
          </motion.div>
        </main>
        {!focus && <BottomNav />}
      </div>
    </div>
  );
}
