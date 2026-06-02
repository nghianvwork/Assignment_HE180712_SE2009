import { Container, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <Container className="py-5 text-center">
      <h1 className="mb-3">🏨 Hotel Booking</h1>
      {isAuthenticated ? (
        <>
          <p className="lead">
            Xin chào <strong>{user.fullName}</strong> ({user.role})
          </p>
          <Button variant="outline-danger" onClick={logout}>
            Đăng xuất
          </Button>
        </>
      ) : (
        <>
          <p className="lead text-muted">Trang chủ đang được phát triển...</p>
          <Button as={Link} to="/login" className="me-2">
            Đăng nhập
          </Button>
          <Button as={Link} to="/register" variant="outline-primary">
            Đăng ký
          </Button>
        </>
      )}
    </Container>
  )
}
