import axiosClient from '../api/axiosClient'

export function getHotels(params) {
  return axiosClient.get('/hotels', { params })
}

export function getHotelById(id) {
  return axiosClient.get(`/hotels/${id}`)
}
