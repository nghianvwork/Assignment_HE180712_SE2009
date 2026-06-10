import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import AuthVisual from './AuthVisual'
import { EyeIcon, GoogleIcon, AppleIcon } from './icons'
import './Auth.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ identifier: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((er) => ({ ...er, [name]: undefined }))
  }

  const validate = () => {
    const errs = {}
    if (!form.identifier.trim()) errs.identifier = 'Vui lòng nhập email hoặc tên đăng nhập'
    if (!form.password) errs.password = 'Vui lòng nhập mật khẩu'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const user = await login(form.identifier.trim(), form.password)
      toast.success(`Chào mừng, ${user.fullName}!`)
      if (user.role === 'admin') navigate('/admin', { replace: true })
      else if (user.role === 'manager') navigate('/manager', { replace: true })
      else navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  const comingSoon = () => toast.info('Tính năng đang được phát triển')

  return (
    <div className="lux-auth">
      <AuthVisual />

      <div className="lux-panel">
        <form className="lux-form" onSubmit={handleSubmit} noValidate>
          <div className="lux-eyebrow">Hotel Luxury</div>
          <h1 className="lux-title">Welcome Back</h1>
          <p className="lux-subtitle">
            Vui lòng nhập thông tin để truy cập tài khoản của bạn.
          </p>

          <div className="lux-field">
            <div className="lux-field-head">
              <label className="lux-label" htmlFor="identifier">
                Email hoặc tên đăng nhập
              </label>
            </div>
            <div className="lux-input-wrap">
              <input
                id="identifier"
                name="identifier"
                className={`lux-input ${errors.identifier ? 'is-error' : ''}`}
                value={form.identifier}
                onChange={handleChange}
                placeholder="your.email@reserve.com"
                autoFocus
              />
            </div>
            {errors.identifier && <div className="lux-error">{errors.identifier}</div>}
          </div>

          <div className="lux-field">
            <div className="lux-field-head">
              <label className="lux-label" htmlFor="password">
                Mật khẩu
              </label>
              <button type="button" className="lux-link-mini" onClick={comingSoon}>
                Quên mật khẩu?
              </button>
            </div>
            <div className="lux-input-wrap">
              <input
                id="password"
                name="password"
                type={showPwd ? 'text' : 'password'}
                className={`lux-input ${errors.password ? 'is-error' : ''}`}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
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

          <label className="lux-check">
            <input type="checkbox" />
            <span>Ghi nhớ đăng nhập trong 30 ngày</span>
          </label>

          <button type="submit" className="lux-btn" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Sign In'}
          </button>

          <div className="lux-divider">Hoặc tiếp tục với</div>

          <div className="lux-social">
            <button type="button" onClick={comingSoon}>
              <GoogleIcon /> Google
            </button>
            <button type="button" onClick={comingSoon}>
              <AppleIcon /> Apple
            </button>
          </div>

          <div className="lux-switch">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
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
