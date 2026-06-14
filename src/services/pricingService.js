import axiosClient from './axiosClient'
import { applyFilter } from './clientFilter'

export function getPricingRules(params) {
  return axiosClient.get('/pricingRules').then((rows) => applyFilter(rows, params))
}

export function createPricingRule(data) {
  return axiosClient.post('/pricingRules', data)
}

export function updatePricingRule(id, data) {
  return axiosClient.patch(`/pricingRules/${id}`, data)
}

export function deletePricingRule(id) {
  return axiosClient.delete(`/pricingRules/${id}`)
}
