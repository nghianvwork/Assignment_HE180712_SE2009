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
import AdminRooms from './pages/admin/AdminRooms'
import AdminServices from './pages/admin/AdminServices'
import AdminBookings from './pages/admin/AdminBookings'

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

      {/* Khu vực quản trị — chỉ admin */}
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
        <Route path="rooms" element={<AdminRooms />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="bookings" element={<AdminBookings />} />
      </Route>

      <Route
        path="/manager"
        element={
          <ProtectedRoute roles={['manager']}>
            <Placeholder title="Trang quản lý (Manager)" />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Placeholder title="404 - Không tìm thấy trang" />} />
    </Routes>
  )
}

export default App
