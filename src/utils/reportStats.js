// Thống kê báo cáo: tỉ lệ lấp đầy & số booking theo thời gian.
import { REVENUE_STATUSES } from './bookingStatus'

/**
 * Tỉ lệ lấp đầy (%) tại một ngày: số phòng đang có khách / tổng số phòng.
 * Phòng được tính là "có khách" nếu có booking hợp lệ với checkIn <= ngày < checkOut.
 */
export function occupancyRate(rooms, bookings, dateStr) {
  if (!rooms.length) return 0
  const occupied = new Set(
    bookings
      .filter(
        (b) =>
          REVENUE_STATUSES.includes(b.status) &&
          b.checkIn <= dateStr &&
          dateStr < b.checkOut
      )
      .map((b) => b.roomId)
  )
  const count = rooms.filter((r) => occupied.has(r.id)).length
  return Math.round((count / rooms.length) * 100)
}

/**
 * Số lượng booking theo tháng — n tháng gần nhất (theo createdAt).
 * @returns {{label: string, value: number}[]}
 */
export function monthlyBookingCount(bookings, n = 6, now = new Date()) {
  const buckets = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`,
      value: 0,
    })
  }
  const index = Object.fromEntries(buckets.map((b) => [b.key, b]))
  bookings.forEach((b) => {
    const d = new Date(b.createdAt)
    const bucket = index[`${d.getFullYear()}-${d.getMonth()}`]
    if (bucket) bucket.value += 1
  })
  return buckets.map(({ label, value }) => ({ label, value }))
}
