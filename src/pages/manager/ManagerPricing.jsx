import { useEffect, useState } from 'react'
import { Table, Form, Button, Modal, Row, Col } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { getRooms } from '../../services/roomService'
import {
  getPricingRules,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
} from '../../services/pricingService'
import { formatVND } from '../../utils/format'
import ConfirmModal from '../../components/ConfirmModal'
import FormField from '../../components/FormField'
import { useOwnedHotels } from './useOwnedHotels'

const EMPTY = {
  hotelId: '',
  roomId: '',
  label: '',
  startDate: '',
  endDate: '',
  price: 0,
}

/** Cấu hình giá theo mùa/ngày (dynamic pricing) cho phòng của khách sạn manager sở hữu */
export default function ManagerPricing() {
  const { hotels, hotelIds, loading } = useOwnedHotels()
  const [rooms, setRooms] = useState([])
  const [rules, setRules] = useState([])
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const reloadRules = () => {
    const ids = new Set(hotelIds)
    return getPricingRules()
      .then((all) => setRules(all.filter((r) => ids.has(r.hotelId))))
      .catch(() => toast.error('Không tải được bảng giá'))
  }

  useEffect(() => {
    if (loading) return
    const ids = new Set(hotelIds)
    getRooms()
      .then((all) => setRooms(all.filter((r) => ids.has(r.hotelId))))
      .catch(() => {})
    reloadRules()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hotels])

  const roomById = Object.fromEntries(rooms.map((r) => [r.id, r]))
  const hotelById = Object.fromEntries(hotels.map((h) => [h.id, h]))

  const set = (key, value) => setEditing((f) => ({ ...f, [key]: value }))

  // Chọn phòng -> tự suy ra hotelId từ phòng
  const onRoom = (roomId) => {
    const room = roomById[roomId]
    setEditing((f) => ({ ...f, roomId, hotelId: room?.hotelId || '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editing.startDate > editing.endDate) {
      toast.error('Ngày bắt đầu phải trước ngày kết thúc')
      return
    }
    const payload = { ...editing, price: Number(editing.price) || 0 }
    try {
      if (editing.id) {
        await updatePricingRule(editing.id, payload)
        toast.success('Đã cập nhật đợt giá')
      } else {
        await createPricingRule(payload)
        toast.success('Đã thêm đợt giá mới')
      }
      setEditing(null)
      reloadRules()
    } catch {
      toast.error('Lưu đợt giá thất bại')
    }
  }

  const handleDelete = async () => {
    try {
      await deletePricingRule(deleting.id)
      toast.success('Đã xóa đợt giá')
      setDeleting(null)
      reloadRules()
    } catch {
      toast.error('Xóa đợt giá thất bại')
    }
  }

  const sorted = [...rules].sort((a, b) => a.startDate.localeCompare(b.startDate))

  return (
    <>
      <div className="admin-head">
        <h1 className="admin-title">
          Giá theo mùa
          <small>Cấu hình giá đặc biệt theo khoảng ngày — ghi đè giá gốc của phòng</small>
        </h1>
        <button
          className="admin-btn-primary"
          onClick={() => setEditing({ ...EMPTY })}
          disabled={!rooms.length}
        >
          + Thêm đợt giá
        </button>
      </div>

      <div className="admin-card">
        <Table className="admin-table" responsive>
          <thead>
            <tr>
              <th>Phòng</th>
              <th>Đợt giá</th>
              <th>Khoảng ngày</th>
              <th>Giá gốc</th>
              <th>Giá áp dụng</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const room = roomById[r.roomId]
              return (
                <tr key={r.id}>
                  <td>
                    <strong>{room?.name || '—'}</strong>
                    <div className="text-muted small">{hotelById[r.hotelId]?.name}</div>
                  </td>
                  <td>{r.label}</td>
                  <td>
                    {r.startDate} → {r.endDate}
                  </td>
                  <td className="text-muted">{room ? formatVND(room.price) : '—'}</td>
                  <td>
                    <strong>{formatVND(r.price)}</strong>
                  </td>
                  <td className="text-end">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      className="me-2"
                      onClick={() => setEditing({ ...EMPTY, ...r })}
                    >
                      Sửa
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => setDeleting(r)}>
                      Xóa
                    </Button>
                  </td>
                </tr>
              )
            })}
            {!sorted.length && (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  Chưa có đợt giá nào. Giá phòng sẽ dùng giá gốc.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal thêm / sửa */}
      <Modal show={!!editing} onHide={() => setEditing(null)} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title className="fs-5">
              {editing?.id ? 'Cập nhật đợt giá' : 'Thêm đợt giá mới'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormField label="Phòng">
              <Form.Select required value={editing?.roomId || ''} onChange={(e) => onRoom(e.target.value)}>
                <option value="">— Chọn phòng —</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {hotelById[r.hotelId]?.name}
                  </option>
                ))}
              </Form.Select>
            </FormField>
            <FormField label="Tên đợt giá">
              <Form.Control
                required
                placeholder="VD: Cao điểm hè, Lễ Tết..."
                value={editing?.label || ''}
                onChange={(e) => set('label', e.target.value)}
              />
            </FormField>
            <Row>
              <Col md={6}>
                <FormField label="Từ ngày">
                  <Form.Control
                    required
                    type="date"
                    value={editing?.startDate || ''}
                    onChange={(e) => set('startDate', e.target.value)}
                  />
                </FormField>
              </Col>
              <Col md={6}>
                <FormField label="Đến ngày">
                  <Form.Control
                    required
                    type="date"
                    value={editing?.endDate || ''}
                    onChange={(e) => set('endDate', e.target.value)}
                  />
                </FormField>
              </Col>
            </Row>
            <FormField label="Giá áp dụng (VND / đêm)">
              <Form.Control
                required
                type="number"
                min="0"
                step="10000"
                value={editing?.price ?? 0}
                onChange={(e) => set('price', e.target.value)}
              />
            </FormField>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setEditing(null)}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="dark">
              {editing?.id ? 'Lưu thay đổi' : 'Thêm mới'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal
        show={!!deleting}
        title="Xóa đợt giá"
        message={`Xóa đợt giá "${deleting?.label}"?`}
        onConfirm={handleDelete}
        onHide={() => setDeleting(null)}
      />
    </>
  )
}
