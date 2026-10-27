import { Routes, Route, Navigate } from "react-router-dom"
import AppShell from "@/layouts/AppShell"
import MainLayout from "@/layouts/MainLayout"
import ProtectedRoute from "@/components/ProtectedRoute"
import Splash from "@/pages/Splash"
import Login from "@/pages/Login"
import Home from "@/pages/Home"
import AddDonation from "@/pages/AddDonation"
import DonationDetail from "@/pages/DonationDetail"
import AvailableDonationsMap from "@/pages/AvailableDonationsMap"
import MyRequests, { RequestDetail } from "@/pages/MyRequests"
import DonationHistory from "@/pages/DonationHistory"
import Profile from "@/pages/Profile"
import InfoLayout from "@/layouts/InfoLayout"
import About from "@/pages/info/About"
import Help from "@/pages/info/Help"
import Contact from "@/pages/info/Contact"
import Terms from "@/pages/info/Terms"
import Privacy from "@/pages/info/Privacy"

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />

        {/* One layout for every signed-in page so the sidebar / nav stay mounted
            and can animate between routes. MainLayout works out the "focus"
            (hide bottom nav) pages from the URL. */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/map" element={<AvailableDonationsMap />} />
          <Route path="/requests" element={<MyRequests />} />
          <Route path="/requests/:id" element={<RequestDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<DonationHistory />} />
          <Route path="/donate" element={<AddDonation />} />
          <Route path="/donation/:id" element={<DonationDetail />} />
        </Route>

        {/* Public info pages: sidebar when signed in, light header when not */}
        <Route element={<InfoLayout />}>
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
