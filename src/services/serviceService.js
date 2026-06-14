import axiosClient from './axiosClient'
import { applyFilter } from './clientFilter'

export function getServices(params) {
  return axiosClient.get('/services').then((rows) => applyFilter(rows, params))
}

export function createService(data) {
  return axiosClient.post('/services', data)
}

export function updateService(id, data) {
  return axiosClient.patch(`/services/${id}`, data)
}

export function deleteService(id) {
  return axiosClient.delete(`/services/${id}`)
}
