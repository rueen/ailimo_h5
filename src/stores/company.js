/**
 * 公司信息状态管理
 * 全局单例，避免重复请求
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCompanyInfo } from '@/api/company'

export const useCompanyStore = defineStore('company', () => {
  /**
   * 公司信息
   */
  const companyInfo = ref(null)
  
  /**
   * 加载状态
   */
  const loading = ref(false)
  
  /**
   * 是否已加载过
   */
  const loaded = ref(false)

  /**
   * 加载公司信息
   * 如果已经加载过，直接返回缓存数据
   */
  async function loadCompanyInfo() {
    // 如果已经加载过或正在加载中，直接返回
    if (loaded.value || loading.value) {
      return companyInfo.value
    }

    try {
      loading.value = true
      const data = await getCompanyInfo()
      companyInfo.value = data
      loaded.value = true
      return data
    } catch (error) {
      console.error('加载公司信息失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 重新加载公司信息（强制刷新）
   */
  async function refreshCompanyInfo() {
    loaded.value = false
    return loadCompanyInfo()
  }

  /**
   * 清空公司信息
   */
  function clearCompanyInfo() {
    companyInfo.value = null
    loaded.value = false
    loading.value = false
  }

  return {
    companyInfo,
    loading,
    loaded,
    loadCompanyInfo,
    refreshCompanyInfo,
    clearCompanyInfo
  }
})
