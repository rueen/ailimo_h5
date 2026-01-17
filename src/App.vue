<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useCompanyStore } from '@/stores/company'

/**
 * App 根组件
 * 在应用启动时预加载公司信息
 */
const companyStore = useCompanyStore()

onMounted(() => {
  // 预加载公司信息，避免每个页面都请求
  companyStore.loadCompanyInfo()
})
</script>

<style lang="less">
#app {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-color);
}
</style>
