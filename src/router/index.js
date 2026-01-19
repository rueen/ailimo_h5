/**
 * 路由配置
 */

import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'

/**
 * 路由配置
 */
const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: { title: '首页', requiresAuth: false, showTabbar: true }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/about/index.vue'),
    meta: { title: '公司概况', requiresAuth: false, showTabbar: true }
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('@/views/services/index.vue'),
    meta: { title: '服务中心', requiresAuth: false, showTabbar: true }
  },
  {
    path: '/services/equipment',
    name: 'Equipment',
    component: () => import('@/views/equipment/index.vue'),
    meta: { title: '设备租赁', requiresAuth: true, requiresAudit: true }
  },
  {
    path: '/services/equipment/:id',
    name: 'EquipmentDetail',
    component: () => import('@/views/equipment/detail.vue'),
    meta: { title: '设备详情', requiresAuth: false }
  },
  {
    path: '/services/cage',
    name: 'Cage',
    component: () => import('@/views/cage/index.vue'),
    meta: { title: '笼位租赁', requiresAuth: true, requiresAudit: true }
  },
  {
    path: '/services/experiment',
    name: 'Experiment',
    component: () => import('@/views/experiment/index.vue'),
    meta: { title: '实验代操作', requiresAuth: true, requiresAudit: true }
  },
  {
    path: '/services/animal',
    name: 'Animal',
    component: () => import('@/views/animal/index.vue'),
    meta: { title: '动物订购', requiresAuth: true, requiresAudit: true }
  },
  {
    path: '/services/reagent',
    name: 'Reagent',
    component: () => import('@/views/reagent/index.vue'),
    meta: { title: '试剂耗材订购', requiresAuth: true, requiresAudit: true }
  },
  {
    path: '/cases',
    name: 'Cases',
    component: () => import('@/views/cases/index.vue'),
    meta: { title: '案例展示', requiresAuth: false, showTabbar: true }
  },
  {
    path: '/cases/:id',
    name: 'CaseDetail',
    component: () => import('@/views/cases/detail.vue'),
    meta: { title: '案例详情', requiresAuth: false }
  },
  {
    path: '/my',
    name: 'My',
    component: () => import('@/views/my/index.vue'),
    meta: { title: '个人中心', requiresAuth: true, showTabbar: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/register.vue'),
    meta: { title: '注册', requiresAuth: false }
  },
  {
    path: '/audit-status',
    name: 'AuditStatus',
    component: () => import('@/views/auth/audit-status.vue'),
    meta: { title: '审核状态', requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/orders/index.vue'),
    meta: { title: '我的订单', requiresAuth: true }
  },
  {
    path: '/orders/:type/:id',
    name: 'OrderDetail',
    component: () => import('@/views/orders/detail.vue'),
    meta: { title: '订单详情', requiresAuth: true }
  }
]

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

/**
 * 全局前置守卫
 */
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '艾力默用户端'

  const userStore = useUserStore()

  // 需要登录的页面
  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      showToast('请先登录')
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // 需要审核通过的页面
    if (to.meta.requiresAudit) {
      if (!userStore.isAuditPassed()) {
        if (userStore.needAudit()) {
          showToast('账号审核中，请等待审核通过')
          next('/audit-status')
          return
        } else if (userStore.isAuditRejected()) {
          showToast('账号审核未通过')
          next('/audit-status')
          return
        }
        // 如果审核状态异常，跳转到个人中心
        showToast('账号审核状态异常')
        next('/my')
        return
      }
    }
  }

  next()
})

export default router
