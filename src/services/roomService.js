import axiosClient from './axiosClient'
import { applyFilter } from './clientFilter'

export function getRooms(params) {
  return axiosClient.get('/rooms').then((rows) => applyFilter(rows, params))
}

export function getRoomById(id) {
  return axiosClient.get(`/rooms/${id}`)
}

export function createRoom(data) {
  return axiosClient.post('/rooms', data)
}

export function updateRoom(id, data) {
  return axiosClient.patch(`/rooms/${id}`, data)
}

export function deleteRoom(id) {
  return axiosClient.delete(`/rooms/${id}`)
}
