import request from '@/utils/request'

export function allProvince(data) {
  return request({
    url: '/api/region/allProvince',
    method: 'post',
    data
  })
}

export function allCity(data) {
  return request({
    url: '/api/region/allCity',
    method: 'post',
    data
  })
}
