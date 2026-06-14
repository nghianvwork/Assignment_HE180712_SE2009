import { useEffect, useState } from 'react'
import { Table, Form, Button } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { getBookings, updateBooking } from '../../services/bookingService'
import { getUsers } from '../../services/userService'
import { getRooms } from '../../services/roomService'
import { formatVND } from '../../utils/format'
import { BOOKING_STATUS, REFUND_STATUS } from '../../utils/bookingStatus'
import ConfirmModal from '../../components/ConfirmModal'
import { useOwnedHotels } from './useOwnedHotels'

/** Đặt phòng của khách sạn manager sở hữu: vòng đời booking + xử lý hoàn tiền */
export default function ManagerBookings() {
  const { hotels, hotelIds, loading } = useOwnedHotels()
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])
  const [rooms, setRooms] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
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
  const roomById = Object.fromEntries(rooms.map((r) => [r.id, r]))

  const patch = async (booking, data, successMsg) => {
    try {
      await updateBooking(booking.id, data)
      toast.success(successMsg)
      reload()
    } catch {
      toast.error('Cập nhật thất bại')
    }
  }

  const handleCancel = async () => {
    await patch(cancelling, { status: 'cancelled' }, 'Đã hủy đặt phòng')
    setCancelling(null)
  }

  // Lọc theo trạng thái + khoảng ngày nhận phòng (checkIn)
  const filtered = bookings.filter((b) => {
    if (statusFilter && b.status !== statusFilter) return false
    if (fromDate && b.checkIn < fromDate) return false
    if (toDate && b.checkIn > toDate) return false
    return true
  })
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  return (
    <>
      <div className="admin-head">
        <h1 className="admin-title">
          Đặt phòng
          <small>{bookings.length} lượt đặt — duyệt, nhận/trả phòng, hoàn tiền</small>
        </h1>
      </div>

      <div className="admin-filters">
        <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Mọi trạng thái</option>
          {Object.entries(BOOKING_STATUS).map(([key, s]) => (
            <option key={key} value={key}>
              {s.label}
            </option>
          ))}
        </Form.Select>
        <Form.Control
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          title="Nhận phòng từ ngày"
        />
        <Form.Control
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          title="Nhận phòng đến ngày"
        />
      </div>

      <div className="admin-card">
        <Table className="admin-table" responsive>
          <thead>
            <tr>
              <th>Phòng</th>
              <th>Khách hàng</th>
              <th>Nhận / Trả phòng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((b) => {
              const badge = BOOKING_STATUS[b.status] || BOOKING_STATUS.pending
              const guest = userById[b.userId]
              const refund = REFUND_STATUS[b.refundStatus]
              const refundPending = b.cancelRequest && b.refundStatus === 'requested'
              return (
                <tr key={b.id}>
                  <td>
                    <strong>{roomById[b.roomId]?.name || '—'}</strong>
                    <div className="text-muted small">{roomById[b.roomId]?.type}</div>
                  </td>
                  <td>
                    <strong>{guest?.fullName || '—'}</strong>
                    <div className="text-muted small">{guest?.phone || guest?.email}</div>
                  </td>
                  <td>
                    {b.checkIn} → {b.checkOut}
                    <div className="text-muted small">{b.nights} đêm · {b.guests} khách</div>
                  </td>
                  <td>{formatVND(b.totalPrice)}</td>
                  <td>
                    <span className={`badge-soft ${badge.cls}`}>{badge.label}</span>
                    {refund && (
                      <div className="mt-1">
                        <span className={`badge-soft ${refund.cls}`}>{refund.label}</span>
                      </div>
                    )}
                  </td>
                  <td className="text-end">
                    {refundPending ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline-success"
                          className="me-2"
                          onClick={() =>
                            patch(
                              b,
                              { status: 'cancelled', refundStatus: 'refunded' },
                              'Đã hoàn tiền & hủy đặt phòng'
                            )
                          }
                        >
                          Duyệt hoàn tiền
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() =>
                            patch(b, { refundStatus: 'denied' }, 'Đã từ chối hoàn tiền')
                          }
                        >
                          Từ chối hoàn
                        </Button>
                      </>
                    ) : (
                      <>
                        {b.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline-success"
                              className="me-2"
                              onClick={() =>
                                patch(b, { status: 'confirmed' }, 'Đã xác nhận đặt phòng')
                              }
                            >
                              Xác nhận
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() =>
                                patch(b, { status: 'rejected' }, 'Đã từ chối đặt phòng')
                              }
                            >
                              Từ chối
                            </Button>
                          </>
                        )}
                        {b.status === 'confirmed' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="me-2"
                              onClick={() =>
                                patch(b, { status: 'checked_in' }, 'Đã nhận phòng')
                              }
                            >
                              Check-in
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => setCancelling(b)}
                            >
                              Hủy
                            </Button>
                          </>
                        )}
                        {b.status === 'checked_in' && (
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() =>
                              patch(b, { status: 'checked_out' }, 'Đã trả phòng')
                            }
                          >
                            Check-out
                          </Button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              )
            })}
            {!sorted.length && (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
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
        message={`Hủy đặt phòng của khách "${
          userById[cancelling?.userId]?.fullName || ''
        }" — phòng ${roomById[cancelling?.roomId]?.name || ''}?`}
        confirmLabel="Hủy đặt phòng"
        onConfirm={handleCancel}
        onHide={() => setCancelling(null)}
      />
    </>
  )
}
