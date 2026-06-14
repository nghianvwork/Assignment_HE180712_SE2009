import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { getWishlist, removeFromWishlist } from '../services/wishlistService'
import { getHotels } from '../services/hotelService'
import { formatVND } from '../utils/format'
import { getRooms } from '../services/roomService'
import './Hotels.css'

/** Danh sách khách sạn yêu thích của khách */
export default function WishlistPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [hotels, setHotels] = useState([])
  const [rooms, setRooms] = useState([])

  const reload = () =>
    getWishlist({ userId: user.id })
      .then(setItems)
      .catch(() => toast.error('Không tải được danh sách yêu thích'))

  useEffect(() => {
    if (!user?.id) return
    reload()
    getHotels().then(setHotels).catch(() => {})
    getRooms().then(setRooms).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const hotelById = Object.fromEntries(hotels.map((h) => [h.id, h]))
  const minPriceOf = (hid) => {
    const rs = rooms.filter((r) => r.hotelId === hid)
    return rs.length ? Math.min(...rs.map((r) => r.price)) : 0
  }

  const remove = async (e, item) => {
    e.stopPropagation()
    try {
      await removeFromWishlist(item.id)
      toast.success('Đã bỏ khỏi yêu thích')
      reload()
    } catch {
      toast.error('Thao tác thất bại')
    }
  }

  const saved = items.map((it) => ({ ...it, hotel: hotelById[it.hotelId] })).filter((x) => x.hotel)

  return (
    <div className="hotels-page">
      <Navbar />
      <header className="hp-hero" style={{ padding: '130px 24px 50px' }}>
        <div className="hp-hero-inner">
          <p className="hp-eyebrow">Bộ sưu tập của bạn</p>
          <h1>Khách sạn yêu thích</h1>
        </div>
      </header>

      <div className="hp-body" style={{ gridTemplateColumns: '1fr' }}>
        <main className="hp-results">
          <p className="hp-count">{saved.length} khách sạn đã lưu</p>
          <div className="hp-grid">
            {saved.map(({ id, hotel }) => {
              const price = minPriceOf(hotel.id)
              return (
                <article
                  className="hp-card"
                  key={id}
                  onClick={() => navigate(`/hotels/${hotel.id}`)}
                >
                  <div className="hp-card-media">
                    <img src={hotel.image} alt={hotel.name} loading="lazy" />
                    <span className="hp-rating">★ {hotel.rating}</span>
                  </div>
                  <div className="hp-card-body">
                    <p className="hp-city">{hotel.city}</p>
                    <h3>{hotel.name}</h3>
                    <p className="hp-amen">{(hotel.amenities || []).slice(0, 3).join(' · ')}</p>
                    <div className="hp-card-foot">
                      <span className="hp-price">
                        {price ? formatVND(price) : 'Liên hệ'} <small>/ đêm</small>
                      </span>
                      <button className="hp-cardlink" onClick={(e) => remove(e, { id })}>
                        ♥ Bỏ lưu
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
            {!saved.length && (
              <p className="hp-empty">
                Chưa có khách sạn yêu thích.{' '}
                <Link to="/hotels" style={{ color: 'var(--c-gold)' }}>
                  Khám phá ngay
                </Link>
              </p>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
