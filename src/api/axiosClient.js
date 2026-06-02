import axios from 'axios'

const axiosClient = axios.create({
  baseURL: 'http://localhost:9999',
  headers: { 'Content-Type': 'application/json' },
})

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
)

export default axiosClient
