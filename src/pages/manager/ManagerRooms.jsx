import { useEffect, useState } from 'react'
import { Table, Form, Button, Modal, Row, Col } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { getRooms, createRoom, updateRoom, deleteRoom } from '../../services/roomService'
import { formatVND } from '../../utils/format'
import ConfirmModal from '../../components/ConfirmModal'
import FormField from '../../components/FormField'
import { useOwnedHotels } from './useOwnedHotels'

const ROOM_TYPES = ['Standard', 'Superior', 'Deluxe', 'Suite']

const EMPTY = {
  hotelId: '',
  name: '',
  type: 'Standard',
  price: 500000,
  image: '',
  description: '',
  capacity: 2,
  bedType: '',
  size: 25,
  available: true,
  amenities: '',
}

/** Quản lý phòng — chỉ trong các khách sạn manager sở hữu */
export default function ManagerRooms() {
  const { hotels, hotelIds, loading } = useOwnedHotels()
  const [rooms, setRooms] = useState([])
  const [hotelFilter, setHotelFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const reload = () => {
    const ids = new Set(hotelIds)
    return getRooms()
      .then((all) => setRooms(all.filter((r) => ids.has(r.hotelId))))
      .catch(() => toast.error('Không tải được danh sách phòng'))
  }

  useEffect(() => {
    if (!loading) reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hotels])

  const set = (key, value) => setEditing((f) => ({ ...f, [key]: value }))
  const hotelName = (id) => hotels.find((h) => h.id === id)?.name || '—'

  // Mở form: amenities array -> chuỗi phân tách bằng dấu phẩy; mặc định hotel đầu tiên
  const openForm = (room) =>
    setEditing(
      room
        ? { ...room, amenities: (room.amenities || []).join(', ') }
        : { ...EMPTY, hotelId: hotelIds[0] || '' }
    )

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Chặn lưu phòng vào khách sạn không thuộc quyền sở hữu
    if (!hotelIds.includes(editing.hotelId)) {
      toast.error('Bạn chỉ có thể thêm phòng cho khách sạn của mình')
      return
    }
    const payload = {
      ...editing,
      price: Number(editing.price) || 0,
      capacity: Number(editing.capacity) || 1,
      size: Number(editing.size) || 0,
      amenities: editing.amenities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
    }
    try {
      if (editing.id) {
        await updateRoom(editing.id, payload)
        toast.success('Đã cập nhật phòng')
      } else {
        await createRoom(payload)
        toast.success('Đã thêm phòng mới')
      }
      setEditing(null)
      reload()
    } catch {
      toast.error('Lưu phòng thất bại')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteRoom(deleting.id)
      toast.success(`Đã xóa "${deleting.name}"`)
      setDeleting(null)
      reload()
    } catch {
      toast.error('Xóa phòng thất bại')
    }
  }

  const filtered = hotelFilter ? rooms.filter((r) => r.hotelId === hotelFilter) : rooms

  return (
    <>
      <div className="admin-head">
        <h1 className="admin-title">
          Phòng
          <small>{rooms.length} phòng trong khách sạn của bạn</small>
        </h1>
        <button
          className="admin-btn-primary"
          onClick={() => openForm(null)}
          disabled={!hotels.length}
        >
          + Thêm phòng
        </button>
      </div>

      {hotels.length > 1 && (
        <div className="admin-filters">
          <Form.Select value={hotelFilter} onChange={(e) => setHotelFilter(e.target.value)}>
            <option value="">Mọi khách sạn của tôi</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </Form.Select>
        </div>
      )}

      <div className="admin-card">
        <Table className="admin-table" responsive>
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên phòng</th>
              <th>Khách sạn</th>
              <th>Loại</th>
              <th>Giá / đêm</th>
              <th>Sức chứa</th>
              <th>Tình trạng</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>
                  <img src={r.image} alt={r.name} className="admin-thumb" />
                </td>
                <td>
                  <strong>{r.name}</strong>
                  <div className="text-muted small">
                    {r.bedType} · {r.size}m²
                  </div>
                </td>
                <td>{hotelName(r.hotelId)}</td>
                <td>{r.type}</td>
                <td>{formatVND(r.price)}</td>
                <td>{r.capacity} khách</td>
                <td>
                  <span className={`badge-soft ${r.available ? 'green' : 'gray'}`}>
                    {r.available ? 'Còn trống' : 'Hết phòng'}
                  </span>
                </td>
                <td className="text-end">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    className="me-2"
                    onClick={() => openForm(r)}
                  >
                    Sửa
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => setDeleting(r)}>
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={8} className="text-center text-muted py-4">
                  Không có phòng nào.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal thêm / sửa */}
      <Modal show={!!editing} onHide={() => setEditing(null)} centered size="lg">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title className="fs-5">
              {editing?.id ? 'Cập nhật phòng' : 'Thêm phòng mới'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={7}>
                <FormField label="Tên phòng">
                  <Form.Control
                    required
                    value={editing?.name || ''}
                    onChange={(e) => set('name', e.target.value)}
                  />
                </FormField>
              </Col>
              <Col md={5}>
                <FormField label="Khách sạn">
                  <Form.Select
                    required
                    value={editing?.hotelId || ''}
                    onChange={(e) => set('hotelId', e.target.value)}
                  >
                    <option value="">— Chọn khách sạn —</option>
                    {hotels.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </Form.Select>
                </FormField>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <FormField label="Loại phòng">
                  <Form.Select
                    value={editing?.type || 'Standard'}
                    onChange={(e) => set('type', e.target.value)}
                  >
                    {ROOM_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </Form.Select>
                </FormField>
              </Col>
              <Col md={4}>
                <FormField label="Giá / đêm (VND)">
                  <Form.Control
                    required
                    type="number"
                    min="0"
                    step="10000"
                    value={editing?.price ?? 0}
                    onChange={(e) => set('price', e.target.value)}
                  />
                </FormField>
              </Col>
              <Col md={2}>
                <FormField label="Sức chứa">
                  <Form.Control
                    type="number"
                    min="1"
                    value={editing?.capacity ?? 2}
                    onChange={(e) => set('capacity', e.target.value)}
                  />
                </FormField>
              </Col>
              <Col md={2}>
                <FormField label="Diện tích m²">
                  <Form.Control
                    type="number"
                    min="0"
                    value={editing?.size ?? 25}
                    onChange={(e) => set('size', e.target.value)}
                  />
                </FormField>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormField label="Loại giường">
                  <Form.Control
                    required
                    placeholder="VD: 1 giường King"
                    value={editing?.bedType || ''}
                    onChange={(e) => set('bedType', e.target.value)}
                  />
                </FormField>
              </Col>
              <Col md={6}>
                <FormField label="Ảnh (URL)">
                  <Form.Control
                    required
                    type="url"
                    value={editing?.image || ''}
                    onChange={(e) => set('image', e.target.value)}
                  />
                </FormField>
              </Col>
            </Row>
            <FormField label="Mô tả">
              <Form.Control
                as="textarea"
                rows={2}
                value={editing?.description || ''}
                onChange={(e) => set('description', e.target.value)}
              />
            </FormField>
            <FormField label="Tiện nghi (phân tách bằng dấu phẩy)">
              <Form.Control
                placeholder="WiFi miễn phí, Điều hòa, Smart TV"
                value={editing?.amenities || ''}
                onChange={(e) => set('amenities', e.target.value)}
              />
            </FormField>
            <Form.Check
              type="switch"
              id="room-available"
              label="Phòng đang mở cho đặt"
              checked={!!editing?.available}
              onChange={(e) => set('available', e.target.checked)}
            />
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
        title="Xóa phòng"
        message={`Xóa phòng "${deleting?.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onHide={() => setDeleting(null)}
      />
    </>
  )
}
