import axiosClient from './axiosClient'
import { applyFilter } from './clientFilter'

export function getUsers(params) {
  return axiosClient.get('/users').then((rows) => applyFilter(rows, params))
}

export function createUser(data) {
  return axiosClient.post('/users', data)
}

export function getUserById(id) {
  return axiosClient.get(`/users/${id}`)
}

export function updateUser(id, data) {
  return axiosClient.patch(`/users/${id}`, data)
}

export function deleteUser(id) {
  return axiosClient.delete(`/users/${id}`)
}
