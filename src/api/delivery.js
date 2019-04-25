import request from '@/utils/request'

export function deliveryList(data) {
  return request({
    url: '/api/delivery/list',
    method: 'post',
    data
  })
}

export function deliveryCount(data) {
  return request({
    url: '/api/delivery/count',
    method: 'post',
    data
  })
}

export function deliveryCreate(data) {
  return request({
    url: '/api/delivery/create',
    method: 'post',
    data
  })
}

export function deliveryModify(data) {
  return request({
    url: '/api/delivery/modify',
    method: 'post',
    data
  })
}

export function deliveryGetById(data) {
  return request({
    url: '/api/delivery/getById',
    method: 'post',
    data
  })
}
