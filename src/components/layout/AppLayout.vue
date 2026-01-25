<template>
  <div class="app-layout" :class="layoutClass">
    <!-- PC 端头部 -->
    <app-header v-if="showHeader && isPc" />

    <!-- 移动端导航栏（微信浏览器有自带导航栏，不重复展示） -->
    <app-nav-bar v-if="showNavBarInMobile" :show-nav-bar="showNavBar" />

    <!-- 主内容区 -->
    <div class="app-main">
      <slot />
    </div>

    <!-- 底部导航（移动端） -->
    <app-tabbar v-if="showTabbar && !isPc" />

    <!-- 页脚（PC端） -->
    <app-footer v-if="isPc" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './AppHeader.vue'
import AppNavBar from './AppNavBar.vue'
import AppTabbar from './AppTabbar.vue'
import AppFooter from './AppFooter.vue'
import { isWechat } from '@/utils/device'

const route = useRoute()

/**
 * 定义 props
 */
const props = defineProps({
  showHeader: {
    type: Boolean,
    default: true
  },
  showNavBar: {
    type: Boolean,
    default: true
  }
})

/**
 * 是否显示底部导航
 */
const showTabbar = computed(() => route.meta.showTabbar)

/**
 * 是否为 PC 端
 */
const isPc = computed(() => window.innerWidth >= 768)

/**
 * 移动端是否展示自定义导航栏
 * 微信浏览器有自带导航栏（标题、返回等），不重复展示
 */
const showNavBarInMobile = computed(() => {
  return !isPc.value && props.showNavBar && !isWechat()
})

/**
 * 布局 class
 */
const layoutClass = computed(() => ({
  'has-tabbar': showTabbar.value,
  'is-pc': isPc.value,
  'wechat-no-nav': !isPc.value && isWechat()
}))
</script>

<style lang="less" scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bg-color);

  .app-main {
    flex: 1;
    width: 100%;
  }

  // 有底部导航栏时，给主内容区添加底部间距
  &.has-tabbar {
    .app-main {
      padding-bottom: 50px;
    }
  }

  // 微信内隐藏自定义导航栏时，顶部留出安全区域（可选，避免内容贴顶）
  &.wechat-no-nav .app-main {
    padding-top: constant(safe-area-inset-top);
    padding-top: env(safe-area-inset-top);
  }
}
</style>
