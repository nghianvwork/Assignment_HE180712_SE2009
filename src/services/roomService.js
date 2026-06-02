import axiosClient from '../api/axiosClient'

export function getRooms(params) {
  return axiosClient.get('/rooms', { params })
}

export function getRoomById(id) {
  return axiosClient.get(`/rooms/${id}`)
}
