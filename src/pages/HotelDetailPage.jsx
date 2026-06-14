import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Modal } from 'react-bootstrap'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BookingModal from '../components/BookingModal'
import { useAuth } from '../context/AuthContext'
import { getHotelById } from '../services/hotelService'
import { getRooms } from '../services/roomService'
import { getReviews } from '../services/reviewService'
import { getUsers } from '../services/userService'
import { getPricingRules } from '../services/pricingService'
import { getVouchers } from '../services/voucherService'
import { getBookings } from '../services/bookingService'
import { getWishlist, addToWishlist, removeFromWishlist } from '../services/wishlistService'
import { formatVND } from '../utils/format'
import './HotelDetail.css'

const stars = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(Math.max(0, 5 - Math.round(n)))

/** Trang chi tiết khách sạn: gallery, mô tả, tiện ích, chính sách, bản đồ, phòng & đánh giá */
export default function HotelDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [hotel, setHotel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [reviews, setReviews] = useState([])
  const [users, setUsers] = useState([])
  const [rules, setRules] = useState([])
  const [vouchers, setVouchers] = useState([])
  const [bookings, setBookings] = useState([])
  const [mainImg, setMainImg] = useState('')
  const [activeRoom, setActiveRoom] = useState(null)
  const [favId, setFavId] = useState(null)
  const [roomsOpen, setRoomsOpen] = useState(false)

  useEffect(() => {
    let active = true
    getHotelById(id)
      .then((h) => {
        if (!active) return
        setHotel(h)
        setMainImg(h.image)
      })
      .catch(() => toast.error('Không tải được thông tin khách sạn'))
    getRooms({ hotelId: id }).then((r) => active && setRooms(r)).catch(() => {})
    getReviews({ hotelId: id }).then((r) => active && setReviews(r)).catch(() => {})
    getPricingRules({ hotelId: id }).then((r) => active && setRules(r)).catch(() => {})
    getVouchers({ hotelId: id }).then((v) => active && setVouchers(v.filter((x) => x.active))).catch(() => {})
    getBookings({ hotelId: id }).then((b) => active && setBookings(b)).catch(() => {})
    getUsers().then((u) => active && setUsers(u)).catch(() => {})
    if (user?.id) {
      getWishlist({ userId: user.id, hotelId: id })
        .then((w) => active && setFavId(w[0]?.id || null))
        .catch(() => {})
    }
    return () => {
      active = false
    }
  }, [id, user?.id])

  const toggleFav = async () => {
    if (!user) return navigate('/login')
    try {
      if (favId) {
        await removeFromWishlist(favId)
        setFavId(null)
        toast.info('Đã bỏ khỏi yêu thích')
      } else {
        const created = await addToWishlist({
          userId: user.id,
          hotelId: id,
          createdAt: new Date().toISOString(),
        })
        setFavId(created.id)
        toast.success('Đã lưu vào yêu thích')
      }
    } catch {
      toast.error('Thao tác thất bại')
    }
  }

  if (!hotel) {
    return (
      <>
        <Navbar />
        <div className="hd-loading">Đang tải…</div>
        <Footer />
      </>
    )
  }

  const userById = Object.fromEntries(users.map((u) => [u.id, u]))
  const gallery = [hotel.image, ...rooms.map((r) => r.image)].filter(Boolean).slice(0, 5)
  const owner = users.find((u) => u.id === hotel.ownerId)
  const ownerInitials = (owner?.fullName || '')
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  const openBooking = (room) => {
    if (!user) {
      toast.info('Vui lòng đăng nhập để đặt phòng')
      return navigate('/login')
    }
    if (user.role !== 'user') return toast.info('Tài khoản quản trị/quản lý không dùng để đặt phòng')
    setRoomsOpen(false)
    setActiveRoom(room)
  }

  return (
    <div className="hotel-detail">
      <Navbar />

      {/* Gallery */}
      <section className="hd-gallery">
        <div className="hd-main">
          <img src={mainImg} alt={hotel.name} />
        </div>
        {gallery.length > 1 && (
          <div className="hd-thumbs">
            {gallery.map((src, i) => (
              <button
                key={i}
                className={src === mainImg ? 'on' : ''}
                onClick={() => setMainImg(src)}
              >
                <img src={src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="hd-wrap">
        <header className="hd-head">
          <div>
            <p className="hd-city">{hotel.city}</p>
            <h1>{hotel.name}</h1>
            <p className="hd-addr">{hotel.address}</p>
          </div>
          <div className="hd-head-right">
            <button
              className={`hd-fav ${favId ? 'on' : ''}`}
              onClick={toggleFav}
              title={favId ? 'Bỏ yêu thích' : 'Lưu yêu thích'}
            >
              {favId ? '♥' : '♡'} Yêu thích
            </button>
            <div className="hd-rating">
              <span className="hd-stars">{stars(hotel.rating)}</span>
              <span className="hd-score">{hotel.rating}</span>
            </div>
          </div>
        </header>

        <div className="hd-grid">
          <main>
            <section className="hd-block">
              <h2>Giới thiệu</h2>
              <p>{hotel.description}</p>
            </section>

            {owner && (
              <section className="hd-block">
                <h2>Người quản lý</h2>
                <div className="hd-host">
                  <div className="hd-host-avatar">
                    {owner.avatar ? (
                      <img src={owner.avatar} alt={owner.fullName} />
                    ) : (
                      <span>{ownerInitials}</span>
                    )}
                  </div>
                  <div className="hd-host-info">
                    <strong>{owner.fullName}</strong>
                    <span className="hd-host-role">Quản lý khách sạn</span>
                    <div className="hd-host-contact">
                      <a href={`mailto:${owner.email}`}>✉ {owner.email}</a>
                      {owner.phone && <a href={`tel:${owner.phone}`}>☎ {owner.phone}</a>}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {(hotel.amenities || []).length > 0 && (
              <section className="hd-block">
                <h2>Tiện ích</h2>
                <div className="hd-amenities">
                  {hotel.amenities.map((a) => (
                    <span key={a} className="hd-amenity">
                      ✦ {a}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {hotel.policy && (
              <section className="hd-block">
                <h2>Chính sách</h2>
                <p>{hotel.policy}</p>
              </section>
            )}

            <section className="hd-block">
              <h2>Bản đồ</h2>
              <iframe
                title="map"
                className="hd-map"
                loading="lazy"
                src={`https://www.google.com/maps?q=${encodeURIComponent(hotel.address)}&output=embed`}
              />
            </section>

            <section className="hd-block">
              <h2>Đánh giá ({reviews.length})</h2>
              {reviews.map((r) => (
                <div key={r.id} className="hd-review">
                  <div className="hd-review-head">
                    <strong>{userById[r.userId]?.fullName || 'Khách'}</strong>
                    <span className="hd-review-stars">{stars(r.rating)}</span>
                  </div>
                  <p className="hd-review-body">{r.comment}</p>
                  {r.reply && <p className="hd-review-reply">↳ Phản hồi: {r.reply}</p>}
                </div>
              ))}
              {!reviews.length && <p className="text-muted">Chưa có đánh giá nào.</p>}
            </section>
          </main>

          <aside className="hd-rooms">
            <h2>Phòng &amp; giá</h2>
            <p className="hd-rooms-from">
              {rooms.length ? (
                <>
                  Chỉ từ <strong>{formatVND(Math.min(...rooms.map((r) => r.price)))}</strong> / đêm
                </>
              ) : (
                'Chưa cập nhật phòng'
              )}
            </p>
            <button
              className="hd-show-rooms"
              onClick={() => setRoomsOpen(true)}
              disabled={!rooms.length}
            >
              {rooms.length ? `Xem các phòng (${rooms.length})` : 'Chưa có phòng'}
            </button>
          </aside>
        </div>
      </div>

      <Footer />

      {/* Danh sách phòng hiển thị dạng popup */}
      <Modal show={roomsOpen} onHide={() => setRoomsOpen(false)} centered size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">Phòng tại {hotel.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="hd-room-list">
            {rooms.map((room) => (
              <article key={room.id} className="hd-room-row">
                <img src={room.image} alt={room.name} loading="lazy" />
                <div className="hd-room-row-body">
                  <span className="hd-room-type">{room.type}</span>
                  <h3>{room.name}</h3>
                  <p className="hd-room-meta">
                    {room.bedType} · {room.capacity} khách · {room.size}m²
                  </p>
                </div>
                <div className="hd-room-row-cta">
                  <span className="hd-room-price">
                    {formatVND(room.price)} <small>/ đêm</small>
                  </span>
                  <button
                    className="hd-book-btn"
                    disabled={!room.available}
                    onClick={() => openBooking(room)}
                  >
                    {room.available ? 'Đặt phòng' : 'Hết phòng'}
                  </button>
                </div>
              </article>
            ))}
            {!rooms.length && (
              <p className="text-muted text-center py-3">Chưa có phòng.</p>
            )}
          </div>
        </Modal.Body>
      </Modal>

      <BookingModal
        show={!!activeRoom}
        onHide={() => setActiveRoom(null)}
        hotel={hotel}
        room={activeRoom}
        rules={rules.filter((r) => r.roomId === activeRoom?.id)}
        roomBookings={bookings.filter((b) => b.roomId === activeRoom?.id)}
        vouchers={vouchers}
        user={user}
        onBooked={() => getBookings({ hotelId: id }).then(setBookings).catch(() => {})}
      />
    </div>
  )
}
