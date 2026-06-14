import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ReviewModal from '../components/ReviewModal'
import ConfirmModal from '../components/ConfirmModal'
import { useAuth } from '../context/AuthContext'
import { getBookings, updateBooking } from '../services/bookingService'
import { getHotels } from '../services/hotelService'
import { getRooms } from '../services/roomService'
import { getReviews } from '../services/reviewService'
import { formatVND } from '../utils/format'
import { BOOKING_STATUS, REFUND_STATUS } from '../utils/bookingStatus'
import './MyBookings.css'

/** Lịch sử đặt phòng của khách: xem trạng thái, hủy/hoàn tiền, đánh giá sau lưu trú */
export default function MyBookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [hotels, setHotels] = useState([])
  const [rooms, setRooms] = useState([])
  const [reviews, setReviews] = useState([])
  const [reviewing, setReviewing] = useState(null)
  const [cancelling, setCancelling] = useState(null)

  const reload = () =>
    getBookings({ userId: user.id })
      .then(setBookings)
      .catch(() => toast.error('Không tải được lịch sử đặt phòng'))

  useEffect(() => {
    if (!user?.id) return
    reload()
    getHotels().then(setHotels).catch(() => {})
    getRooms().then(setRooms).catch(() => {})
    getReviews({ userId: user.id }).then(setReviews).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const hotelById = Object.fromEntries(hotels.map((h) => [h.id, h]))
  const roomById = Object.fromEntries(rooms.map((r) => [r.id, r]))
  const reviewedIds = new Set(reviews.map((r) => r.bookingId))

  const cancel = async () => {
    try {
      await updateBooking(cancelling.id, { status: 'cancelled' })
      toast.success('Đã hủy đặt phòng')
      setCancelling(null)
      reload()
    } catch {
      toast.error('Hủy thất bại')
    }
  }

  const requestRefund = async (b) => {
    try {
      await updateBooking(b.id, { cancelRequest: true, refundStatus: 'requested' })
      toast.success('Đã gửi yêu cầu hủy & hoàn tiền, chờ khách sạn xử lý')
      reload()
    } catch {
      toast.error('Gửi yêu cầu thất bại')
    }
  }

  const sorted = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div className="mybk-page">
      <Navbar />

      <div className="mybk-wrap">
        <h1 className="mybk-title">Đặt phòng của tôi</h1>
        <p className="mybk-sub">{bookings.length} lượt đặt phòng</p>

        {sorted.map((b) => {
          const hotel = hotelById[b.hotelId]
          const room = roomById[b.roomId]
          const badge = BOOKING_STATUS[b.status] || BOOKING_STATUS.pending
          const refund = REFUND_STATUS[b.refundStatus]
          return (
            <article className="mybk-card" key={b.id}>
              <img src={hotel?.image} alt={hotel?.name} className="mybk-img" />
              <div className="mybk-info">
                <div className="mybk-info-head">
                  <div>
                    <Link to={`/hotels/${b.hotelId}`} className="mybk-hotel">
                      {hotel?.name || 'Khách sạn'}
                    </Link>
                    <p className="mybk-room">{room?.name} · {room?.type}</p>
                  </div>
                  <span className={`badge-soft ${badge.cls}`}>{badge.label}</span>
                </div>
                <div className="mybk-meta">
                  <span>📅 {b.checkIn} → {b.checkOut} ({b.nights} đêm)</span>
                  <span>👤 {b.guests} khách</span>
                  <span>💳 {b.paymentMethod === 'hotel' ? 'Tại khách sạn' : 'Online'}</span>
                  {b.voucherCode && <span>🎟 {b.voucherCode}</span>}
                </div>
                <div className="mybk-foot">
                  <span className="mybk-total">{formatVND(b.totalPrice)}</span>
                  <div className="mybk-actions">
                    {refund && <span className={`badge-soft ${refund.cls}`}>{refund.label}</span>}
                    {b.status === 'pending' && (
                      <button className="mybk-btn ghost" onClick={() => setCancelling(b)}>
                        Hủy đặt phòng
                      </button>
                    )}
                    {b.status === 'confirmed' && !b.cancelRequest && (
                      <button className="mybk-btn ghost" onClick={() => requestRefund(b)}>
                        Yêu cầu hủy &amp; hoàn tiền
                      </button>
                    )}
                    {b.status === 'checked_out' &&
                      (reviewedIds.has(b.id) ? (
                        <span className="mybk-done">✓ Đã đánh giá</span>
                      ) : (
                        <button className="mybk-btn" onClick={() => setReviewing(b)}>
                          Viết đánh giá
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </article>
          )
        })}

        {!sorted.length && (
          <div className="mybk-empty">
            <p>Bạn chưa có đặt phòng nào.</p>
            <Link to="/hotels" className="mybk-btn">
              Khám phá khách sạn
            </Link>
          </div>
        )}
      </div>

      <Footer />

      <ReviewModal
        show={!!reviewing}
        onHide={() => setReviewing(null)}
        booking={reviewing}
        hotelName={hotelById[reviewing?.hotelId]?.name}
        user={user}
        onSubmitted={() => getReviews({ userId: user.id }).then(setReviews).catch(() => {})}
      />
      <ConfirmModal
        show={!!cancelling}
        title="Hủy đặt phòng"
        message={`Hủy đặt phòng tại "${hotelById[cancelling?.hotelId]?.name || ''}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Hủy đặt phòng"
        onConfirm={cancel}
        onHide={() => setCancelling(null)}
      />
    </div>
  )
}
