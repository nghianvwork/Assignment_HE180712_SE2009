import { useEffect, useState } from 'react'
import { Table, Form, Button } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { getBookings, updateBooking } from '../../services/bookingService'
import { getUsers } from '../../services/userService'
import { getRooms } from '../../services/roomService'
import { formatVND } from '../../utils/format'
import ConfirmModal from '../../components/ConfirmModal'
import { useOwnedHotels } from './useOwnedHotels'

const STATUS = {
  pending: { cls: 'amber', label: 'Chờ duyệt' },
  confirmed: { cls: 'green', label: 'Đã xác nhận' },
  cancelled: { cls: 'red', label: 'Đã hủy' },
}

/** Đặt phòng của khách sạn manager sở hữu: xem khách theo từng phòng, duyệt / hủy */
export default function ManagerBookings() {
  const { hotels, hotelIds, loading } = useOwnedHotels()
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])
  const [rooms, setRooms] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [cancelling, setCancelling] = useState(null)

  const reload = () => {
    const ids = new Set(hotelIds)
    return getBookings()
      .then((all) => setBookings(all.filter((b) => ids.has(b.hotelId))))
      .catch(() => toast.error('Không tải được danh sách đặt phòng'))
  }

  useEffect(() => {
    if (loading) return
    reload()
    getUsers().then(setUsers).catch(() => {})
    getRooms().then(setRooms).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hotels])

  const userById = Object.fromEntries(users.map((u) => [u.id, u]))
  const hotelById = Object.fromEntries(hotels.map((h) => [h.id, h]))
  const roomById = Object.fromEntries(rooms.map((r) => [r.id, r]))

  const changeStatus = async (booking, status, successMsg) => {
    try {
      await updateBooking(booking.id, { status })
      toast.success(successMsg)
      reload()
    } catch {
      toast.error('Cập nhật trạng thái thất bại')
    }
  }

  const handleCancel = async () => {
    await changeStatus(cancelling, 'cancelled', `Đã hủy đặt phòng #${cancelling.id}`)
    setCancelling(null)
  }

  const filtered = statusFilter
    ? bookings.filter((b) => b.status === statusFilter)
    : bookings
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  return (
    <>
      <div className="admin-head">
        <h1 className="admin-title">
          Đặt phòng
          <small>{bookings.length} lượt đặt — khách theo từng phòng</small>
        </h1>
      </div>

      <div className="admin-filters">
        <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Mọi trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="cancelled">Đã hủy</option>
        </Form.Select>
      </div>

      <div className="admin-card">
        <Table className="admin-table" responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Phòng</th>
              <th>Khách hàng</th>
              <th>Khách sạn</th>
              <th>Nhận / Trả phòng</th>
              <th>Khách</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((b) => {
              const badge = STATUS[b.status] || STATUS.pending
              const guest = userById[b.userId]
              return (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>
                    <strong>{roomById[b.roomId]?.name || '—'}</strong>
                    <div className="text-muted small">{roomById[b.roomId]?.type}</div>
                  </td>
                  <td>
                    <strong>{guest?.fullName || '—'}</strong>
                    <div className="text-muted small">{guest?.phone || guest?.email}</div>
                  </td>
                  <td>{hotelById[b.hotelId]?.name || '—'}</td>
                  <td>
                    {b.checkIn} → {b.checkOut}
                    <div className="text-muted small">{b.nights} đêm</div>
                  </td>
                  <td>{b.guests}</td>
                  <td>{formatVND(b.totalPrice)}</td>
                  <td>
                    <span className={`badge-soft ${badge.cls}`}>{badge.label}</span>
                  </td>
                  <td className="text-end">
                    {b.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline-success"
                        className="me-2"
                        onClick={() =>
                          changeStatus(b, 'confirmed', `Đã xác nhận đặt phòng #${b.id}`)
                        }
                      >
                        Duyệt
                      </Button>
                    )}
                    {b.status !== 'cancelled' && (
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => setCancelling(b)}
                      >
                        Hủy
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
            {!sorted.length && (
              <tr>
                <td colSpan={9} className="text-center text-muted py-4">
                  Không có đặt phòng nào.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <ConfirmModal
        show={!!cancelling}
        title="Hủy đặt phòng"
        message={`Hủy đặt phòng #${cancelling?.id} của khách "${
          userById[cancelling?.userId]?.fullName || ''
        }"?`}
        confirmLabel="Hủy đặt phòng"
        onConfirm={handleCancel}
        onHide={() => setCancelling(null)}
      />
    </>
  )
}
