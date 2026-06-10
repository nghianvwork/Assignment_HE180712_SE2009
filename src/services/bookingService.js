import axiosClient from './axiosClient'

export function getBookings(params) {
  return axiosClient.get('/bookings', { params })
}

export function createBooking(data) {
  return axiosClient.post('/bookings', data)
}

export function updateBooking(id, data) {
  return axiosClient.patch(`/bookings/${id}`, data)
}

export function deleteBooking(id) {
  return axiosClient.delete(`/bookings/${id}`)
}
