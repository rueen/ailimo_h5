/**
 * 用户状态管理
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from '@/utils/storage'
import { login as loginApi, getProfile as getProfileApi, logout as logoutApi } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(getToken())
  const userInfo = ref(getUser())
  const isLoggedIn = ref(!!token.value)

  /**
   * 登录
   * @param {object} loginData - 登录数据
   */
  async function login(loginData) {
    const data = await loginApi(loginData)
    token.value = data.token
    userInfo.value = data.user
    isLoggedIn.value = true
    setToken(data.token)
    setUser(data.user)
    return data
  }

  /**
   * 设置认证信息（用于注册后自动登录等场景）
   * @param {string} authToken - JWT token
   * @param {object} user - 用户信息
   */
  function setAuth(authToken, user) {
    token.value = authToken
    userInfo.value = user
    isLoggedIn.value = true
    setToken(authToken)
    setUser(user)
  }

  /**
   * 获取用户信息
   */
  async function getProfile() {
    const data = await getProfileApi()
    userInfo.value = data
    setUser(data)
    return data
  }

  /**
   * 退出登录
   */
  async function logout() {
    try {
      await logoutApi()
    } catch (error) {
      console.error('退出登录失败:', error)
    } finally {
      token.value = null
      userInfo.value = null
      isLoggedIn.value = false
      removeToken()
      removeUser()
    }
  }

  /**
   * 检查是否已审核通过
   */
  function isAuditPassed() {
    return userInfo.value?.audit_status === 1
  }

  /**
   * 检查是否需要审核
   */
  function needAudit() {
    return userInfo.value?.audit_status === 0
  }

  /**
   * 检查是否审核被拒绝
   */
  function isAuditRejected() {
    return userInfo.value?.audit_status === 2
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    setAuth,
    getProfile,
    logout,
    isAuditPassed,
    needAudit,
    isAuditRejected
  }
})
