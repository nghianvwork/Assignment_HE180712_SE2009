import { useEffect, useState } from 'react'
import { Table, Form, Button, Modal, Row, Col } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { getHotels, createHotel, updateHotel, deleteHotel } from '../../services/hotelService'
import { getUsers } from '../../services/userService'
import ConfirmModal from '../../components/ConfirmModal'
import FormField from '../../components/FormField'

const EMPTY = {
  name: '',
  ownerId: '',
  address: '',
  city: '',
  image: '',
  description: '',
  rating: 4.5,
  status: 'active',
}

/** Quản lý toàn bộ khách sạn: CRUD + gán chủ sở hữu (manager) */
export default function AdminHotels() {
  const [hotels, setHotels] = useState([])
  const [managers, setManagers] = useState([])
  const [editing, setEditing] = useState(null) // null | {id?, ...form}
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...editing, rating: Number(editing.rating) || 0 }
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

  const managerName = (id) => managers.find((m) => m.id === id)?.fullName || '—'

  return (
    <>
      <div className="admin-head">
        <h1 className="admin-title">
          Khách sạn
          <small>{hotels.length} khách sạn trong hệ thống</small>
        </h1>
        <button className="admin-btn-primary" onClick={() => setEditing({ ...EMPTY })}>
          + Thêm khách sạn
        </button>
      </div>

      <div className="admin-card">
        <Table className="admin-table" responsive>
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên khách sạn</th>
              <th>Thành phố</th>
              <th>Chủ sở hữu</th>
              <th>Đánh giá</th>
              <th>Trạng thái</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((h) => (
              <tr key={h.id}>
                <td>
                  <img src={h.image} alt={h.name} className="admin-thumb" />
                </td>
                <td>
                  <strong>{h.name}</strong>
                  <div className="text-muted small">{h.address}</div>
                </td>
                <td>{h.city}</td>
                <td>{managerName(h.ownerId)}</td>
                <td>★ {h.rating}</td>
                <td>
                  <span className={`badge-soft ${h.status === 'active' ? 'green' : 'gray'}`}>
                    {h.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                  </span>
                </td>
                <td className="text-end">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    className="me-2"
                    onClick={() => setEditing({ ...EMPTY, ...h })}
                  >
                    Sửa
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => setDeleting(h)}>
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
            {!hotels.length && (
              <tr>
                <td colSpan={7} className="text-center text-muted py-4">
                  Chưa có khách sạn nào.
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
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Tạm ngưng</option>
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
