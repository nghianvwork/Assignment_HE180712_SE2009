import axiosClient from './axiosClient'

export function getReviews(params) {
  return axiosClient.get('/reviews', { params })
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
