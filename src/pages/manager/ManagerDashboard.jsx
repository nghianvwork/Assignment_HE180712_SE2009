import { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { getRooms } from '../../services/roomService'
import { getServices } from '../../services/serviceService'
import { getBookings } from '../../services/bookingService'
import { getUsers } from '../../services/userService'
import { formatVND } from '../../utils/format'
import { totalRevenue } from '../../utils/revenueStats'
import { useOwnedHotels } from './useOwnedHotels'

const STATUS_BADGE = {
  pending: { cls: 'amber', label: 'Chờ duyệt' },
  confirmed: { cls: 'green', label: 'Đã xác nhận' },
  cancelled: { cls: 'red', label: 'Đã hủy' },
}

/** Tổng quan khu quản lý: số liệu khách sạn của manager + booking gần đây */
export default function ManagerDashboard() {
  const { hotels, hotelIds, loading } = useOwnedHotels()
  const [rooms, setRooms] = useState([])
  const [services, setServices] = useState([])
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (loading) return
    const ids = new Set(hotelIds)
    Promise.all([getRooms(), getServices(), getBookings(), getUsers()])
      .then(([r, s, b, u]) => {
        setRooms(r.filter((x) => ids.has(x.hotelId)))
        setServices(s.filter((x) => ids.has(x.hotelId)))
        setBookings(b.filter((x) => ids.has(x.hotelId)))
        setUsers(u)
      })
      .catch(() => toast.error('Không tải được dữ liệu khu quản lý'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hotels])

  const userById = Object.fromEntries(users.map((u) => [u.id, u]))
  const hotelById = Object.fromEntries(hotels.map((h) => [h.id, h]))
  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const recent = [...bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const stats = [
    { label: 'Khách sạn của tôi', value: hotels.length },
    { label: 'Phòng', value: rooms.length, sub: `${rooms.filter((r) => r.available).length} còn trống` },
    { label: 'Dịch vụ', value: services.length },
    { label: 'Đặt phòng', value: bookings.length, sub: `${pendingCount} chờ duyệt` },
    { label: 'Doanh thu (đã xác nhận)', value: formatVND(totalRevenue(bookings)) },
  ]

  return (
    <>
      <div className="admin-head">
        <h1 className="admin-title">
          Tổng quan
          <small>Hoạt động khách sạn bạn đang quản lý</small>
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
