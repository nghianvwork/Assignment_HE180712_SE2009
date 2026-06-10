import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Admin.css'

const MENU = [
  { to: '/admin', label: 'Tổng quan', icon: '▦', end: true },
  { to: '/admin/users', label: 'Tài khoản', icon: '👤' },
  { to: '/admin/hotels', label: 'Khách sạn', icon: '🏨' },
  { to: '/admin/rooms', label: 'Phòng', icon: '🛏' },
  { to: '/admin/services', label: 'Dịch vụ', icon: '🛎' },
  { to: '/admin/bookings', label: 'Đặt phòng', icon: '📑' },
]

/** Khung trang quản trị: sidebar điều hướng + vùng nội dung (Outlet) */
export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand">
          Hotel Luxury
          <span>Quản trị hệ thống</span>
        </Link>

        <nav className="admin-menu">
          {MENU.map((m) => (
            <NavLink key={m.to} to={m.to} end={m.end}>
              <span className="admin-menu-icon">{m.icon}</span>
              {m.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-side-foot">
          <div className="admin-side-user">
            <strong>{user?.fullName}</strong>
            <span>{user?.email}</span>
          </div>
          <div className="admin-side-actions">
            <Link to="/">Về trang chủ</Link>
            <button onClick={handleLogout}>Đăng xuất</button>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
