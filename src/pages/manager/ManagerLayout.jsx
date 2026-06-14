import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../admin/Admin.css'

const MENU = [
  { to: '/manager', label: 'Tổng quan', icon: '▦', end: true },
  { to: '/manager/hotels', label: 'Khách sạn', icon: '🏨' },
  { to: '/manager/rooms', label: 'Phòng', icon: '🛏' },
  { to: '/manager/services', label: 'Dịch vụ', icon: '🛎' },
  { to: '/manager/pricing', label: 'Giá theo mùa', icon: '🏷' },
  { to: '/manager/vouchers', label: 'Khuyến mãi', icon: '🎟' },
  { to: '/manager/bookings', label: 'Đặt phòng', icon: '📑' },
  { to: '/manager/revenue', label: 'Báo cáo', icon: '📊' },
]

/** Khung khu quản lý khách sạn: sidebar điều hướng + vùng nội dung (Outlet) */
export default function ManagerLayout() {
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
          <span>Khu quản lý</span>
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
