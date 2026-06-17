import { Routes, Route } from 'react-router-dom'
import LandingPage    from './pages/LandingPage'
import SolutionsPage  from './pages/SolutionsPage'
import PricingPage    from './pages/PricingPage'
import AdminDashboard from './pages/AdminDashboard'
import GovLogin       from './pages/GovLogin'
// import GovDashboard from './pages/GovDashboard'
import GovDashboard from './pages/dashboard/GovDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import FarmerOrder from './pages/FarmerOrder'
import SoilAcademy from './pages/SoilAcademy'
import ContactPage from './pages/ContactPage'

function App() {
  return (
    <Routes>
      <Route path="/"             element={<LandingPage />} />
      <Route path="/solutions"    element={<SolutionsPage />} />
      <Route path="/pricing"      element={<PricingPage />} />
      <Route path="/admin"        element={<AdminDashboard />} />
      <Route path="/gov/login"    element={<GovLogin />} />
      <Route path="/farmer" element={<FarmerOrder />} />
      <Route path="/academy" element={<SoilAcademy />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/gov/dashboard" element={
        <ProtectedRoute requiredRole="institution">
          <GovDashboard />
        </ProtectedRoute>
        
      } />
    </Routes>
  )
}

export default App