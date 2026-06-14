import axiosClient from './axiosClient'

export function getVouchers(params) {
  return axiosClient.get('/vouchers', { params })
}

export function createVoucher(data) {
  return axiosClient.post('/vouchers', data)
}

export function updateVoucher(id, data) {
  return axiosClient.patch(`/vouchers/${id}`, data)
}

export function deleteVoucher(id) {
  return axiosClient.delete(`/vouchers/${id}`)
}
