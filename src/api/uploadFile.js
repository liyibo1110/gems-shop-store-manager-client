import request from '@/utils/request'

export function uploadFileList(data) {
  return request({
    url: '/api/uploadFile/list',
    method: 'post',
    data
  })
}

export function uploadFileCreate(data) {
  return request({
    url: '/api/uploadFile/create',
    method: 'post',
    data
  })
}

export function uploadFileModify(data) {
  return request({
    url: '/api/uploadFile/modify',
    method: 'post',
    data
  })
}
