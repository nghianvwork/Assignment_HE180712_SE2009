import { Modal, Button } from 'react-bootstrap'

/**
 * Modal xác nhận hành động nguy hiểm (xóa, khóa tài khoản...).
 * Dùng chung cho các trang quản trị.
 */
export default function ConfirmModal({
  show,
  title = 'Xác nhận',
  message,
  confirmLabel = 'Xóa',
  variant = 'danger',
  onConfirm,
  onHide,
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-5">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Hủy bỏ
        </Button>
        <Button variant={variant} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
