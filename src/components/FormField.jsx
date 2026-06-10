import { Form } from 'react-bootstrap'

/** Form.Group + Label gọn cho các form quản trị */
export default function FormField({ label, children, className = 'mb-3' }) {
  return (
    <Form.Group className={className}>
      <Form.Label className="admin-form-label">{label}</Form.Label>
      {children}
    </Form.Group>
  )
}
