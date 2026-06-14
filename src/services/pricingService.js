import axiosClient from './axiosClient'

export function getPricingRules(params) {
  return axiosClient.get('/pricingRules', { params })
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
