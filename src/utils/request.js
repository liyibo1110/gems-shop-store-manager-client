import axios from 'axios'
import { Message } from 'element-ui'
import qs from 'qs'
import store from '../store'
import { getToken } from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  transformRequest: [
    (data) => { // 解决传递数组变成对象的问题
      data = data || []
      Object.keys(data).forEach((key) => {
        // console.log('key: ' + key)
        if ((typeof data[key]) === 'object') {
          // console.log('是object，将被转换')
          data[key] = JSON.stringify(data[key]) // 这里必须使用内置JSON对象转换
        }
      })
      // console.log('准备qs')
      data = qs.stringify(data) // 这里必须使用qs库进行转换
      // console.log('准备qs完成')
      return data
    }
  ]
  // timeout: 5000
})

// request拦截器
service.interceptors.request.use(
  config => {
    // 让每个请求携带自定义token和role
    if (store.getters.token) {
      config.headers['User-Token'] = getToken()
    }
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.status !== 1) {
      Message({
        message: res.errormsg,
        type: 'error',
        duration: 5 * 1000
      })

      // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
      /* if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        MessageBox.confirm(
          '你已被登出，可以取消继续留在该页面，或者重新登录',
          '确定登出',
          {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          store.dispatch('FedLogOut').then(() => {
            location.reload() // 为了重新实例化vue-router对象 避免bug
          })
        })
      } */
      return Promise.reject('error')
    } else {
      return response.data
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
