import './AvailabilityCalendar.css'

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const pad = (n) => String(n).padStart(2, '0')

/**
 * Lịch tháng hiển thị tình trạng trống/đã đặt theo ngày — thuần CSS, không phụ thuộc thư viện.
 * @param {number} year
 * @param {number} month - 0-based (0 = tháng 1)
 * @param {Record<string,string>} days - map 'YYYY-MM-DD' -> nhãn khách đặt (ngày trống thì không có key)
 * @param {() => void} onPrev
 * @param {() => void} onNext
 */
export default function AvailabilityCalendar({ year, month, days = {}, onPrev, onNext }) {
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7 // thứ Hai = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="cal">
      <div className="cal-head">
        <button type="button" onClick={onPrev} aria-label="Tháng trước">
          ‹
        </button>
        <strong>
          {pad(month + 1)}/{year}
        </strong>
        <button type="button" onClick={onNext} aria-label="Tháng sau">
          ›
        </button>
      </div>

      <div className="cal-grid">
        {WEEKDAYS.map((w) => (
          <div key={w} className="cal-weekday">
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} className="cal-cell empty" />
          const ds = `${year}-${pad(month + 1)}-${pad(d)}`
          const guest = days[ds]
          return (
            <div
              key={ds}
              className={`cal-cell ${guest ? 'booked' : 'free'}`}
              title={guest ? `${ds}: ${guest}` : `${ds}: Còn trống`}
            >
              <span className="cal-date">{d}</span>
              <span className="cal-tag">{guest || 'Trống'}</span>
            </div>
          )
        })}
      </div>

      <div className="cal-legend">
        <span>
          <i className="dot free" /> Còn trống
        </span>
        <span>
          <i className="dot booked" /> Đã đặt
        </span>
      </div>
    </div>
  )
}
