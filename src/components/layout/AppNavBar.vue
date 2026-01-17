<!--
 * @Author: diaochan diaochan@seatent.com
 * @Date: 2026-01-17 20:30:30
 * @LastEditors: diaochan diaochan@seatent.com
 * @LastEditTime: 2026-01-17 20:33:39
 * @FilePath: /ailimo_h5/src/components/layout/AppNavBar.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <van-nav-bar
    v-if="!isPc"
    :title="pageTitle"
    :left-arrow="showBack"
    fixed
    placeholder
    @click-left="onClickLeft"
  >
    <!-- <template #right>
      <van-icon
        v-if="showUserIcon"
        name="user-o"
        size="18"
        @click="goMy"
      />
    </template> -->
  </van-nav-bar>
</template>

<script setup>
import { computed, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

/**
 * 定义 props
 */
const props = defineProps({
  showNavBar: {
    type: Boolean,
    default: true
  }
})

/**
 * 注入自定义标题（从子组件提供）
 */
const customTitle = inject('navBarTitle', null)

/**
 * 是否为 PC 端
 */
const isPc = computed(() => {
  return window.innerWidth >= 768
})

/**
 * 页面标题（优先使用自定义标题，否则使用路由meta）
 */
const pageTitle = computed(() => {
  // customTitle可能是ref，需要访问.value
  const title = customTitle?.value ?? customTitle
  return title || route.meta.title || '艾力默'
})

/**
 * 是否显示返回按钮
 * 有 showTabbar 的是主页面，不显示返回按钮
 */
const showBack = computed(() => {
  return !route.meta.showTabbar
})

/**
 * 是否显示用户图标
 * 主页面且已登录时显示
 */
const showUserIcon = computed(() => {
  return route.meta.showTabbar && userStore.isLoggedIn
})

/**
 * 点击左侧返回按钮
 */
function onClickLeft() {
  router.back()
}

/**
 * 跳转到个人中心
 */
function goMy() {
  router.push('/my')
}
</script>

<style lang="less" scoped>
:deep(.van-nav-bar) {
  background-color: var(--bg-color-white);
  
  .van-nav-bar__title {
    color: var(--text-color);
    font-weight: 600;
  }
  
  .van-icon {
    color: var(--text-color);
  }
}
</style>
