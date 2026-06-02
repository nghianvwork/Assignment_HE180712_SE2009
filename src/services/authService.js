import axiosClient from '../api/axiosClient'

/**
 * Đăng nhập bằng email HOẶC username + password.
 * json-server không có xác thực thật, nên ta query trực tiếp.
 */
export async function login(identifier, password) {
  // Thử khớp theo username trước, nếu không có thì khớp theo email
  let users = await axiosClient.get('/users', {
    params: { username: identifier, password },
  })
  if (!users.length) {
    users = await axiosClient.get('/users', {
      params: { email: identifier, password },
    })
  }
  const user = users[0]
  if (!user) {
    throw new Error('Thông tin đăng nhập hoặc mật khẩu không đúng')
  }
  if (user.status === 'banned') {
    throw new Error('Tài khoản đã bị khóa')
  }
  return user
}

/** Tạo username duy nhất từ phần đầu của email */
export async function generateUsername(email) {
  const base =
    email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user'
  let candidate = base
  let n = 1
  while (await isUsernameTaken(candidate)) {
    candidate = `${base}${n++}`
  }
  return candidate
}

/** Kiểm tra username đã tồn tại chưa */
export async function isUsernameTaken(username) {
  const users = await axiosClient.get('/users', { params: { username } })
  return users.length > 0
}

/** Kiểm tra email đã tồn tại chưa */
export async function isEmailTaken(email) {
  const users = await axiosClient.get('/users', { params: { email } })
  return users.length > 0
}

/** Đăng ký tài khoản mới (mặc định role = user) */
export async function register(data) {
  const newUser = {
    username: data.username,
    password: data.password,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone || '',
    role: 'user',
    status: 'active',
  }
  return axiosClient.post('/users', newUser)
}
