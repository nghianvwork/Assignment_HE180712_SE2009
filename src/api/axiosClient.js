import axios from 'axios'

// Khi deploy: đặt biến môi trường VITE_API_URL trỏ tới json-server đã host.
// Khi chạy local: tự dùng http://localhost:9999
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:9999',
  headers: { 'Content-Type': 'application/json' },
})

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
)

export default axiosClient
