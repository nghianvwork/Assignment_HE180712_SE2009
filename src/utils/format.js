/** Định dạng số tiền VND, ví dụ 1200000 -> "1.200.000₫" */
export function formatVND(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0)
}
