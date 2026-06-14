import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { getUsers } from '../../services/userService'
import { getHotels } from '../../services/hotelService'
import BarChart from '../../components/BarChart'

const ROLE_LABEL = { user: 'Khách hàng', manager: 'Quản lý', admin: 'Quản trị' }

/** Tổng quan hệ thống cho admin: số liệu + biểu đồ người dùng & khách sạn */
export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [hotels, setHotels] = useState([])

  useEffect(() => {
    let active = true
    Promise.all([getUsers(), getHotels()])
      .then(([u, h]) => {
        if (!active) return
        setUsers(u)
        setHotels(h)
      })
      .catch(() => toast.error('Không tải được dữ liệu hệ thống'))
    return () => {
      active = false
    }
  }, [])

  const managerCount = users.filter((u) => u.role === 'manager').length
  const activeHotels = hotels.filter((h) => h.status === 'active').length

  const stats = [
    { label: 'Người dùng', value: users.length, sub: `${users.filter((u) => u.role === 'user').length} khách hàng` },
    { label: 'Quản lý khách sạn', value: managerCount },
    { label: 'Khách sạn', value: hotels.length, sub: `${activeHotels} đang hoạt động` },
    { label: 'Tài khoản bị khóa', value: users.filter((u) => u.status === 'banned').length },
  ]

  // Biểu đồ người dùng theo vai trò
  const usersByRole = ['user', 'manager', 'admin'].map((role) => ({
    label: ROLE_LABEL[role],
    value: users.filter((u) => u.role === role).length,
  }))

  // Biểu đồ khách sạn theo thành phố
  const cityMap = {}
  hotels.forEach((h) => {
    const city = h.city || 'Khác'
    cityMap[city] = (cityMap[city] || 0) + 1
  })
  const hotelsByCity = Object.entries(cityMap).map(([label, value]) => ({ label, value }))

  return (
    <>
      <div className="admin-head">
        <h1 className="admin-title">
          Tổng quan
          <small>Quản trị người dùng &amp; khách sạn — Hotel Luxury</small>
        </h1>
      </div>

      <div className="stat-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            {s.sub && <div className="stat-sub">{s.sub}</div>}
          </div>
        ))}
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Người dùng theo vai trò</h3>
          <div className="chart-sub">Phân bố tài khoản trong hệ thống</div>
          <BarChart data={usersByRole} color="var(--c-gold, #9c7a4d)" />
        </div>
        <div className="chart-card">
          <h3>Khách sạn theo thành phố</h3>
          <div className="chart-sub">Số khách sạn tại mỗi thành phố</div>
          <BarChart data={hotelsByCity} color="var(--c-dark, #2b2b2b)" />
        </div>
      </div>
    </>
  )
}
