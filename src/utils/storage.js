/**
 * 工具函数 - 存储相关
 */

const TOKEN_KEY = 'ailimo_token'
const USER_KEY = 'ailimo_user'

/**
 * 存储 Token
 * @param {string} token - JWT Token
 */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 获取 Token
 * @returns {string|null} JWT Token
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 移除 Token
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * 存储用户信息
 * @param {object} user - 用户信息对象
 */
export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * 获取用户信息
 * @returns {object|null} 用户信息对象
 */
export function getUser() {
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}

/**
 * 移除用户信息
 */
export function removeUser() {
  localStorage.removeItem(USER_KEY)
}

/**
 * 清除所有本地存储
 */
export function clearStorage() {
  removeToken()
  removeUser()
}
