import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Reveal from '../components/Reveal'
import RevealText from '../components/RevealText'
import { getHotels } from '../services/hotelService'
import { getRooms } from '../services/roomService'
import { getReviews } from '../services/reviewService'
import { getUsers } from '../services/userService'
import { formatVND } from '../utils/format'
import './Home.css'

const EXPERIENCES = [
  {
    title: 'Trải nghiệm riêng tư',
    desc: 'Hành trình được thiết kế riêng cho từng vị khách, từ du thuyền hoàng hôn đến tiệc tối dưới trời sao.',
  },
  {
    title: 'Chăm sóc & Spa',
    desc: 'Liệu trình trị liệu toàn diện giữa không gian tĩnh lặng, đánh thức mọi giác quan.',
  },
  {
    title: 'Kỳ nghỉ tuyển chọn',
    desc: 'Những điểm đến được tuyển chọn kỹ lưỡng, nơi mỗi khoảnh khắc đều trọn vẹn.',
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [hotels, setHotels] = useState([])
  const [rooms, setRooms] = useState([])
  const [reviews, setReviews] = useState([])
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState({ city: '', checkIn: '', checkOut: '', guests: 2 })

  useEffect(() => {
    let active = true
    Promise.all([
      getHotels({ status: 'active' }),
      getRooms({ available: true }),
      getReviews(),
      getUsers(),
    ])
      .then(([h, r, rv, u]) => {
        if (!active) return
        setHotels(h)
        setRooms(r.slice(0, 4))
        setReviews(rv)
        setUsers(u)
      })
      .catch(() => toast.error('Không tải được dữ liệu khách sạn'))
    return () => {
      active = false
    }
  }, [])

  // Danh sách điểm đến lấy từ dữ liệu khách sạn (không hardcode)
  const cities = [...new Set(hotels.map((h) => h.city).filter(Boolean))]

  // Cảm nhận khách hàng lấy từ đánh giá thật trong DB
  const userById = Object.fromEntries(users.map((u) => [u.id, u]))
  const hotelById = Object.fromEntries(hotels.map((h) => [h.id, h]))
  const narratives = reviews
    .filter((r) => r.comment && r.rating >= 4)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 2)
    .map((r) => ({
      image: hotelById[r.hotelId]?.image,
      tag: `${r.rating}★ · ${hotelById[r.hotelId]?.city || ''}`,
      title: hotelById[r.hotelId]?.name || 'Cảm nhận',
      quote: `“${r.comment}”`,
      author: userById[r.userId]?.fullName || 'Khách',
    }))

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.city) params.set('city', search.city)
    if (search.checkIn) params.set('checkIn', search.checkIn)
    if (search.checkOut) params.set('checkOut', search.checkOut)
    if (search.guests) params.set('guests', search.guests)
    navigate(`/hotels?${params.toString()}`)
  }

  return (
    <div className="home">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-eyebrow">Hotel Luxury · Exclusively since 1924</p>
          <h1 className="hero-title">
            <RevealText as="span" className="ht-line" text="Nơi sự thanh lịch" />
            <RevealText
              as="span"
              className="ht-line"
              text="gặp gỡ đường chân trời"
              startDelay={320}
            />
          </h1>
          <p className="hero-sub">
            Bộ sưu tập những khu nghỉ dưỡng tinh tuyển dành riêng cho hành trình
            đáng nhớ của bạn.
          </p>
        </div>

        <form className="hero-search" onSubmit={handleSearch}>
          <div className="hs-field">
            <label>Điểm đến</label>
            <select
              value={search.city}
              onChange={(e) => setSearch((s) => ({ ...s, city: e.target.value }))}
            >
              <option value="">Mọi điểm đến</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="hs-divider" />
          <div className="hs-field">
            <label>Nhận phòng</label>
            <input
              type="date"
              value={search.checkIn}
              onChange={(e) => setSearch((s) => ({ ...s, checkIn: e.target.value }))}
            />
          </div>
          <div className="hs-divider" />
          <div className="hs-field">
            <label>Trả phòng</label>
            <input
              type="date"
              value={search.checkOut}
              onChange={(e) => setSearch((s) => ({ ...s, checkOut: e.target.value }))}
            />
          </div>
          <div className="hs-divider" />
          <div className="hs-field">
            <label>Khách</label>
            <select
              value={search.guests}
              onChange={(e) => setSearch((s) => ({ ...s, guests: +e.target.value }))}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} khách
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="hs-btn">
            Tìm phòng
          </button>
        </form>

        <div className="hero-scroll">
          <span />
        </div>
      </section>

      {/* ===== CURATED COLLECTIONS ===== */}
      <section id="collections" className="section">
        <div className="section-head">
          <Reveal>
            <p className="section-eyebrow">Bộ sưu tập</p>
          </Reveal>
          <RevealText as="h2" className="section-title" text="Curated Collections" />
          <Reveal delay={140}>
            <p className="section-desc">
              Những khu nghỉ dưỡng được tuyển chọn cho gu thẩm mỹ tinh tế nhất.
            </p>
          </Reveal>
        </div>

        <div className="collection-grid">
          {hotels.slice(0, 4).map((hotel, i) => (
            <Reveal
              key={hotel.id}
              className="collection-card"
              delay={i * 120}
              as="article"
            >
              <div className="cc-media">
                <img src={hotel.image} alt={hotel.name} loading="lazy" />
                <span className="cc-rating">★ {hotel.rating}</span>
              </div>
              <div className="cc-body">
                <p className="cc-city">{hotel.city}</p>
                <h3>{hotel.name}</h3>
                <p className="cc-desc">{hotel.description}</p>
                <button className="cc-link" onClick={() => navigate(`/hotels/${hotel.id}`)}>
                  Khám phá →
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== FEATURED ROOMS ===== */}
      <section id="rooms" className="section section-alt">
        <div className="section-head">
          <Reveal>
            <p className="section-eyebrow">Phòng nghỉ</p>
          </Reveal>
          <RevealText as="h2" className="section-title" text="Không gian được yêu thích" />
        </div>

        <div className="room-grid">
          {rooms.map((room, i) => (
            <Reveal key={room.id} className="room-card" delay={i * 120} as="article">
              <div className="rc-media">
                <img src={room.image} alt={room.name} loading="lazy" />
                <span className="rc-type">{room.type}</span>
              </div>
              <div className="rc-body">
                <h3>{room.name}</h3>
                <p className="rc-meta">
                  {room.bedType} · {room.capacity} khách · {room.size}m²
                </p>
                <div className="rc-foot">
                  <span className="rc-price">
                    {formatVND(room.price)} <small>/ đêm</small>
                  </span>
                  <button className="rc-btn" onClick={() => navigate(`/hotels/${room.hotelId}`)}>
                    Đặt phòng
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== BEYOND THE STAY ===== */}
      <section id="beyond" className="beyond">
        <div className="beyond-media">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000&q=80"
            alt="Trải nghiệm ẩm thực"
            loading="lazy"
          />
        </div>
        <div className="beyond-content">
          <Reveal>
            <p className="section-eyebrow light">Hơn cả một kỳ nghỉ</p>
          </Reveal>
          <RevealText as="h2" className="section-title light" text="Beyond the Stay" />
          <div className="beyond-list">
            {EXPERIENCES.map((ex, i) => (
              <Reveal key={ex.title} className="beyond-item" delay={i * 140}>
                <span className="beyond-index">0{i + 1}</span>
                <div>
                  <h4>{ex.title}</h4>
                  <p>{ex.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRAVELER'S NARRATIVE ===== */}
      <section id="narrative" className="section">
        <div className="section-head">
          <Reveal>
            <p className="section-eyebrow">Cảm nhận</p>
          </Reveal>
          <RevealText as="h2" className="section-title" text="Traveler's Narrative" />
        </div>

        <div className="narrative-grid">
          {narratives.map((n, i) => (
            <Reveal key={i} className="narrative-card" delay={i * 150} as="article">
              <div className="nc-media">
                <img src={n.image} alt={n.title} loading="lazy" />
              </div>
              <div className="nc-body">
                <span className="nc-tag">{n.tag}</span>
                <h3>{n.title}</h3>
                <p className="nc-quote">{n.quote}</p>
                <span className="nc-author">— {n.author}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta">
        <div className="cta-overlay" />
        <Reveal className="cta-content">
          <RevealText as="h2" text="Bắt đầu hành trình của bạn" />
          <p>Đặt phòng hôm nay để tận hưởng đặc quyền dành riêng cho thành viên.</p>
          <button className="cta-btn" onClick={() => navigate('/register')}>
            Tạo tài khoản
          </button>
        </Reveal>
      </section>

      <Footer />
    </div>
  )
}
