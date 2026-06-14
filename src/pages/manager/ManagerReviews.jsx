import { useEffect, useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { getReviews, updateReview } from '../../services/reviewService'
import { getUsers } from '../../services/userService'
import { useOwnedHotels } from './useOwnedHotels'

const stars = (n) => '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n))

/** Xem & trả lời đánh giá của khách cho khách sạn manager sở hữu */
export default function ManagerReviews() {
  const { hotels, hotelIds, loading } = useOwnedHotels()
  const [reviews, setReviews] = useState([])
  const [users, setUsers] = useState([])
  const [drafts, setDrafts] = useState({}) // { [reviewId]: text }

  const reload = () => {
    const ids = new Set(hotelIds)
    return getReviews()
      .then((all) => {
        const mine = all.filter((r) => ids.has(r.hotelId))
        setReviews(mine)
        setDrafts(Object.fromEntries(mine.map((r) => [r.id, r.reply || ''])))
      })
      .catch(() => toast.error('Không tải được đánh giá'))
  }

  useEffect(() => {
    if (loading) return
    reload()
    getUsers().then(setUsers).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hotels])

  const userById = Object.fromEntries(users.map((u) => [u.id, u]))
  const hotelById = Object.fromEntries(hotels.map((h) => [h.id, h]))

  const saveReply = async (review) => {
    try {
      await updateReview(review.id, { reply: (drafts[review.id] || '').trim() })
      toast.success('Đã lưu phản hồi')
      reload()
    } catch {
      toast.error('Lưu phản hồi thất bại')
    }
  }

  const sorted = [...reviews].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  return (
    <>
      <div className="admin-head">
        <h1 className="admin-title">
          Đánh giá
          <small>{reviews.length} đánh giá — trả lời cảm nhận của khách</small>
        </h1>
      </div>

      {sorted.map((r) => {
        const guest = userById[r.userId]
        return (
          <div className="admin-card mb-3 p-3" key={r.id}>
            <div className="d-flex justify-content-between flex-wrap gap-2">
              <div>
                <strong>{guest?.fullName || 'Khách'}</strong>
                <span className="text-muted small ms-2">{hotelById[r.hotelId]?.name}</span>
              </div>
              <div style={{ color: 'var(--c-gold, #9c7a4d)', letterSpacing: 2 }}>
                {stars(r.rating)}
              </div>
            </div>
            <p className="mb-2 mt-2">{r.comment}</p>
            <div className="text-muted small mb-2">
              {new Date(r.createdAt).toLocaleDateString('vi-VN')}
            </div>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Viết phản hồi cho khách..."
              value={drafts[r.id] ?? ''}
              onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
            />
            <div className="text-end mt-2">
              <Button
                size="sm"
                variant="dark"
                onClick={() => saveReply(r)}
                disabled={(drafts[r.id] ?? '') === (r.reply || '')}
              >
                {r.reply ? 'Cập nhật phản hồi' : 'Gửi phản hồi'}
              </Button>
            </div>
          </div>
        )
      })}

      {!sorted.length && (
        <div className="admin-card p-4 text-center text-muted">Chưa có đánh giá nào.</div>
      )}
    </>
  )
}
