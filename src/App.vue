<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useCompanyStore } from '@/stores/company'
import { useConfigStore } from '@/stores/config'

/**
 * App 根组件
 * 在应用启动时预加载全局数据
 */
const companyStore = useCompanyStore()
const configStore = useConfigStore()

onMounted(() => {
  // 预加载公司信息，避免每个页面都请求
  companyStore.loadCompanyInfo()
  
  // 预加载全局配置，避免每个页面都请求
  configStore.loadAdvanceDays()
})
</script>

<style lang="less">
#app {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-color);
}
</style>
