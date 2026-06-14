import { useState } from 'react'
import { Modal, Form, Button, Row, Col } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { createBooking } from '../services/bookingService'
import { updateVoucher } from '../services/voucherService'
import { formatVND } from '../utils/format'
import { stayPrice, applyDiscount, isRangeAvailable } from '../utils/pricing'

const BLOCKING = ['pending', 'confirmed', 'checked_in', 'checked_out']
const pad = (n) => String(n).padStart(2, '0')
const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * Modal đặt phòng: kiểm tra phòng trống real-time, áp giá theo mùa từng đêm,
 * áp mã giảm giá/voucher, chọn phương thức thanh toán.
 */
export default function BookingModal({ show, onHide, hotel, room, rules, roomBookings, vouchers, user, onBooked }) {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)
  const [code, setCode] = useState('')
  const [voucher, setVoucher] = useState(null)
  const [payment, setPayment] = useState('online')
  const [submitting, setSubmitting] = useState(false)

  if (!room) return null

  const validRange = checkIn && checkOut && checkIn < checkOut
  const blocking = (roomBookings || []).filter((b) => BLOCKING.includes(b.status))
  const available = validRange ? isRangeAvailable(blocking, checkIn, checkOut) : true
  const { total: roomTotal, nights } = validRange
    ? stayPrice(room.price, rules, checkIn, checkOut)
    : { total: 0, nights: 0 }
  const { discount, final } = applyDiscount(roomTotal, voucher)

  const applyCode = () => {
    const v = (vouchers || []).find((x) => x.code === code.trim().toUpperCase())
    const td = today()
    if (!v) return toast.error('Mã không tồn tại')
    if (!v.active) return toast.error('Mã đã ngừng áp dụng')
    if (td < v.startDate || td > v.endDate) return toast.error('Mã không trong thời gian hiệu lực')
    if (v.used >= v.maxUses) return toast.error('Mã đã hết lượt sử dụng')
    setVoucher(v)
    toast.success(`Đã áp mã ${v.code}`)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validRange) return toast.error('Vui lòng chọn ngày nhận/trả hợp lệ')
    if (checkIn < today()) return toast.error('Ngày nhận phòng không thể ở quá khứ')
    if (guests > room.capacity) return toast.error(`Phòng chỉ chứa tối đa ${room.capacity} khách`)
    if (!available) return toast.error('Phòng đã có người đặt trong khoảng ngày này')
    setSubmitting(true)
    try {
      await createBooking({
        userId: user.id,
        hotelId: hotel.id,
        roomId: room.id,
        serviceIds: [],
        checkIn,
        checkOut,
        guests: Number(guests),
        nights,
        totalPrice: final,
        voucherCode: voucher?.code || '',
        paymentMethod: payment,
        status: 'pending',
        createdAt: new Date().toISOString(),
      })
      if (voucher) await updateVoucher(voucher.id, { used: (voucher.used || 0) + 1 }).catch(() => {})
      toast.success('Đặt phòng thành công! Xác nhận đã gửi qua email (mô phỏng).')
      onBooked?.()
      onHide()
    } catch {
      toast.error('Đặt phòng thất bại, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Form onSubmit={submit}>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">Đặt phòng · {room.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Label className="small text-muted">Nhận phòng</Form.Label>
              <Form.Control
                type="date"
                min={today()}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Label className="small text-muted">Trả phòng</Form.Label>
              <Form.Control
                type="date"
                min={checkIn || today()}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Label className="small text-muted">Số khách</Form.Label>
              <Form.Select value={guests} onChange={(e) => setGuests(+e.target.value)}>
                {Array.from({ length: room.capacity }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} khách
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {validRange && !available && (
            <p className="text-danger small mt-3 mb-0">
              ⚠ Phòng đã có người đặt trong khoảng ngày này. Vui lòng chọn ngày khác.
            </p>
          )}

          <div className="d-flex gap-2 mt-3">
            <Form.Control
              placeholder="Nhập mã giảm giá (nếu có)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button variant="outline-secondary" type="button" onClick={applyCode}>
              Áp dụng
            </Button>
          </div>

          <div className="mt-3">
            <Form.Label className="small text-muted d-block">Phương thức thanh toán</Form.Label>
            <Form.Check
              inline
              type="radio"
              name="pay"
              id="pay-online"
              label="Thanh toán online (VNPay/Momo/Stripe)"
              checked={payment === 'online'}
              onChange={() => setPayment('online')}
            />
            <Form.Check
              inline
              type="radio"
              name="pay"
              id="pay-hotel"
              label="Thanh toán tại khách sạn"
              checked={payment === 'hotel'}
              onChange={() => setPayment('hotel')}
            />
          </div>

          {validRange && available && (
            <div className="bm-summary mt-3">
              <div className="d-flex justify-content-between">
                <span>
                  {formatVND(room.price)} × {nights} đêm
                </span>
                <span>{formatVND(roomTotal)}</span>
              </div>
              {discount > 0 && (
                <div className="d-flex justify-content-between text-success">
                  <span>Giảm giá ({voucher.code})</span>
                  <span>− {formatVND(discount)}</span>
                </div>
              )}
              <hr className="my-2" />
              <div className="d-flex justify-content-between fw-bold">
                <span>Tổng cộng</span>
                <span>{formatVND(final)}</span>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>
            Hủy
          </Button>
          <Button type="submit" variant="dark" disabled={submitting || !validRange || !available}>
            {submitting ? 'Đang xử lý…' : 'Xác nhận đặt phòng'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
