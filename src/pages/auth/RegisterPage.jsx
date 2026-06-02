import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as authService from '../../services/authService'
import AuthVisual from './AuthVisual'
import { EyeIcon } from './icons'
import './Auth.css'

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agree: false,
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    setErrors((er) => ({ ...er, [name]: undefined }))
  }

  const validate = () => {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Vui lòng nhập họ tên'
    if (!form.email.trim()) {
      errs.email = 'Vui lòng nhập email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Email không hợp lệ'
    }
    if (!form.password) {
      errs.password = 'Vui lòng nhập mật khẩu'
    } else if (form.password.length < 6) {
      errs.password = 'Mật khẩu tối thiểu 6 ký tự'
    }
    if (form.confirmPassword !== form.password) {
      errs.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }
    if (!form.agree) {
      errs.agree = 'Bạn cần đồng ý với điều khoản'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      if (await authService.isEmailTaken(form.email.trim())) {
        setErrors((er) => ({ ...er, email: 'Email đã được sử dụng' }))
        return
      }
      const username = await authService.generateUsername(form.email.trim())
      await authService.register({
        fullName: form.fullName.trim(),
        username,
        email: form.email.trim(),
        phone: '',
        password: form.password,
      })
      toast.success('Tạo tài khoản thành công! Vui lòng đăng nhập.')
      navigate('/login', { replace: true })
    } catch {
      toast.error('Đăng ký thất bại, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="lux-auth">
      <AuthVisual />

      <div className="lux-panel">
        <form className="lux-form" onSubmit={handleSubmit} noValidate>
          <div className="lux-eyebrow">Aurelian Reserve</div>
          <h1 className="lux-title">Join the Club</h1>
          <p className="lux-subtitle">
            Tạo tài khoản để bắt đầu hành trình nghỉ dưỡng của bạn.
          </p>

          <div className="lux-field">
            <div className="lux-field-head">
              <label className="lux-label" htmlFor="fullName">Họ và tên</label>
            </div>
            <div className="lux-input-wrap">
              <input
                id="fullName"
                name="fullName"
                className={`lux-input ${errors.fullName ? 'is-error' : ''}`}
                value={form.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                autoFocus
              />
            </div>
            {errors.fullName && <div className="lux-error">{errors.fullName}</div>}
          </div>

          <div className="lux-field">
            <div className="lux-field-head">
              <label className="lux-label" htmlFor="email">Email</label>
            </div>
            <div className="lux-input-wrap">
              <input
                id="email"
                name="email"
                type="email"
                className={`lux-input ${errors.email ? 'is-error' : ''}`}
                value={form.email}
                onChange={handleChange}
                placeholder="your.email@reserve.com"
              />
            </div>
            {errors.email && <div className="lux-error">{errors.email}</div>}
          </div>

          <div className="lux-field">
            <div className="lux-field-head">
              <label className="lux-label" htmlFor="password">Mật khẩu</label>
            </div>
            <div className="lux-input-wrap">
              <input
                id="password"
                name="password"
                type={showPwd ? 'text' : 'password'}
                className={`lux-input ${errors.password ? 'is-error' : ''}`}
                value={form.password}
                onChange={handleChange}
                placeholder="Tối thiểu 6 ký tự"
              />
              <button
                type="button"
                className="lux-eye"
                onClick={() => setShowPwd((s) => !s)}
                tabIndex={-1}
                aria-label="Hiện/ẩn mật khẩu"
              >
                <EyeIcon open={showPwd} />
              </button>
            </div>
            {errors.password && <div className="lux-error">{errors.password}</div>}
          </div>

          <div className="lux-field">
            <div className="lux-field-head">
              <label className="lux-label" htmlFor="confirmPassword">
                Xác nhận mật khẩu
              </label>
            </div>
            <div className="lux-input-wrap">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPwd ? 'text' : 'password'}
                className={`lux-input ${errors.confirmPassword ? 'is-error' : ''}`}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
              />
            </div>
            {errors.confirmPassword && (
              <div className="lux-error">{errors.confirmPassword}</div>
            )}
          </div>

          <label className="lux-check">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
            />
            <span>
              Tôi đồng ý với <a href="#" onClick={(e) => e.preventDefault()}>Điều khoản</a> và{' '}
              <a href="#" onClick={(e) => e.preventDefault()}>Chính sách bảo mật</a>
            </span>
          </label>
          {errors.agree && (
            <div className="lux-error" style={{ marginTop: '-18px', marginBottom: '18px' }}>
              {errors.agree}
            </div>
          )}

          <button type="submit" className="lux-btn" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Create Account'}
          </button>

          <div className="lux-switch">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>

          <div className="lux-legal">
            <a href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Terms</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Support</a>
          </div>
        </form>
      </div>
    </div>
  )
}
