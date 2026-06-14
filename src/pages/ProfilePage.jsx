import { useState } from 'react'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { getUserById, updateUser } from '../services/userService'
import './Profile.css'

const initials = (name = '') =>
  name
    .split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase()

/** Trang hồ sơ cá nhân: avatar, thông tin, đổi mật khẩu */
export default function ProfilePage() {
  const { user, updateCurrentUser } = useAuth()
  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  })
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [savingP, setSavingP] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const setP = (k, v) => setProfile((s) => ({ ...s, [k]: v }))
  const setW = (k, v) => setPw((s) => ({ ...s, [k]: v }))

  const saveProfile = async (e) => {
    e.preventDefault()
    setSavingP(true)
    try {
      await updateUser(user.id, profile)
      updateCurrentUser(profile)
      toast.success('Đã cập nhật hồ sơ')
    } catch {
      toast.error('Cập nhật thất bại')
    } finally {
      setSavingP(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (pw.next.length < 6) return toast.error('Mật khẩu mới tối thiểu 6 ký tự')
    if (pw.next !== pw.confirm) return toast.error('Xác nhận mật khẩu không khớp')
    setSavingPw(true)
    try {
      const record = await getUserById(user.id)
      if (record.password !== pw.current) {
        toast.error('Mật khẩu hiện tại không đúng')
        return
      }
      await updateUser(user.id, { password: pw.next })
      toast.success('Đã đổi mật khẩu')
      setPw({ current: '', next: '', confirm: '' })
    } catch {
      toast.error('Đổi mật khẩu thất bại')
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div className="profile-page">
      <Navbar />
      <div className="pf-wrap">
        <h1 className="pf-title">Hồ sơ của tôi</h1>

        <div className="pf-grid">
          {/* Thông tin cá nhân */}
          <section className="pf-card">
            <h2>Thông tin cá nhân</h2>
            <div className="pf-avatar-row">
              {profile.avatar ? (
                <img src={profile.avatar} alt="avatar" className="pf-avatar" />
              ) : (
                <div className="pf-avatar pf-avatar-fallback">{initials(profile.fullName)}</div>
              )}
              <div className="pf-avatar-field">
                <Form.Label className="small text-muted">Ảnh đại diện (URL)</Form.Label>
                <Form.Control
                  placeholder="https://…"
                  value={profile.avatar}
                  onChange={(e) => setP('avatar', e.target.value)}
                />
              </div>
            </div>
            <Form onSubmit={saveProfile}>
              <Form.Label className="small text-muted">Họ tên</Form.Label>
              <Form.Control
                className="mb-3"
                required
                value={profile.fullName}
                onChange={(e) => setP('fullName', e.target.value)}
              />
              <Row>
                <Col md={7}>
                  <Form.Label className="small text-muted">Email</Form.Label>
                  <Form.Control
                    className="mb-3"
                    type="email"
                    required
                    value={profile.email}
                    onChange={(e) => setP('email', e.target.value)}
                  />
                </Col>
                <Col md={5}>
                  <Form.Label className="small text-muted">Số điện thoại</Form.Label>
                  <Form.Control
                    className="mb-3"
                    value={profile.phone}
                    onChange={(e) => setP('phone', e.target.value)}
                  />
                </Col>
              </Row>
              <Button type="submit" variant="dark" disabled={savingP}>
                {savingP ? 'Đang lưu…' : 'Lưu thay đổi'}
              </Button>
            </Form>
          </section>

          {/* Đổi mật khẩu */}
          <section className="pf-card">
            <h2>Đổi mật khẩu</h2>
            <Form onSubmit={changePassword}>
              <Form.Label className="small text-muted">Mật khẩu hiện tại</Form.Label>
              <Form.Control
                className="mb-3"
                type="password"
                required
                value={pw.current}
                onChange={(e) => setW('current', e.target.value)}
              />
              <Form.Label className="small text-muted">Mật khẩu mới</Form.Label>
              <Form.Control
                className="mb-3"
                type="password"
                required
                value={pw.next}
                onChange={(e) => setW('next', e.target.value)}
              />
              <Form.Label className="small text-muted">Xác nhận mật khẩu mới</Form.Label>
              <Form.Control
                className="mb-3"
                type="password"
                required
                value={pw.confirm}
                onChange={(e) => setW('confirm', e.target.value)}
              />
              <Button type="submit" variant="dark" disabled={savingPw}>
                {savingPw ? 'Đang đổi…' : 'Đổi mật khẩu'}
              </Button>
            </Form>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
