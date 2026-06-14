// Thống kê doanh thu từ danh sách booking.
// Doanh thu thực tế = booking đã xác nhận / nhận phòng / trả phòng (REVENUE_STATUSES).

import { REVENUE_STATUSES } from './bookingStatus'

const MS_DAY = 86400000

const confirmed = (bookings) => bookings.filter((b) => REVENUE_STATUSES.includes(b.status))

/** Tổng doanh thu của các booking đã xác nhận. */
export function totalRevenue(bookings) {
  return confirmed(bookings).reduce((sum, b) => sum + (b.totalPrice || 0), 0)
}

/**
 * Doanh thu theo tháng — n tháng gần nhất (gồm cả tháng hiện tại).
 * @returns {{label: string, value: number}[]}
 */
export function monthlyRevenue(bookings, n = 6, now = new Date()) {
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
  confirmed(bookings).forEach((b) => {
    const d = new Date(b.createdAt)
    const bucket = index[`${d.getFullYear()}-${d.getMonth()}`]
    if (bucket) bucket.value += b.totalPrice || 0
  })
  return buckets.map(({ label, value }) => ({ label, value }))
}

/** Mốc đầu tuần (thứ Hai 00:00) của một ngày. */
function startOfWeek(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const offset = (d.getDay() + 6) % 7 // 0 = thứ Hai
  d.setDate(d.getDate() - offset)
  return d
}

/**
 * Doanh thu theo tuần — n tuần gần nhất (tuần bắt đầu từ thứ Hai).
 * @returns {{label: string, value: number}[]}
 */
export function weeklyRevenue(bookings, n = 6, now = new Date()) {
  const curMonday = startOfWeek(now)
  const buckets = []
  for (let i = n - 1; i >= 0; i--) {
    const start = new Date(curMonday)
    start.setDate(start.getDate() - i * 7)
    buckets.push({
      start: start.getTime(),
      end: start.getTime() + 7 * MS_DAY,
      label: `${String(start.getDate()).padStart(2, '0')}/${String(start.getMonth() + 1).padStart(2, '0')}`,
      value: 0,
    })
  }
  confirmed(bookings).forEach((b) => {
    const t = new Date(b.createdAt).getTime()
    const bucket = buckets.find((bk) => t >= bk.start && t < bk.end)
    if (bucket) bucket.value += b.totalPrice || 0
  })
  return buckets.map(({ label, value }) => ({ label, value }))
}
