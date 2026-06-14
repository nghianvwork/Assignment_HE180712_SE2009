import { useEffect, useState } from 'react'
import { Table, Form, Button, Modal, Row, Col } from 'react-bootstrap'
import { toast } from 'react-toastify'
import {
  getVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from '../../services/voucherService'
import { formatVND } from '../../utils/format'
import ConfirmModal from '../../components/ConfirmModal'
import FormField from '../../components/FormField'
import { useOwnedHotels } from './useOwnedHotels'

const EMPTY = {
  hotelId: '',
  code: '',
  description: '',
  discountType: 'percent',
  discountValue: 10,
  startDate: '',
  endDate: '',
  maxUses: 100,
  used: 0,
  active: true,
}

const discountText = (v) =>
  v.discountType === 'percent' ? `${v.discountValue}%` : formatVND(v.discountValue)

/** Quản lý khuyến mãi/voucher riêng cho khách sạn manager sở hữu */
export default function ManagerVouchers() {
  const { hotels, hotelIds, loading } = useOwnedHotels()
  const [vouchers, setVouchers] = useState([])
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const reload = () => {
    const ids = new Set(hotelIds)
    return getVouchers()
      .then((all) => setVouchers(all.filter((v) => ids.has(v.hotelId))))
      .catch(() => toast.error('Không tải được danh sách khuyến mãi'))
  }

  useEffect(() => {
    if (!loading) reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hotels])

  const set = (key, value) => setEditing((f) => ({ ...f, [key]: value }))
  const hotelName = (id) => hotels.find((h) => h.id === id)?.name || '—'

  const openForm = (v) =>
    setEditing(v ? { ...EMPTY, ...v } : { ...EMPTY, hotelId: hotelIds[0] || '' })

  const toggleActive = (v) =>
    updateVoucher(v.id, { active: !v.active })
      .then(() => {
        toast.success(v.active ? `Đã tắt ${v.code}` : `Đã bật ${v.code}`)
        reload()
      })
      .catch(() => toast.error('Cập nhật thất bại'))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!hotelIds.includes(editing.hotelId)) {
      toast.error('Bạn chỉ có thể tạo khuyến mãi cho khách sạn của mình')
      return
    }
    if (editing.startDate > editing.endDate) {
      toast.error('Ngày bắt đầu phải trước ngày kết thúc')
      return
    }
    const payload = {
      ...editing,
      code: editing.code.trim().toUpperCase(),
      discountValue: Number(editing.discountValue) || 0,
      maxUses: Number(editing.maxUses) || 0,
      used: Number(editing.used) || 0,
    }
    try {
      if (editing.id) {
        await updateVoucher(editing.id, payload)
        toast.success('Đã cập nhật khuyến mãi')
      } else {
        await createVoucher(payload)
        toast.success('Đã tạo khuyến mãi mới')
      }
      setEditing(null)
      reload()
    } catch {
      toast.error('Lưu khuyến mãi thất bại')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteVoucher(deleting.id)
      toast.success(`Đã xóa ${deleting.code}`)
      setDeleting(null)
      reload()
    } catch {
      toast.error('Xóa khuyến mãi thất bại')
    }
  }

  return (
    <>
      <div className="admin-head">
        <h1 className="admin-title">
          Khuyến mãi
          <small>{vouchers.length} mã giảm giá cho khách sạn của bạn</small>
        </h1>
        <button
          className="admin-btn-primary"
          onClick={() => openForm(null)}
          disabled={!hotels.length}
        >
          + Tạo khuyến mãi
        </button>
      </div>

      <div className="admin-card">
        <Table className="admin-table" responsive>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Mô tả</th>
              <th>Khách sạn</th>
              <th>Giảm</th>
              <th>Hiệu lực</th>
              <th>Lượt dùng</th>
              <th>Trạng thái</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((v) => (
              <tr key={v.id}>
                <td>
                  <strong>{v.code}</strong>
                </td>
                <td className="text-muted small">{v.description}</td>
                <td>{hotelName(v.hotelId)}</td>
                <td>
                  <strong>{discountText(v)}</strong>
                </td>
                <td>
                  {v.startDate} → {v.endDate}
                </td>
                <td>
                  {v.used} / {v.maxUses}
                </td>
                <td>
                  <span className={`badge-soft ${v.active ? 'green' : 'gray'}`}>
                    {v.active ? 'Đang chạy' : 'Đã tắt'}
                  </span>
                </td>
                <td className="text-end">
                  <Button
                    size="sm"
                    variant={v.active ? 'outline-warning' : 'outline-success'}
                    className="me-2"
                    onClick={() => toggleActive(v)}
                  >
                    {v.active ? 'Tắt' : 'Bật'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    className="me-2"
                    onClick={() => openForm(v)}
                  >
                    Sửa
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => setDeleting(v)}>
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
            {!vouchers.length && (
              <tr>
                <td colSpan={8} className="text-center text-muted py-4">
                  Chưa có khuyến mãi nào.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal tạo / sửa */}
      <Modal show={!!editing} onHide={() => setEditing(null)} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title className="fs-5">
              {editing?.id ? 'Cập nhật khuyến mãi' : 'Tạo khuyến mãi mới'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <FormField label="Mã khuyến mãi">
                  <Form.Control
                    required
                    placeholder="VD: SUMMER10"
                    value={editing?.code || ''}
                    onChange={(e) => set('code', e.target.value)}
                  />
                </FormField>
              </Col>
              <Col md={6}>
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
            <FormField label="Mô tả">
              <Form.Control
                value={editing?.description || ''}
                onChange={(e) => set('description', e.target.value)}
              />
            </FormField>
            <Row>
              <Col md={6}>
                <FormField label="Loại giảm">
                  <Form.Select
                    value={editing?.discountType || 'percent'}
                    onChange={(e) => set('discountType', e.target.value)}
                  >
                    <option value="percent">Phần trăm (%)</option>
                    <option value="amount">Số tiền (VND)</option>
                  </Form.Select>
                </FormField>
              </Col>
              <Col md={6}>
                <FormField label={editing?.discountType === 'amount' ? 'Giá trị (VND)' : 'Giá trị (%)'}>
                  <Form.Control
                    required
                    type="number"
                    min="0"
                    value={editing?.discountValue ?? 0}
                    onChange={(e) => set('discountValue', e.target.value)}
                  />
                </FormField>
              </Col>
            </Row>
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
            <FormField label="Số lượt tối đa">
              <Form.Control
                type="number"
                min="0"
                value={editing?.maxUses ?? 0}
                onChange={(e) => set('maxUses', e.target.value)}
              />
            </FormField>
            <Form.Check
              type="switch"
              id="voucher-active"
              label="Đang áp dụng"
              checked={!!editing?.active}
              onChange={(e) => set('active', e.target.checked)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setEditing(null)}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="dark">
              {editing?.id ? 'Lưu thay đổi' : 'Tạo mới'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal
        show={!!deleting}
        title="Xóa khuyến mãi"
        message={`Xóa mã "${deleting?.code}"?`}
        onConfirm={handleDelete}
        onHide={() => setDeleting(null)}
      />
    </>
  )
}
