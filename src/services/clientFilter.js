// json-server v1 ép kiểu giá trị query dạng số (vd id chuỗi "1" -> number 1),
// khiến lọc theo khóa ngoại id (hotelId, userId, ownerId...) bị lệch và trả về rỗng.
// Để chắc chắn & ổn định, ta lọc phía client theo đẳng thức (so sánh dạng chuỗi).
export function applyFilter(rows, params) {
  if (!params) return rows
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (!entries.length) return rows
  return rows.filter((r) => entries.every(([k, v]) => String(r[k]) === String(v)))
}
