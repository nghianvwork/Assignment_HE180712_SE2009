import axiosClient from './axiosClient'

export function getUsers(params) {
  return axiosClient.get('/users', { params })
}

export function updateUser(id, data) {
  return axiosClient.patch(`/users/${id}`, data)
}

export function deleteUser(id) {
  return axiosClient.delete(`/users/${id}`)
}
