import axiosClient from './axiosClient'

export function getServices(params) {
  return axiosClient.get('/services', { params })
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
