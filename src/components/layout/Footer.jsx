import './Footer.css'

const COLUMNS = [
  {
    title: 'Khám phá',
    links: ['Bộ sưu tập', 'Phòng nghỉ', 'Trải nghiệm', 'Ưu đãi'],
  },
  {
    title: 'Hỗ trợ',
    links: ['Liên hệ', 'Câu hỏi thường gặp', 'Chính sách', 'Điều khoản'],
  },
  {
    title: 'Kết nối',
    links: ['Instagram', 'Facebook', 'Pinterest', 'LinkedIn'],
  },
]

export default function Footer() {
  return (
    <footer className="lux-footer">
      <div className="lux-footer-inner">
        <div className="lux-footer-brand">
          <div className="lux-footer-logo">Hotel Luxury</div>
          <p>
            Bộ sưu tập những khu nghỉ dưỡng tinh tuyển, nơi sự tinh tế gặp gỡ
            lòng hiếu khách đích thực.
          </p>
          <div className="lux-footer-since">Exclusively since 1924</div>
        </div>

        <div className="lux-footer-cols">
          {COLUMNS.map((col) => (
            <div key={col.title} className="lux-footer-col">
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="lux-footer-bottom">
        <span>© 2026 Hotel Luxury. Bảo lưu mọi quyền.</span>
        <span>Privacy · Terms · Support</span>
      </div>
    </footer>
  )
}
