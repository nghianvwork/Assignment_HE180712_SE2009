import axiosClient from './axiosClient'
import { applyFilter } from './clientFilter'

export function getWishlist(params) {
  return axiosClient.get('/wishlist').then((rows) => applyFilter(rows, params))
}

export function addToWishlist(data) {
  return axiosClient.post('/wishlist', data)
}

export function removeFromWishlist(id) {
  return axiosClient.delete(`/wishlist/${id}`)
}
