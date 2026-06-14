import { useEffect, useState } from 'react'
import { Table, Form, Button, Modal, Row, Col } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { getHotels, createHotel, updateHotel, deleteHotel } from '../../services/hotelService'
import ConfirmModal from '../../components/ConfirmModal'
import FormField from '../../components/FormField'

const HOTEL_STATUS = {
  pending: { cls: 'amber', label: 'Chờ duyệt' },
  active: { cls: 'green', label: 'Đang hoạt động' },
  rejected: { cls: 'red', label: 'Bị từ chối' },
  suspended: { cls: 'red', label: 'Tạm ngưng (vi phạm)' },
  inactive: { cls: 'gray', label: 'Ngừng hoạt động' },
}

const EMPTY = {
  name: '',
  address: '',
  city: '',
  image: '',
  description: '',
  amenities: '',
  policy: '',
}

/** Manager đăng ký & CRUD khách sạn của mình. Khách sạn mới ở trạng thái chờ admin duyệt. */
export default function ManagerHotels() {
  const { user } = useAuth()
  const [hotels, setHotels] = useState([])
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const reload = () =>
    getHotels({ ownerId: user.id })
      .then(setHotels)
      .catch(() => toast.error('Không tải được danh sách khách sạn'))

  useEffect(() => {
    if (user?.id) reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const set = (key, value) => setEditing((f) => ({ ...f, [key]: value }))

  // Mở form: amenities array -> chuỗi để dễ nhập
  const openForm = (hotel) =>
    setEditing(
      hotel
        ? { ...EMPTY, ...hotel, amenities: (hotel.amenities || []).join(', ') }
        : { ...EMPTY }
    )

  const handleSubmit = async (e) => {
    e.preventDefault()
    const amenities = editing.amenities
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean)
    try {
      if (editing.id) {
        // Manager không tự đổi trạng thái duyệt — giữ nguyên status & ownerId hiện có
        await updateHotel(editing.id, {
          name: editing.name,
          address: editing.address,
          city: editing.city,
          image: editing.image,
          description: editing.description,
          policy: editing.policy,
          amenities,
        })
        toast.success('Đã cập nhật thông tin khách sạn')
      } else {
        await createHotel({
          name: editing.name,
          ownerId: user.id,
          address: editing.address,
          city: editing.city,
          image: editing.image,
          description: editing.description,
          policy: editing.policy,
          amenities,
          rating: 0,
          status: 'pending',
        })
        toast.success('Đã gửi đăng ký khách sạn — chờ admin duyệt')
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

  return (
    <>
      <div className="admin-head">
        <h1 className="admin-title">
          Khách sạn của tôi
          <small>{hotels.length} khách sạn — đăng ký mới sẽ chờ admin duyệt</small>
        </h1>
        <button className="admin-btn-primary" onClick={() => openForm(null)}>
          + Đăng ký khách sạn
        </button>
      </div>

      <div className="admin-card">
        <Table className="admin-table" responsive>
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên khách sạn</th>
              <th>Thành phố</th>
              <th>Tiện ích</th>
              <th>Trạng thái</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((h) => {
              const badge = HOTEL_STATUS[h.status] || HOTEL_STATUS.pending
              return (
                <tr key={h.id}>
                  <td>
                    <img src={h.image} alt={h.name} className="admin-thumb" />
                  </td>
                  <td>
                    <strong>{h.name}</strong>
                    <div className="text-muted small">{h.address}</div>
                  </td>
                  <td>{h.city}</td>
                  <td className="text-muted small">{(h.amenities || []).length} tiện ích</td>
                  <td>
                    <span className={`badge-soft ${badge.cls}`}>{badge.label}</span>
                  </td>
                  <td className="text-end">
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
            {!hotels.length && (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  Bạn chưa có khách sạn nào. Bấm “Đăng ký khách sạn” để bắt đầu.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal đăng ký / sửa */}
      <Modal show={!!editing} onHide={() => setEditing(null)} centered size="lg">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title className="fs-5">
              {editing?.id ? 'Cập nhật khách sạn' : 'Đăng ký khách sạn mới'}
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
                <FormField label="Thành phố">
                  <Form.Control
                    required
                    value={editing?.city || ''}
                    onChange={(e) => set('city', e.target.value)}
                  />
                </FormField>
              </Col>
            </Row>
            <FormField label="Địa chỉ">
              <Form.Control
                required
                value={editing?.address || ''}
                onChange={(e) => set('address', e.target.value)}
              />
            </FormField>
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
                placeholder="Giờ nhận/trả phòng, chính sách hủy, quy định..."
                value={editing?.policy || ''}
                onChange={(e) => set('policy', e.target.value)}
              />
            </FormField>
            {!editing?.id && (
              <p className="text-muted small mb-0">
                Khách sạn mới sẽ ở trạng thái <strong>Chờ duyệt</strong> cho đến khi admin phê duyệt.
              </p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setEditing(null)}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="dark">
              {editing?.id ? 'Lưu thay đổi' : 'Gửi đăng ký'}
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
