import axiosClient from './axiosClient'

export function getRooms(params) {
  return axiosClient.get('/rooms', { params })
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
