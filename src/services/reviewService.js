import axiosClient from './axiosClient'
import { applyFilter } from './clientFilter'

export function getReviews(params) {
  return axiosClient.get('/reviews').then((rows) => applyFilter(rows, params))
}

export function createReview(data) {
  return axiosClient.post('/reviews', data)
}

export function updateReview(id, data) {
  return axiosClient.patch(`/reviews/${id}`, data)
}

export function deleteReview(id) {
  return axiosClient.delete(`/reviews/${id}`)
}
