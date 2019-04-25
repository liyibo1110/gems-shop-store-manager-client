import router from './router'
import store from './store'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'// progress bar style
import { getToken } from '@/utils/auth' // getToken from cookie

NProgress.configure({ showSpinner: false })// NProgress Configuration

const whiteList = ['/login']// no redirect whitelist

router.beforeEach((to, from, next) => {
  console.log('准备路由转向' + to.path)
  NProgress.start()
  if (getToken()) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      // next()
      // console.log(getRole())
      store.dispatch('GenerateRoutes').then(() => { // 根据role生成可访问的路由表
        router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
        // next({ ...to, replace: true }) // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
        next()
      })
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
      next()
    } else {
      next(`/login?redirect=${to.path}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
