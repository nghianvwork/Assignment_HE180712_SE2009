import { createContext, useContext, useEffect, useState } from 'react'
import * as authService from '../services/authService'

const STORAGE_KEY = 'hotel_auth_user'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  })

  // Đồng bộ user xuống localStorage mỗi khi thay đổi
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const login = async (identifier, password) => {
    const loggedIn = await authService.login(identifier, password)
    // Không lưu password vào client
    const safeUser = { ...loggedIn }
    delete safeUser.password
    setUser(safeUser)
    return safeUser
  }

  const logout = () => setUser(null)

  // Cập nhật thông tin user hiện tại (đồng bộ xuống localStorage qua effect)
  const updateCurrentUser = (partial) => setUser((u) => (u ? { ...u, ...partial } : u))

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isUser: user?.role === 'user',
    login,
    logout,
    updateCurrentUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải dùng bên trong <AuthProvider>')
  return ctx
}
