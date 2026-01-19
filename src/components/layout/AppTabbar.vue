<!--
 * @Author: diaochan diaochan@seatent.com
 * @Date: 2026-01-17 19:13:41
 * @LastEditors: diaochan diaochan@seatent.com
 * @LastEditTime: 2026-01-19 17:09:50
 * @FilePath: /ailimo_h5/src/components/layout/AppTabbar.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <van-tabbar
    v-model="activeTab"
    :fixed="true"
    :placeholder="true"
    :safe-area-inset-bottom="true"
    active-color="#00e9aa"
  >
    <van-tabbar-item
      v-for="item in tabbarList"
      :key="item.name"
      :to="item.path"
      :icon="item.icon"
    >
      {{ item.title }}
    </van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

/**
 * 当前激活的标签
 */
const activeTab = ref(0)

/**
 * 底部导航列表
 */
const tabbarList = [
  { title: '首页', name: 'home', path: '/home', icon: 'home-o' },
  { title: '公司概况', name: 'about', path: '/about', icon: 'shop-o' },
  { title: '服务中心', name: 'services', path: '/services', icon: 'apps-o' },
  { title: '案例展示', name: 'cases', path: '/cases', icon: 'photo-o' },
  { title: '个人中心', name: 'my', path: '/my', icon: 'user-o' }
]

/**
 * 监听路由变化，更新激活的标签
 */
watch(
  () => route.path,
  (newPath) => {
    const index = tabbarList.findIndex((item) => newPath.startsWith(item.path))
    if (index !== -1) {
      activeTab.value = index
    }
  },
  { immediate: true }
)
</script>

<style lang="less" scoped>
// Tabbar 样式由 Vant 组件库提供
</style>
