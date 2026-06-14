import { useState } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { createReview } from '../services/reviewService'

/** Modal viết đánh giá sau khi lưu trú (chọn sao + bình luận) */
export default function ReviewModal({ show, onHide, booking, hotelName, user, onSubmitted }) {
  const [rating, setRating] = useState(5)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!booking) return null

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createReview({
        hotelId: booking.hotelId,
        userId: user.id,
        bookingId: booking.id,
        rating: Number(rating),
        comment: comment.trim(),
        reply: '',
        createdAt: new Date().toISOString(),
      })
      toast.success('Cảm ơn bạn đã đánh giá!')
      onSubmitted?.()
      onHide()
    } catch {
      toast.error('Gửi đánh giá thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={submit}>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">Đánh giá · {hotelName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="rv-stars" style={{ fontSize: 30, letterSpacing: 4, cursor: 'pointer' }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                style={{ color: n <= (hover || rating) ? '#9c7a4d' : '#d8d2c6' }}
              >
                ★
              </span>
            ))}
          </div>
          <Form.Control
            className="mt-3"
            as="textarea"
            rows={4}
            required
            placeholder="Chia sẻ cảm nhận của bạn về kỳ lưu trú…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>
            Hủy
          </Button>
          <Button type="submit" variant="dark" disabled={submitting}>
            {submitting ? 'Đang gửi…' : 'Gửi đánh giá'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
