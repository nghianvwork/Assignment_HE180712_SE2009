import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ProtectedRoute from '../components/common/ProtectedRoute'
import { Container } from 'react-bootstrap'

// Placeholder cho các khu vực sẽ làm sau
function Placeholder({ title }) {
  return (
    <Container className="py-5 text-center">
      <h2>{title}</h2>
      <p className="text-muted">Khu vực này đang được phát triển.</p>
    </Container>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <Placeholder title="Trang quản trị (Admin)" />
          </ProtectedRoute>
        }
      />
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
