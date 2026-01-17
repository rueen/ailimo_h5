/**
 * Axios 请求封装
 */

import axios from 'axios'
import { showToast, showDialog } from 'vant'
import { getToken, clearStorage } from '@/utils/storage'
import router from '@/router'

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
 * 响应拦截器
 */
request.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data

    // 成功响应
    if (code === 200) {
      return data
    }

    // 业务错误
    showToast({
      message: message || '请求失败',
      icon: 'fail'
    })
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
          showDialog({
            title: '提示',
            message: '登录已过期，请重新登录',
            confirmButtonText: '去登录'
          }).then(() => {
            clearStorage()
            router.push('/login')
          })
          break

        case 403:
          // 无权限
          showToast({
            message: '没有权限访问',
            icon: 'fail'
          })
          break

        case 404:
          // 资源不存在
          showToast({
            message: '请求的资源不存在',
            icon: 'fail'
          })
          break

        case 429:
          // 请求频率超限
          showToast({
            message: '请求过于频繁，请稍后再试',
            icon: 'fail'
          })
          break

        case 500:
          // 服务器错误
          showToast({
            message: data?.message || '服务器错误',
            icon: 'fail'
          })
          break

        default:
          showToast({
            message: data?.message || '请求失败',
            icon: 'fail'
          })
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      showToast({
        message: '网络连接失败，请检查网络',
        icon: 'fail'
      })
    } else {
      // 其他错误
      showToast({
        message: error.message || '请求失败',
        icon: 'fail'
      })
    }

    return Promise.reject(error)
  }
)

export default request
