<template>
  <div class="app-layout" :class="{ 'has-tabbar': showTabbar, 'is-pc': isPc }">
    <!-- PC 端头部 -->
    <app-header v-if="showHeader && isPc" />

    <!-- 移动端导航栏 -->
    <app-nav-bar v-if="!isPc && showNavBar" :show-nav-bar="showNavBar" />

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
const showTabbar = computed(() => {
  return route.meta.showTabbar
})

/**
 * 是否为 PC 端
 */
const isPc = computed(() => {
  return window.innerWidth >= 768
})
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
}
</style>
