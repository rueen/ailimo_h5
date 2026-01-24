<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useCompanyStore } from '@/stores/company'
import { useConfigStore } from '@/stores/config'
import { initWechatShare, isWechat } from '@/utils/wechat'

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
  
  // 初始化微信分享（默认配置）
  if (isWechat()) {
    initWechatShare({
      title: '艾力默用户端',
      desc: '浙江艾力默生物技术有限公司 - 专业的科研服务平台',
      imgUrl: 'https://www.ailimolab.com/share-cover.png',
      link: 'https://www.ailimolab.com/'
    })
  }
})
</script>

<style lang="less">
#app {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-color);
}
</style>
