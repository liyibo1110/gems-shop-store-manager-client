import request from '@/utils/request'

export function storeAll(data) {
  return request({
    url: '/api/store/all',
    method: 'post',
    data
  })
}
