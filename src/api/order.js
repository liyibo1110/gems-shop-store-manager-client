import request from '@/utils/request'

export function orderList(data) {
  return request({
    url: '/api/order/list',
    method: 'post',
    data
  })
}

export function orderCount(data) {
  return request({
    url: '/api/order/count',
    method: 'post',
    data
  })
}

export function orderGetById(data) {
  return request({
    url: '/api/order/getById',
    method: 'post',
    data
  })
}

export function orderDeliveryStatusModify(data) {
  return request({
    url: '/api/order/modifyDeliveryStatus',
    method: 'post',
    data
  })
}

