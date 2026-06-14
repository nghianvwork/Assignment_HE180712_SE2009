import { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { getBookings } from '../../services/bookingService'
import { formatVND } from '../../utils/format'
import { monthlyRevenue, weeklyRevenue, totalRevenue } from '../../utils/revenueStats'
import BarChart from '../../components/BarChart'
import { useOwnedHotels } from './useOwnedHotels'

/** Doanh thu khu quản lý: biểu đồ theo tháng & theo tuần + bảng theo khách sạn */
export default function ManagerRevenue() {
  const { hotels, hotelIds, loading } = useOwnedHotels()
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    if (loading) return
    const ids = new Set(hotelIds)
    getBookings()
      .then((all) => setBookings(all.filter((b) => ids.has(b.hotelId))))
      .catch(() => toast.error('Không tải được dữ liệu doanh thu'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hotels])

  const monthData = monthlyRevenue(bookings, 6)
  const weekData = weeklyRevenue(bookings, 6)
  const total = totalRevenue(bookings)

  // Doanh thu (đã xác nhận) theo từng khách sạn
  const byHotel = hotels.map((h) => {
    const value = bookings
      .filter((b) => b.hotelId === h.id && b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
    return { id: h.id, name: h.name, value }
  })

  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length
  const stats = [
    { label: 'Tổng doanh thu', value: formatVND(total) },
    { label: 'Booking đã xác nhận', value: confirmedCount },
    { label: 'Doanh thu tháng này', value: formatVND(monthData[monthData.length - 1]?.value || 0) },
  ]

  return (
    <>
      <div className="admin-head">
        <h1 className="admin-title">
          Doanh thu
          <small>Thống kê doanh thu từ các booking đã xác nhận</small>
        </h1>
      </div>

      <div className="stat-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Doanh thu theo tháng</h3>
          <div className="chart-sub">6 tháng gần nhất</div>
          <BarChart data={monthData} formatValue={formatVND} color="var(--c-gold, #9c7a4d)" />
        </div>
        <div className="chart-card">
          <h3>Doanh thu theo tuần</h3>
          <div className="chart-sub">6 tuần gần nhất (mốc đầu tuần)</div>
          <BarChart data={weekData} formatValue={formatVND} color="var(--c-dark, #2b2b2b)" />
        </div>
      </div>

      <h2 className="admin-section-title">Doanh thu theo khách sạn</h2>
      <div className="admin-card">
        <Table className="admin-table" responsive>
          <thead>
            <tr>
              <th>Khách sạn</th>
              <th className="text-end">Doanh thu (đã xác nhận)</th>
            </tr>
          </thead>
          <tbody>
            {byHotel.map((h) => (
              <tr key={h.id}>
                <td>{h.name}</td>
                <td className="text-end">{formatVND(h.value)}</td>
              </tr>
            ))}
            {!byHotel.length && (
              <tr>
                <td colSpan={2} className="text-center text-muted py-4">
                  Bạn chưa sở hữu khách sạn nào.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </>
  )
}
