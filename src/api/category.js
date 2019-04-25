import request from '@/utils/request'

export function categoryList(data) {
  return request({
    url: '/api/category/list',
    method: 'post',
    data
  })
}

export function categoryCount(data) {
  return request({
    url: '/api/category/count',
    method: 'post',
    data
  })
}

export function categoryCreate(data) {
  return request({
    url: '/api/category/create',
    method: 'post',
    data
  })
}

export function categoryModify(data) {
  return request({
    url: '/api/category/modify',
    method: 'post',
    data
  })
}
