import request from '@/utils/request'

export function videoList(data) {
  return request({
    url: '/api/video/list',
    method: 'post',
    data
  })
}

export function videoCount(data) {
  return request({
    url: '/api/video/count',
    method: 'post',
    data
  })
}

export function videoModify(data) {
  return request({
    url: '/api/video/modify',
    method: 'post',
    data
  })
}
