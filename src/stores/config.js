/**
 * 全局配置状态管理
 * 管理应用级别的配置数据，避免重复请求
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAdvanceDays } from '@/api/common'

export const useConfigStore = defineStore('config', () => {
  /**
   * 提前预约天数配置
   */
  const advanceDays = ref({
    equipment_advance_days: 7,      // 设备租赁提前预约天数
    cage_advance_days: 7,            // 笼位预约提前预约天数
    experiment_advance_days: 7       // 实验代操作提前预约天数
  })
  
  /**
   * 加载状态
   */
  const loading = ref(false)
  
  /**
   * 是否已加载过
   */
  const loaded = ref(false)

  /**
   * 加载提前预约天数配置
   * 如果已经加载过，直接返回缓存数据
   */
  async function loadAdvanceDays() {
    // 如果已经加载过或正在加载中，直接返回
    if (loaded.value || loading.value) {
      return advanceDays.value
    }

    try {
      loading.value = true
      const data = await getAdvanceDays()
      advanceDays.value = {
        equipment_advance_days: data.equipment_advance_days || 7,
        cage_advance_days: data.cage_advance_days || 7,
        experiment_advance_days: data.experiment_advance_days || 7
      }
      loaded.value = true
      return advanceDays.value
    } catch (error) {
      console.error('加载提前预约天数配置失败:', error)
      // 失败时使用默认值
      return advanceDays.value
    } finally {
      loading.value = false
    }
  }

  /**
   * 重新加载配置（强制刷新）
   */
  async function refreshAdvanceDays() {
    loaded.value = false
    return loadAdvanceDays()
  }

  /**
   * 清空配置
   */
  function clearConfig() {
    advanceDays.value = {
      equipment_advance_days: 7,
      cage_advance_days: 7,
      experiment_advance_days: 7
    }
    loaded.value = false
    loading.value = false
  }

  return {
    advanceDays,
    loading,
    loaded,
    loadAdvanceDays,
    refreshAdvanceDays,
    clearConfig
  }
})
