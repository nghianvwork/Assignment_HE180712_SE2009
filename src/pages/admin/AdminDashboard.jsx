import { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { getUsers } from '../../services/userService'
import { getHotels } from '../../services/hotelService'
import { getRooms } from '../../services/roomService'
import { getServices } from '../../services/serviceService'
import { getBookings } from '../../services/bookingService'
import { formatVND } from '../../utils/format'

const STATUS_BADGE = {
  pending: { cls: 'amber', label: 'Chờ duyệt' },
  confirmed: { cls: 'green', label: 'Đã xác nhận' },
  cancelled: { cls: 'red', label: 'Đã hủy' },
}

/** Tổng quan hệ thống: số liệu + 5 booking mới nhất */
export default function AdminDashboard() {
  const [data, setData] = useState({
    users: [],
    hotels: [],
    rooms: [],
    services: [],
    bookings: [],
  })

  useEffect(() => {
    let active = true
    Promise.all([getUsers(), getHotels(), getRooms(), getServices(), getBookings()])
      .then(([users, hotels, rooms, services, bookings]) => {
        if (active) setData({ users, hotels, rooms, services, bookings })
      })
      .catch(() => toast.error('Không tải được dữ liệu hệ thống'))
    return () => {
      active = false
    }
  }, [])

  const { users, hotels, rooms, services, bookings } = data
  const revenue = bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  const pendingCount = bookings.filter((b) => b.status === 'pending').length

  const userById = Object.fromEntries(users.map((u) => [u.id, u]))
  const hotelById = Object.fromEntries(hotels.map((h) => [h.id, h]))
  const recent = [...bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const stats = [
    { label: 'Người dùng', value: users.length, sub: `${users.filter((u) => u.role === 'manager').length} quản lý` },
    { label: 'Khách sạn', value: hotels.length, sub: `${hotels.filter((h) => h.status === 'active').length} đang hoạt động` },
    { label: 'Phòng', value: rooms.length, sub: `${rooms.filter((r) => r.available).length} còn trống` },
    { label: 'Dịch vụ', value: services.length },
    { label: 'Đặt phòng', value: bookings.length, sub: `${pendingCount} chờ duyệt` },
    { label: 'Doanh thu (đã xác nhận)', value: formatVND(revenue) },
  ]

  return (
    <>
      <div className="admin-head">
        <h1 className="admin-title">
          Tổng quan
          <small>Toàn cảnh hoạt động của hệ thống Hotel Luxury</small>
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

      <h2 className="admin-section-title">Đặt phòng gần đây</h2>
      <div className="admin-card">
        <Table className="admin-table" responsive>
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Khách sạn</th>
              <th>Nhận / Trả phòng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((b) => {
              const badge = STATUS_BADGE[b.status] || STATUS_BADGE.pending
              return (
                <tr key={b.id}>
                  <td>{userById[b.userId]?.fullName || '—'}</td>
                  <td>{hotelById[b.hotelId]?.name || '—'}</td>
                  <td>
                    {b.checkIn} → {b.checkOut}
                  </td>
                  <td>{formatVND(b.totalPrice)}</td>
                  <td>
                    <span className={`badge-soft ${badge.cls}`}>{badge.label}</span>
                  </td>
                </tr>
              )
            })}
            {!recent.length && (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  Chưa có đặt phòng nào.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </>
  )
}
