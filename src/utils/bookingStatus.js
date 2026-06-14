// Cấu hình trạng thái booking dùng chung — vòng đời:
// pending → confirmed → checked_in → checked_out
//   ├─ pending  → rejected (manager từ chối)
//   └─ confirmed/pending → cancelled (hủy / hoàn tiền)

export const BOOKING_STATUS = {
  pending: { cls: 'amber', label: 'Chờ duyệt' },
  confirmed: { cls: 'green', label: 'Đã xác nhận' },
  rejected: { cls: 'red', label: 'Bị từ chối' },
  checked_in: { cls: 'gold', label: 'Đã nhận phòng' },
  checked_out: { cls: 'gray', label: 'Đã trả phòng' },
  cancelled: { cls: 'red', label: 'Đã hủy' },
}

// Các trạng thái được tính vào doanh thu thực tế
export const REVENUE_STATUSES = ['confirmed', 'checked_in', 'checked_out']

// Trạng thái yêu cầu hoàn tiền (gắn trên field booking.refundStatus)
export const REFUND_STATUS = {
  requested: { cls: 'amber', label: 'Chờ hoàn tiền' },
  refunded: { cls: 'green', label: 'Đã hoàn tiền' },
  denied: { cls: 'gray', label: 'Từ chối hoàn' },
}
