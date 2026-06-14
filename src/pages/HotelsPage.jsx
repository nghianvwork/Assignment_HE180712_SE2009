import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getHotels } from '../services/hotelService'
import { getRooms } from '../services/roomService'
import { getBookings } from '../services/bookingService'
import { formatVND } from '../utils/format'
import './Hotels.css'

const SORTS = [
  { value: 'popular', label: 'Phổ biến' },
  { value: 'price-asc', label: 'Giá thấp → cao' },
  { value: 'price-desc', label: 'Giá cao → thấp' },
  { value: 'rating', label: 'Đánh giá cao' },
]
const RATING_TIERS = [
  { v: 4.5, l: '4.5+' },
  { v: 4, l: '4.0+' },
  { v: 3, l: '3.0+' },
]
const PRICE_TIERS = [
  { v: 0, l: 'Không giới hạn' },
  { v: 700000, l: '≤ 700.000₫' },
  { v: 1200000, l: '≤ 1.200.000₫' },
  { v: 2000000, l: '≤ 2.000.000₫' },
  { v: 5000000, l: '≤ 5.000.000₫' },
]

/** Trang danh sách khách sạn: tìm kiếm, lọc, sắp xếp */
export default function HotelsPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [hotels, setHotels] = useState([])
  const [rooms, setRooms] = useState([])
  const [bookings, setBookings] = useState([])
  const [q, setQ] = useState('')
  const [city, setCity] = useState(params.get('city') || '')
  const [priceMax, setPriceMax] = useState(0)
  const [minRating, setMinRating] = useState(0)
  const [amenitySel, setAmenitySel] = useState([])
  const [roomType, setRoomType] = useState('')
  const [sort, setSort] = useState('popular')

  useEffect(() => {
    Promise.all([getHotels({ status: 'active' }), getRooms(), getBookings()])
      .then(([h, r, b]) => {
        setHotels(h)
        setRooms(r)
        setBookings(b)
      })
      .catch(() => toast.error('Không tải được danh sách khách sạn'))
  }, [])

  // Gom dữ liệu phụ trợ theo khách sạn
  const roomsByHotel = {}
  rooms.forEach((r) => (roomsByHotel[r.hotelId] = roomsByHotel[r.hotelId] || []).push(r))
  const bookingCount = {}
  bookings.forEach((b) => {
    if (b.status !== 'cancelled' && b.status !== 'rejected')
      bookingCount[b.hotelId] = (bookingCount[b.hotelId] || 0) + 1
  })
  const allAmenities = [...new Set(hotels.flatMap((h) => h.amenities || []))]
  const allRoomTypes = [...new Set(rooms.map((r) => r.type))]
  const allCities = [...new Set(hotels.map((h) => h.city).filter(Boolean))]
  const minPriceOf = (id) => {
    const rs = roomsByHotel[id] || []
    return rs.length ? Math.min(...rs.map((r) => r.price)) : 0
  }

  let list = hotels.filter((h) => {
    const kw = q.trim().toLowerCase()
    if (kw && ![h.name, h.city, h.address].some((v) => v?.toLowerCase().includes(kw))) return false
    if (city && h.city !== city) return false
    if (priceMax && minPriceOf(h.id) > priceMax) return false
    if (minRating && (h.rating || 0) < minRating) return false
    if (amenitySel.length && !amenitySel.every((a) => (h.amenities || []).includes(a))) return false
    if (roomType && !(roomsByHotel[h.id] || []).some((r) => r.type === roomType)) return false
    return true
  })
  list = [...list].sort((a, b) => {
    if (sort === 'price-asc') return minPriceOf(a.id) - minPriceOf(b.id)
    if (sort === 'price-desc') return minPriceOf(b.id) - minPriceOf(a.id)
    if (sort === 'rating') return (b.rating || 0) - (a.rating || 0)
    return (bookingCount[b.id] || 0) - (bookingCount[a.id] || 0)
  })

  const toggleAmenity = (a) =>
    setAmenitySel((s) => (s.includes(a) ? s.filter((x) => x !== a) : [...s, a]))
  const clearFilters = () => {
    setCity('')
    setPriceMax(0)
    setMinRating(0)
    setAmenitySel([])
    setRoomType('')
  }

  return (
    <div className="hotels-page">
      <Navbar />

      <header className="hp-hero">
        <div className="hp-hero-inner">
          <p className="hp-eyebrow">Bộ sưu tập khách sạn</p>
          <h1>Tìm nơi lưu trú hoàn hảo</h1>
          <div className="hp-searchbar">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên, thành phố, địa chỉ…"
            />
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  Sắp xếp: {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="hp-body">
        <aside className="hp-filters">
          <div className="hp-filter-head">
            <h3>Bộ lọc</h3>
            <button onClick={clearFilters}>Xóa lọc</button>
          </div>

          <div className="hp-fgroup">
            <label>Thành phố</label>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Mọi thành phố</option>
              {allCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="hp-fgroup">
            <label>Giá tối đa / đêm</label>
            <select value={priceMax} onChange={(e) => setPriceMax(+e.target.value)}>
              {PRICE_TIERS.map((t) => (
                <option key={t.v} value={t.v}>
                  {t.l}
                </option>
              ))}
            </select>
          </div>

          <div className="hp-fgroup">
            <label>Đánh giá</label>
            <div className="hp-chips">
              {RATING_TIERS.map((t) => (
                <button
                  key={t.v}
                  className={minRating === t.v ? 'on' : ''}
                  onClick={() => setMinRating(minRating === t.v ? 0 : t.v)}
                >
                  ★ {t.l}
                </button>
              ))}
            </div>
          </div>

          <div className="hp-fgroup">
            <label>Loại phòng</label>
            <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
              <option value="">Tất cả</option>
              {allRoomTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="hp-fgroup">
            <label>Tiện ích</label>
            <div className="hp-amenities">
              {allAmenities.map((a) => (
                <label key={a} className="hp-check">
                  <input
                    type="checkbox"
                    checked={amenitySel.includes(a)}
                    onChange={() => toggleAmenity(a)}
                  />
                  <span>{a}</span>
                </label>
              ))}
              {!allAmenities.length && <p className="text-muted small mb-0">Đang tải…</p>}
            </div>
          </div>
        </aside>

        <main className="hp-results">
          <p className="hp-count">{list.length} khách sạn</p>
          <div className="hp-grid">
            {list.map((h) => {
              const price = minPriceOf(h.id)
              return (
                <article className="hp-card" key={h.id} onClick={() => navigate(`/hotels/${h.id}`)}>
                  <div className="hp-card-media">
                    <img src={h.image} alt={h.name} loading="lazy" />
                    <span className="hp-rating">★ {h.rating}</span>
                  </div>
                  <div className="hp-card-body">
                    <p className="hp-city">{h.city}</p>
                    <h3>{h.name}</h3>
                    <p className="hp-amen">{(h.amenities || []).slice(0, 3).join(' · ') || h.address}</p>
                    <div className="hp-card-foot">
                      <span className="hp-price">
                        {price ? formatVND(price) : 'Liên hệ'} <small>/ đêm</small>
                      </span>
                      <span className="hp-cardlink">Xem chi tiết →</span>
                    </div>
                  </div>
                </article>
              )
            })}
            {!list.length && <p className="hp-empty">Không tìm thấy khách sạn phù hợp.</p>}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
