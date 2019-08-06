import Vue from 'vue'
import Router from 'vue-router'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/
export const constantRouterMap = [
  { path: '/login', component: () => import('@/views/login/index'), hidden: true },
  { path: '/404', component: () => import('@/views/404'), hidden: true },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    // hidden: false,
    children: [{
      path: 'dashboard',
      name: '首页',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页', icon: 'list' }
    }]
  },

  {
    path: '/good',
    component: Layout,
    redirect: '/good/index',
    meta: { title: '商品管理', icon: 'list' },
    children: [
      {
        path: '/good/index',
        name: '商品列表',
        component: () => import('@/views/good/index'),
        meta: { title: '商品列表', icon: 'list' }
      },
      {
        path: '/category/index',
        name: '商品分类',
        component: () => import('@/views/category/index'),
        meta: { title: '商品分类', icon: 'list' }
      }
    ]
  },

  {
    path: '/order',
    component: Layout,
    redirect: '/order/index',
    meta: { title: '订单管理', icon: 'list' },
    children: [
      {
        path: '/order/index',
        name: '订单列表',
        component: () => import('@/views/order/index'),
        meta: { title: '订单列表', icon: 'list' }
      }
    ]
  },

  {
    path: '/order/detail',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/order/detail',
        name: '订单明细',
        component: () => import('@/views/order/detail'),
        meta: { title: '订单明细' }
      }
    ]
  },

  {
    path: '/setting',
    component: Layout,
    redirect: '/delivery/index',
    meta: { title: '设置', icon: 'list' },
    children: [
      {
        path: '/delivery/index',
        name: '配送设置1',
        component: () => import('@/views/delivery/index'),
        meta: { title: '配送设置', icon: 'list' }
      },
      {
        path: '/delivery2/index',
        name: '其他设置1',
        component: () => import('@/views/delivery/index'),
        meta: { title: '其他设置', icon: 'list' }
      }
    ]
  },
  {
    path: '/good/create',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/good/create',
        name: '新增商品',
        component: () => import('@/views/good/create'),
        meta: { title: '新增商品' }
      }
    ]
  },
  {
    path: '/good/modify',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/good/modify',
        name: '修改商品',
        component: () => import('@/views/good/modify'),
        meta: { title: '修改商品' }
      }
    ]
  },
  {
    path: '/delivery/create',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/delivery/create',
        name: '新增运费模板',
        component: () => import('@/views/delivery/create'),
        meta: { title: '新增运费模板' }
      }
    ]
  },
  {
    path: '/delivery/modify',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/delivery/modify',
        name: '修改运费模板',
        component: () => import('@/views/delivery/modify'),
        meta: { title: '修改运费模板' }
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]

export const asyncRouterMap = []

export default new Router({
  mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
