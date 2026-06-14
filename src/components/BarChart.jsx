import './BarChart.css'

/**
 * Biểu đồ cột đơn giản — thuần CSS, không phụ thuộc thư viện ngoài.
 * @param {{label: string, value: number}[]} data - dữ liệu cột
 * @param {(v: number) => string} [formatValue] - hàm định dạng nhãn giá trị
 * @param {string} [color] - màu cột (CSS color)
 * @param {string} [emptyText] - chữ hiển thị khi không có dữ liệu
 */
export default function BarChart({
  data = [],
  formatValue,
  color = 'var(--c-gold, #9c7a4d)',
  emptyText = 'Chưa có dữ liệu',
}) {
  if (!data.length) {
    return <div className="bar-chart-empty">{emptyText}</div>
  }

  const max = Math.max(...data.map((d) => d.value), 0)
  const fmt = (v) => (formatValue ? formatValue(v) : v.toLocaleString('vi-VN'))

  return (
    <div className="bar-chart">
      {data.map((d, i) => {
        const pct = max > 0 ? (d.value / max) * 100 : 0
        return (
          <div className="bar-col" key={`${d.label}-${i}`}>
            <div className="bar-val">{fmt(d.value)}</div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ height: `${pct}%`, background: color }}
                title={`${d.label}: ${fmt(d.value)}`}
              />
            </div>
            <div className="bar-label">{d.label}</div>
          </div>
        )
      })}
    </div>
  )
}
