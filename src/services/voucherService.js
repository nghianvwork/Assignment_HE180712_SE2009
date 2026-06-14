import axiosClient from './axiosClient'
import { applyFilter } from './clientFilter'

export function getVouchers(params) {
  return axiosClient.get('/vouchers').then((rows) => applyFilter(rows, params))
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
