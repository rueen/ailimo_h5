/**
 * Axios 请求封装
 */

import axios from 'axios'
import { showToast } from 'vant'
import { getToken } from '@/utils/storage'
import router from '@/router'
import { useUserStore } from '@/stores/user'

/**
 * 创建 Axios 实例
 */
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 请求拦截器
 */
request.interceptors.request.use(
  (config) => {
    // 添加 Token
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

/**
 * 处理 401：清空登录状态并跳转登录页
 * @param {string} [msg] - 提示文案
 */
function handle401(msg) {
  const userStore = useUserStore()
  userStore.clearAuth()
  showToast(msg || 'Token无效或已过期，请重新登录')
  const redirect = router.currentRoute.value?.fullPath
  router.replace({
    path: '/login',
    query: redirect && redirect !== '/login' ? { redirect } : {}
  })
}

/**
 * 响应拦截器
 */
request.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data

    // 成功响应
    if (code === 200) {
      return data
    }

    // 业务 code 401：Token 无效或已过期
    if (code === 401) {
      handle401(message)
      return Promise.reject(new Error(message || 'Token无效或已过期'))
    }

    // 其他业务错误
    showToast(message || '请求失败')
    return Promise.reject(new Error(message || '请求失败'))
  },
  (error) => {
    console.error('响应错误:', error)

    // 处理不同的错误状态码
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // 未登录或 Token 失效
          handle401(data?.message || '登录已过期，请重新登录')
          break

        case 403:
          // 无权限
          showToast({
            message: '没有权限访问',
          })
          break

        case 404:
          // 资源不存在
          showToast({
            message: '请求的资源不存在',
          })
          break

        case 429:
          // 请求频率超限
          showToast({
            message: '请求过于频繁，请稍后再试',
          })
          break

        case 500:
          // 服务器错误
          showToast({
            message: data?.message || '服务器错误',
          })
          break

        default:
          showToast({
            message: data?.message || '请求失败',
          })
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      showToast({
        message: '网络连接失败，请检查网络',
      })
    } else {
      // 其他错误
      showToast({
        message: error.message || '请求失败',
      })
    }

    return Promise.reject(error)
  }
)

/**
 * 用于获取二进制响应的 Axios 实例（如 xlsx 代理）
 * 不走 JSON 响应拦截，直接返回 Blob
 */
const requestBlob = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 20000,
  responseType: 'blob'
})

requestBlob.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

requestBlob.interceptors.response.use(
  (response) => {
    if (response.status >= 200 && response.status < 300) {
      return response.data
    }
    return Promise.reject(new Error(`请求失败: ${response.status}`))
  },
  async (error) => {
    if (!error.response) {
      showToast('网络连接失败，请检查网络')
      return Promise.reject(error)
    }
    const { status, data } = error.response
    if (status === 401) {
      handle401()
      return Promise.reject(error)
    }
    const contentType = error.response.headers?.['content-type'] || ''
    if (contentType.includes('application/json')) {
      try {
        const text = await data.text()
        const json = JSON.parse(text)
        showToast(json.message || '请求失败')
        return Promise.reject(new Error(json.message))
      } catch {
        showToast('请求失败')
      }
    } else {
      showToast(data?.message || '请求失败')
    }
    return Promise.reject(error)
  }
)

export { requestBlob }
export default request
