// Tính giá phòng theo ngày + áp dụng voucher + kiểm tra phòng trống.
// Chuỗi ngày 'YYYY-MM-DD' so sánh từ điển đúng thứ tự thời gian.

const pad = (n) => String(n).padStart(2, '0')
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** Giá hiệu lực cho 1 đêm: quy tắc giá khớp khoảng ngày sẽ ghi đè giá gốc. */
export function effectivePrice(basePrice, rules, dateStr) {
  const rule = (rules || []).find((r) => dateStr >= r.startDate && dateStr <= r.endDate)
  return rule ? rule.price : basePrice
}

/**
 * Tổng tiền phòng cho các đêm [checkIn, checkOut) — áp giá theo mùa từng đêm.
 * @returns {{ total: number, nights: number, breakdown: {date:string, price:number}[] }}
 */
export function stayPrice(basePrice, rules, checkIn, checkOut) {
  const breakdown = []
  const cur = new Date(`${checkIn}T00:00:00`)
  const end = new Date(`${checkOut}T00:00:00`)
  while (cur < end) {
    const ds = fmt(cur)
    breakdown.push({ date: ds, price: effectivePrice(basePrice, rules, ds) })
    cur.setDate(cur.getDate() + 1)
  }
  return {
    total: breakdown.reduce((s, b) => s + b.price, 0),
    nights: breakdown.length,
    breakdown,
  }
}

/** Số tiền giảm + thành tiền sau khi áp voucher. */
export function applyDiscount(amount, voucher) {
  if (!voucher) return { discount: 0, final: amount }
  const raw =
    voucher.discountType === 'percent'
      ? Math.round((amount * voucher.discountValue) / 100)
      : voucher.discountValue
  const discount = Math.min(raw, amount)
  return { discount, final: amount - discount }
}

/** Phòng còn trống cho khoảng [checkIn, checkOut) nếu không trùng booking nào đang giữ chỗ. */
export function isRangeAvailable(blockingBookings, checkIn, checkOut) {
  return !blockingBookings.some((b) => checkIn < b.checkOut && b.checkIn < checkOut)
}
