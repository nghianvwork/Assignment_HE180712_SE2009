import axiosClient from './axiosClient'
import { applyFilter } from './clientFilter'

export function getHotels(params) {
  return axiosClient.get('/hotels').then((rows) => applyFilter(rows, params))
}

export function getHotelById(id) {
  return axiosClient.get(`/hotels/${id}`)
}

export function createHotel(data) {
  return axiosClient.post('/hotels', data)
}

export function updateHotel(id, data) {
  return axiosClient.patch(`/hotels/${id}`, data)
}

export function deleteHotel(id) {
  return axiosClient.delete(`/hotels/${id}`)
}
