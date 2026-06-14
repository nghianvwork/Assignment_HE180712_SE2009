import { useEffect, useState } from 'react'
import { Table, Form, Button, Modal, Row, Col } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { getUsers, createUser, updateUser, deleteUser } from '../../services/userService'
import ConfirmModal from '../../components/ConfirmModal'
import FormField from '../../components/FormField'

const ROLES = [
  { value: 'user', label: 'Khách hàng' },
  { value: 'manager', label: 'Quản lý' },
  { value: 'admin', label: 'Quản trị' },
]

const EMPTY = {
  username: '',
  password: '',
  fullName: '',
  email: '',
  phone: '',
  role: 'user',
  status: 'active',
}

/** Quản lý tài khoản: CRUD, tìm kiếm, phân vai trò, khóa/mở */
export default function AdminUsers() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [keyword, setKeyword] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [editing, setEditing] = useState(null) // null | {id?, ...form}
  const [deleting, setDeleting] = useState(null)

  const reload = () =>
    getUsers()
      .then(setUsers)
      .catch(() => toast.error('Không tải được danh sách tài khoản'))

  useEffect(() => {
    reload()
  }, [])

  const set = (key, value) => setEditing((f) => ({ ...f, [key]: value }))

  const handleRoleChange = async (u, role) => {
    try {
      await updateUser(u.id, { role })
      toast.success(`Đã đổi vai trò của ${u.username}`)
      reload()
    } catch {
      toast.error('Đổi vai trò thất bại')
    }
  }

  const handleToggleStatus = async (u) => {
    const status = u.status === 'banned' ? 'active' : 'banned'
    try {
      await updateUser(u.id, { status })
      toast.success(status === 'banned' ? `Đã khóa ${u.username}` : `Đã mở khóa ${u.username}`)
      reload()
    } catch {
      toast.error('Cập nhật trạng thái thất bại')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing.id) {
        // Cập nhật: chỉ đổi mật khẩu nếu có nhập mới
        const payload = {
          fullName: editing.fullName,
          email: editing.email,
          phone: editing.phone,
          role: editing.role,
        }
        if (editing.password) payload.password = editing.password
        await updateUser(editing.id, payload)
        toast.success('Đã cập nhật tài khoản')
      } else {
        const dup = users.some((u) => u.username === editing.username.trim())
        if (dup) {
          toast.error('Username đã tồn tại')
          return
        }
        await createUser({ ...editing, username: editing.username.trim() })
        toast.success('Đã tạo tài khoản mới')
      }
      setEditing(null)
      reload()
    } catch {
      toast.error('Lưu tài khoản thất bại')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteUser(deleting.id)
      toast.success(`Đã xóa tài khoản ${deleting.username}`)
      setDeleting(null)
      reload()
    } catch {
      toast.error('Xóa tài khoản thất bại')
    }
  }

  const filtered = users.filter((u) => {
    const kw = keyword.trim().toLowerCase()
    const matchKw =
      !kw ||
      [u.username, u.fullName, u.email].some((v) => v?.toLowerCase().includes(kw))
    return matchKw && (!roleFilter || u.role === roleFilter)
  })

  return (
    <>
      <div className="admin-head">
        <h1 className="admin-title">
          Tài khoản
          <small>{users.length} tài khoản trong hệ thống</small>
        </h1>
        <button className="admin-btn-primary" onClick={() => setEditing({ ...EMPTY })}>
          + Thêm tài khoản
        </button>
      </div>

      <div className="admin-filters">
        <Form.Control
          placeholder="Tìm theo tên, username, email..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Form.Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">Mọi vai trò</option>
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Form.Select>
      </div>

      <div className="admin-card">
        <Table className="admin-table" responsive>
          <thead>
            <tr>
              <th>Username</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const isMe = u.id === me?.id
              return (
                <tr key={u.id}>
                  <td>
                    {u.username} {isMe && <span className="badge-soft gold">Bạn</span>}
                  </td>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '—'}</td>
                  <td>
                    <Form.Select
                      size="sm"
                      value={u.role}
                      disabled={isMe}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                      style={{ maxWidth: 140 }}
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </Form.Select>
                  </td>
                  <td>
                    <span className={`badge-soft ${u.status === 'banned' ? 'red' : 'green'}`}>
                      {u.status === 'banned' ? 'Bị khóa' : 'Hoạt động'}
                    </span>
                  </td>
                  <td className="text-end">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      className="me-2"
                      onClick={() => setEditing({ ...EMPTY, ...u, password: '' })}
                    >
                      Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant={u.status === 'banned' ? 'outline-success' : 'outline-warning'}
                      disabled={isMe}
                      onClick={() => handleToggleStatus(u)}
                      className="me-2"
                    >
                      {u.status === 'banned' ? 'Mở khóa' : 'Khóa'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      disabled={isMe}
                      onClick={() => setDeleting(u)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              )
            })}
            {!filtered.length && (
              <tr>
                <td colSpan={7} className="text-center text-muted py-4">
                  Không tìm thấy tài khoản phù hợp.
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
              {editing?.id ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <FormField label="Username">
                  <Form.Control
                    required
                    disabled={!!editing?.id}
                    value={editing?.username || ''}
                    onChange={(e) => set('username', e.target.value)}
                  />
                </FormField>
              </Col>
              <Col md={6}>
                <FormField label={editing?.id ? 'Mật khẩu mới (bỏ trống nếu giữ nguyên)' : 'Mật khẩu'}>
                  <Form.Control
                    type="password"
                    required={!editing?.id}
                    value={editing?.password || ''}
                    onChange={(e) => set('password', e.target.value)}
                  />
                </FormField>
              </Col>
            </Row>
            <FormField label="Họ tên">
              <Form.Control
                required
                value={editing?.fullName || ''}
                onChange={(e) => set('fullName', e.target.value)}
              />
            </FormField>
            <Row>
              <Col md={7}>
                <FormField label="Email">
                  <Form.Control
                    required
                    type="email"
                    value={editing?.email || ''}
                    onChange={(e) => set('email', e.target.value)}
                  />
                </FormField>
              </Col>
              <Col md={5}>
                <FormField label="Số điện thoại">
                  <Form.Control
                    value={editing?.phone || ''}
                    onChange={(e) => set('phone', e.target.value)}
                  />
                </FormField>
              </Col>
            </Row>
            <FormField label="Vai trò">
              <Form.Select
                value={editing?.role || 'user'}
                onChange={(e) => set('role', e.target.value)}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Form.Select>
            </FormField>
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
        title="Xóa tài khoản"
        message={`Xóa vĩnh viễn tài khoản "${deleting?.username}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onHide={() => setDeleting(null)}
      />
    </>
  )
}
