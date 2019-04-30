import request from '@/utils/request'

export function uploadGroupAll(data) {
  return request({
    url: '/api/uploadGroup/all',
    method: 'post',
    data
  })
}

export function uploadGroupCreate(data) {
  return request({
    url: '/api/uploadGroup/create',
    method: 'post',
    data
  })
}

export function uploadGroupModify(data) {
  return request({
    url: '/api/uploadGroup/modify',
    method: 'post',
    data
  })
}
