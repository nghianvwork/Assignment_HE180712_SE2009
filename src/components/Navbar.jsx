import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Khách sạn', href: '/hotels' },
  { label: 'Khám phá', href: '#beyond' },
  { label: 'Cảm nhận ', href: '#narrative' },
]

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const dashboardPath =
    user?.role === 'admin' ? '/admin' : user?.role === 'manager' ? '/manager' : null

  return (
    <header className={`lux-nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="lux-nav-inner">
        <Link to="/" className="lux-nav-logo">
          Hotel Luxury
        </Link>

        <nav className={`lux-nav-links ${menuOpen ? 'is-open' : ''}`}>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="lux-nav-actions">
          {isAuthenticated ? (
            <div className="lux-nav-user">
              <span className="lux-nav-hello">Xin chào, {user.fullName.split(' ').pop()}</span>
              {dashboardPath ? (
                <Link to={dashboardPath} className="lux-nav-btn ghost">
                  Quản lý
                </Link>
              ) : (
                <Link to="/account/bookings" className="lux-nav-btn ghost">
                  Đặt phòng của tôi
                </Link>
              )}
              <button className="lux-nav-btn" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="lux-nav-btn ghost">
                Đăng nhập
              </Link>
              <Link to="/register" className="lux-nav-btn">
                Đặt phòng ngay
              </Link>
            </>
          )}
          <button
            className="lux-nav-burger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Mở menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  )
}
