import { Routes, Route } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'

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

export default App
