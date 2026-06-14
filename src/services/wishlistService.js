import axiosClient from './axiosClient'

export function getWishlist(params) {
  return axiosClient.get('/wishlist', { params })
}

export function addToWishlist(data) {
  return axiosClient.post('/wishlist', data)
}

export function removeFromWishlist(id) {
  return axiosClient.delete(`/wishlist/${id}`)
}
