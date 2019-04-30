import request from '@/utils/request'

export function goodList(data) {
  return request({
    url: '/api/good/list',
    method: 'post',
    data
  })
}

export function goodCount(data) {
  return request({
    url: '/api/good/count',
    method: 'post',
    data
  })
}

export function goodCreate(data) {
  return request({
    url: '/api/good/create',
    method: 'post',
    data
  })
}

export function goodModify(data) {
  return request({
    url: '/api/good/modify',
    method: 'post',
    data
  })
}

export function goodGetById(data) {
  return request({
    url: '/api/good/getById',
    method: 'post',
    data
  })
}
