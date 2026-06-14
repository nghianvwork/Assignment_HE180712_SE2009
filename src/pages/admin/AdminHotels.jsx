import { useEffect, useState } from 'react'
import { Table, Form, Button, Modal, Row, Col } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { getHotels, createHotel, updateHotel, deleteHotel } from '../../services/hotelService'
import { getUsers } from '../../services/userService'
import ConfirmModal from '../../components/ConfirmModal'
import FormField from '../../components/FormField'

const STATUS = {
  pending: { cls: 'amber', label: 'Chờ duyệt' },
  active: { cls: 'green', label: 'Hoạt động' },
  rejected: { cls: 'red', label: 'Bị từ chối' },
  suspended: { cls: 'red', label: 'Bị gỡ (vi phạm)' },
  inactive: { cls: 'gray', label: 'Ngừng hoạt động' },
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'rejected', label: 'Bị từ chối' },
  { value: 'suspended', label: 'Bị gỡ (vi phạm)' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
]

const EMPTY = {
  name: '',
  ownerId: '',
  address: '',
  city: '',
  image: '',
  description: '',
  amenities: '',
  policy: '',
  rating: 4.5,
  status: 'active',
}

/** Quản lý toàn bộ khách sạn: duyệt/từ chối đăng ký, gỡ vi phạm + CRUD */
export default function AdminHotels() {
  const [hotels, setHotels] = useState([])
  const [managers, setManagers] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const reload = () =>
    getHotels()
      .then(setHotels)
      .catch(() => toast.error('Không tải được danh sách khách sạn'))

  useEffect(() => {
    reload()
    getUsers({ role: 'manager' }).then(setManagers).catch(() => {})
  }, [])

  const set = (key, value) => setEditing((f) => ({ ...f, [key]: value }))
  const managerName = (id) => managers.find((m) => m.id === id)?.fullName || '—'

  const openForm = (hotel) =>
    setEditing(
      hotel
        ? { ...EMPTY, ...hotel, amenities: (hotel.amenities || []).join(', ') }
        : { ...EMPTY }
    )

  const changeStatus = async (hotel, status, msg) => {
    try {
      await updateHotel(hotel.id, { status })
      toast.success(msg)
      reload()
    } catch {
      toast.error('Cập nhật trạng thái thất bại')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...editing,
      rating: Number(editing.rating) || 0,
      amenities: editing.amenities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
    }
    try {
      if (editing.id) {
        await updateHotel(editing.id, payload)
        toast.success('Đã cập nhật khách sạn')
      } else {
        await createHotel(payload)
        toast.success('Đã thêm khách sạn mới')
      }
      setEditing(null)
      reload()
    } catch {
      toast.error('Lưu khách sạn thất bại')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteHotel(deleting.id)
      toast.success(`Đã xóa "${deleting.name}"`)
      setDeleting(null)
      reload()
    } catch {
      toast.error('Xóa khách sạn thất bại')
    }
  }

  const pendingCount = hotels.filter((h) => h.status === 'pending').length
  const filtered = statusFilter ? hotels.filter((h) => h.status === statusFilter) : hotels

  return (
    <>
      <div className="admin-head">
        <h1 className="admin-title">
          Khách sạn
          <small>
            {hotels.length} khách sạn{pendingCount ? ` · ${pendingCount} chờ duyệt` : ''}
          </small>
        </h1>
        <button className="admin-btn-primary" onClick={() => openForm(null)}>
          + Thêm khách sạn
        </button>
      </div>

      <div className="admin-filters">
        <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Mọi trạng thái</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Form.Select>
      </div>

      <div className="admin-card">
        <Table className="admin-table" responsive>
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên khách sạn</th>
              <th>Thành phố</th>
              <th>Chủ sở hữu</th>
              <th>Trạng thái</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((h) => {
              const badge = STATUS[h.status] || STATUS.pending
              return (
                <tr key={h.id}>
                  <td>
                    <img src={h.image} alt={h.name} className="admin-thumb" />
                  </td>
                  <td>
                    <strong>{h.name}</strong>
                    <div className="text-muted small">★ {h.rating} · {h.address}</div>
                  </td>
                  <td>{h.city}</td>
                  <td>{managerName(h.ownerId)}</td>
                  <td>
                    <span className={`badge-soft ${badge.cls}`}>{badge.label}</span>
                  </td>
                  <td className="text-end">
                    {h.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline-success"
                          className="me-2"
                          onClick={() => changeStatus(h, 'active', `Đã duyệt "${h.name}"`)}
                        >
                          Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="me-2"
                          onClick={() => changeStatus(h, 'rejected', `Đã từ chối "${h.name}"`)}
                        >
                          Từ chối
                        </Button>
                      </>
                    )}
                    {h.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline-warning"
                        className="me-2"
                        onClick={() => changeStatus(h, 'suspended', `Đã gỡ "${h.name}"`)}
                      >
                        Gỡ vi phạm
                      </Button>
                    )}
                    {['rejected', 'suspended', 'inactive'].includes(h.status) && (
                      <Button
                        size="sm"
                        variant="outline-success"
                        className="me-2"
                        onClick={() => changeStatus(h, 'active', `Đã khôi phục "${h.name}"`)}
                      >
                        Khôi phục
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      className="me-2"
                      onClick={() => openForm(h)}
                    >
                      Sửa
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => setDeleting(h)}>
                      Xóa
                    </Button>
                  </td>
                </tr>
              )
            })}
            {!filtered.length && (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  Không có khách sạn nào.
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
              {editing?.id ? 'Cập nhật khách sạn' : 'Thêm khách sạn mới'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={8}>
                <FormField label="Tên khách sạn">
                  <Form.Control
                    required
                    value={editing?.name || ''}
                    onChange={(e) => set('name', e.target.value)}
                  />
                </FormField>
              </Col>
              <Col md={4}>
                <FormField label="Chủ sở hữu">
                  <Form.Select
                    required
                    value={editing?.ownerId || ''}
                    onChange={(e) => set('ownerId', e.target.value)}
                  >
                    <option value="">— Chọn manager —</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName}
                      </option>
                    ))}
                  </Form.Select>
                </FormField>
              </Col>
            </Row>
            <Row>
              <Col md={8}>
                <FormField label="Địa chỉ">
                  <Form.Control
                    required
                    value={editing?.address || ''}
                    onChange={(e) => set('address', e.target.value)}
                  />
                </FormField>
              </Col>
              <Col md={4}>
                <FormField label="Thành phố">
                  <Form.Control
                    required
                    value={editing?.city || ''}
                    onChange={(e) => set('city', e.target.value)}
                  />
                </FormField>
              </Col>
            </Row>
            <FormField label="Ảnh (URL)">
              <Form.Control
                required
                type="url"
                value={editing?.image || ''}
                onChange={(e) => set('image', e.target.value)}
              />
            </FormField>
            <FormField label="Mô tả">
              <Form.Control
                as="textarea"
                rows={2}
                value={editing?.description || ''}
                onChange={(e) => set('description', e.target.value)}
              />
            </FormField>
            <FormField label="Tiện ích (phân tách bằng dấu phẩy)">
              <Form.Control
                placeholder="Hồ bơi, Spa, Nhà hàng, WiFi miễn phí"
                value={editing?.amenities || ''}
                onChange={(e) => set('amenities', e.target.value)}
              />
            </FormField>
            <FormField label="Chính sách">
              <Form.Control
                as="textarea"
                rows={2}
                value={editing?.policy || ''}
                onChange={(e) => set('policy', e.target.value)}
              />
            </FormField>
            <Row>
              <Col md={6}>
                <FormField label="Đánh giá (0–5)">
                  <Form.Control
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={editing?.rating ?? 4.5}
                    onChange={(e) => set('rating', e.target.value)}
                  />
                </FormField>
              </Col>
              <Col md={6}>
                <FormField label="Trạng thái">
                  <Form.Select
                    value={editing?.status || 'active'}
                    onChange={(e) => set('status', e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </Form.Select>
                </FormField>
              </Col>
            </Row>
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
        title="Xóa khách sạn"
        message={`Xóa "${deleting?.name}"? Phòng và dịch vụ thuộc khách sạn này sẽ không còn truy cập được.`}
        onConfirm={handleDelete}
        onHide={() => setDeleting(null)}
      />
    </>
  )
}
