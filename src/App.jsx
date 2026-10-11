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

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />

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
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <MainLayout focus />
            </ProtectedRoute>
          }
        >
          <Route path="/donate" element={<AddDonation />} />
          <Route path="/donation/:id" element={<DonationDetail />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
