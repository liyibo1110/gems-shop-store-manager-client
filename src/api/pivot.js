import request from '@/utils/request'

export function pivotUnusedList(data) {
  return request({
    url: '/api/pivot/unusedList',
    method: 'post',
    data
  })
}
