import { useEffect, useState } from 'react'
import { Table, Form, Button, Modal, Row, Col } from 'react-bootstrap'
import { toast } from 'react-toastify'
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from '../../services/serviceService'
import { getHotels } from '../../services/hotelService'
import { formatVND } from '../../utils/format'
import ConfirmModal from '../../components/ConfirmModal'
import FormField from '../../components/FormField'

const EMPTY = {
  hotelId: '',
  name: '',
  price: 100000,
  image: '',
  description: '',
  available: true,
}

/** Quản lý toàn bộ dịch vụ: lọc theo khách sạn + CRUD */
export default function AdminServices() {
  const [services, setServices] = useState([])
  const [hotels, setHotels] = useState([])
  const [hotelFilter, setHotelFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const reload = () =>
    getServices()
      .then(setServices)
      .catch(() => toast.error('Không tải được danh sách dịch vụ'))

  useEffect(() => {
    reload()
    getHotels().then(setHotels).catch(() => {})
  }, [])

  const set = (key, value) => setEditing((f) => ({ ...f, [key]: value }))
  const hotelName = (id) => hotels.find((h) => h.id === id)?.name || '—'

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...editing, price: Number(editing.price) || 0 }
    try {
      if (editing.id) {
        await updateService(editing.id, payload)
        toast.success('Đã cập nhật dịch vụ')
      } else {
        await createService(payload)
        toast.success('Đã thêm dịch vụ mới')
      }
      setEditing(null)
      reload()
    } catch {
      toast.error('Lưu dịch vụ thất bại')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteService(deleting.id)
      toast.success(`Đã xóa "${deleting.name}"`)
      setDeleting(null)
      reload()
    } catch {
      toast.error('Xóa dịch vụ thất bại')
    }
  }

  const filtered = hotelFilter
    ? services.filter((s) => s.hotelId === hotelFilter)
    : services

  return (
    <>
      <div className="admin-head">
        <h1 className="admin-title">
          Dịch vụ
          <small>{services.length} dịch vụ trên toàn hệ thống</small>
        </h1>
        <button className="admin-btn-primary" onClick={() => setEditing({ ...EMPTY })}>
          + Thêm dịch vụ
        </button>
      </div>

      <div className="admin-filters">
        <Form.Select value={hotelFilter} onChange={(e) => setHotelFilter(e.target.value)}>
          <option value="">Mọi khách sạn</option>
          {hotels.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </Form.Select>
      </div>

      <div className="admin-card">
        <Table className="admin-table" responsive>
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên dịch vụ</th>
              <th>Khách sạn</th>
              <th>Giá</th>
              <th>Tình trạng</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>
                  <img src={s.image} alt={s.name} className="admin-thumb" />
                </td>
                <td>
                  <strong>{s.name}</strong>
                  <div className="text-muted small">{s.description}</div>
                </td>
                <td>{hotelName(s.hotelId)}</td>
                <td>{formatVND(s.price)}</td>
                <td>
                  <span className={`badge-soft ${s.available ? 'green' : 'gray'}`}>
                    {s.available ? 'Đang phục vụ' : 'Tạm ngưng'}
                  </span>
                </td>
                <td className="text-end">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    className="me-2"
                    onClick={() => setEditing({ ...EMPTY, ...s })}
                  >
                    Sửa
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => setDeleting(s)}>
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  Không có dịch vụ nào.
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
              {editing?.id ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormField label="Tên dịch vụ">
              <Form.Control
                required
                value={editing?.name || ''}
                onChange={(e) => set('name', e.target.value)}
              />
            </FormField>
            <Row>
              <Col md={7}>
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
              <Col md={5}>
                <FormField label="Giá (VND)">
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
            <Form.Check
              type="switch"
              id="service-available"
              label="Dịch vụ đang phục vụ"
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
        title="Xóa dịch vụ"
        message={`Xóa dịch vụ "${deleting?.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onHide={() => setDeleting(null)}
      />
    </>
  )
}
