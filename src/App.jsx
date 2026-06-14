import { Routes, Route } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminHotels from './pages/admin/AdminHotels'
import ManagerLayout from './pages/manager/ManagerLayout'
import ManagerDashboard from './pages/manager/ManagerDashboard'
import ManagerHotels from './pages/manager/ManagerHotels'
import ManagerRooms from './pages/manager/ManagerRooms'
import ManagerCalendar from './pages/manager/ManagerCalendar'
import ManagerServices from './pages/manager/ManagerServices'
import ManagerPricing from './pages/manager/ManagerPricing'
import ManagerVouchers from './pages/manager/ManagerVouchers'
import ManagerBookings from './pages/manager/ManagerBookings'
import ManagerRevenue from './pages/manager/ManagerRevenue'
import ManagerReviews from './pages/manager/ManagerReviews'

// Trang tạm cho các khu vực sẽ làm sau
function Placeholder({ title }) {
  return (
    <Container className="py-5 text-center">
      <h2>{title}</h2>
      <p className="text-muted">Khu vực này đang được phát triển.</p>
    </Container>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Khu vực quản trị — admin chỉ quản lý tài khoản & khách sạn */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="hotels" element={<AdminHotels />} />
      </Route>

      {/* Khu quản lý — manager quản lý phòng, dịch vụ, booking, doanh thu của hotel mình */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute roles={['manager']}>
            <ManagerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ManagerDashboard />} />
        <Route path="hotels" element={<ManagerHotels />} />
        <Route path="rooms" element={<ManagerRooms />} />
        <Route path="calendar" element={<ManagerCalendar />} />
        <Route path="services" element={<ManagerServices />} />
        <Route path="pricing" element={<ManagerPricing />} />
        <Route path="vouchers" element={<ManagerVouchers />} />
        <Route path="bookings" element={<ManagerBookings />} />
        <Route path="revenue" element={<ManagerRevenue />} />
        <Route path="reviews" element={<ManagerReviews />} />
      </Route>

      <Route path="*" element={<Placeholder title="404 - Không tìm thấy trang" />} />
    </Routes>
  )
}

export default App
