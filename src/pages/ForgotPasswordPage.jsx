import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as authService from '../services/authService'
import AuthVisual from './AuthVisual'
import './Auth.css'

/** Đặt lại mật khẩu bằng username/email (luồng thật, ghi xuống DB qua json-server) */
export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ identifier: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.identifier.trim()) return toast.error('Vui lòng nhập email hoặc tên đăng nhập')
    if (form.password.length < 6) return toast.error('Mật khẩu mới tối thiểu 6 ký tự')
    if (form.password !== form.confirm) return toast.error('Xác nhận mật khẩu không khớp')
    setLoading(true)
    try {
      await authService.resetPassword(form.identifier.trim(), form.password)
      toast.success('Đặt lại mật khẩu thành công, vui lòng đăng nhập')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Đặt lại mật khẩu thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="lux-auth">
      <AuthVisual />

      <div className="lux-panel">
        <form className="lux-form" onSubmit={handleSubmit} noValidate>
          <div className="lux-eyebrow">Hotel Luxury</div>
          <h1 className="lux-title">Quên mật khẩu</h1>
          <p className="lux-subtitle">
            Nhập email hoặc tên đăng nhập và mật khẩu mới để đặt lại.
          </p>

          <div className="lux-field">
            <label className="lux-label" htmlFor="identifier">
              Email hoặc tên đăng nhập
            </label>
            <div className="lux-input-wrap">
              <input
                id="identifier"
                className="lux-input"
                value={form.identifier}
                onChange={(e) => set('identifier', e.target.value)}
                placeholder="your.email@reserve.com"
                autoFocus
              />
            </div>
          </div>

          <div className="lux-field">
            <label className="lux-label" htmlFor="password">
              Mật khẩu mới
            </label>
            <div className="lux-input-wrap">
              <input
                id="password"
                type="password"
                className="lux-input"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="lux-field">
            <label className="lux-label" htmlFor="confirm">
              Xác nhận mật khẩu mới
            </label>
            <div className="lux-input-wrap">
              <input
                id="confirm"
                type="password"
                className="lux-input"
                value={form.confirm}
                onChange={(e) => set('confirm', e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" className="lux-btn" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>

          <div className="lux-switch">
            Nhớ mật khẩu rồi? <Link to="/login">Đăng nhập</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
