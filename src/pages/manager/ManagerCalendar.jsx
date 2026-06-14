import { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { getRooms } from '../../services/roomService'
import { getBookings } from '../../services/bookingService'
import { getUsers } from '../../services/userService'
import AvailabilityCalendar from '../../components/AvailabilityCalendar'
import { useOwnedHotels } from './useOwnedHotels'

// Trạng thái booking chiếm phòng (không tính từ chối / đã hủy)
const BLOCKING = ['pending', 'confirmed', 'checked_in', 'checked_out']
const pad = (n) => String(n).padStart(2, '0')

/** Lịch trống: xem tình trạng đặt phòng theo ngày của từng phòng */
export default function ManagerCalendar() {
  const { hotels, hotelIds, loading } = useOwnedHotels()
  const [rooms, setRooms] = useState([])
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])
  const [roomId, setRoomId] = useState('')
  const now = new Date()
  const [ym, setYm] = useState({ year: now.getFullYear(), month: now.getMonth() })

  useEffect(() => {
    if (loading) return
    const ids = new Set(hotelIds)
    getRooms()
      .then((all) => {
        const mine = all.filter((r) => ids.has(r.hotelId))
        setRooms(mine)
        setRoomId((prev) => prev || mine[0]?.id || '')
      })
      .catch(() => {})
    getBookings()
      .then((all) => setBookings(all.filter((b) => ids.has(b.hotelId))))
      .catch(() => toast.error('Không tải được dữ liệu lịch'))
    getUsers().then(setUsers).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hotels])

  const userById = Object.fromEntries(users.map((u) => [u.id, u]))
  const hotelById = Object.fromEntries(hotels.map((h) => [h.id, h]))

  // Map ngày đã đặt -> tên khách (đêm checkout để trống cho lượt nhận phòng mới)
  const days = {}
  bookings
    .filter((b) => b.roomId === roomId && BLOCKING.includes(b.status))
    .forEach((b) => {
      const cursor = new Date(`${b.checkIn}T00:00:00`)
      const end = new Date(`${b.checkOut}T00:00:00`)
      while (cursor < end) {
        const ds = `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${pad(cursor.getDate())}`
        days[ds] = userById[b.userId]?.fullName?.split(' ').pop() || 'Đã đặt'
        cursor.setDate(cursor.getDate() + 1)
      }
    })

  // Số đêm đã đặt trong tháng đang xem
  const monthPrefix = `${ym.year}-${pad(ym.month + 1)}-`
  const bookedNights = Object.keys(days).filter((d) => d.startsWith(monthPrefix)).length

  const prev = () =>
    setYm((s) => (s.month === 0 ? { year: s.year - 1, month: 11 } : { ...s, month: s.month - 1 }))
  const next = () =>
    setYm((s) => (s.month === 11 ? { year: s.year + 1, month: 0 } : { ...s, month: s.month + 1 }))

  const room = rooms.find((r) => r.id === roomId)

  return (
    <>
      <div className="admin-head">
        <h1 className="admin-title">
          Lịch trống
          <small>Tình trạng đặt phòng theo ngày — {bookedNights} đêm đã đặt trong tháng</small>
        </h1>
      </div>

      <div className="admin-filters">
        <Form.Select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
          {!rooms.length && <option value="">Chưa có phòng</option>}
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} — {hotelById[r.hotelId]?.name}
            </option>
          ))}
        </Form.Select>
      </div>

      <div className="admin-card p-4">
        {room ? (
          <AvailabilityCalendar
            year={ym.year}
            month={ym.month}
            days={days}
            onPrev={prev}
            onNext={next}
          />
        ) : (
          <div className="text-center text-muted py-4">
            Chưa có phòng nào để xem lịch.
          </div>
        )}
      </div>
    </>
  )
}
