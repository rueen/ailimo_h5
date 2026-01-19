<!--
 * 页面标题通用组件
 * 用于 PC 端展示带返回箭头和图标的页面标题，移动端自动隐藏（导航栏已包含标题）
 -->
<template>
  <h2 class="page-title">
    <van-icon
      v-if="showBack"
      name="arrow-left"
      class="page-title__back"
      @click="handleBack"
    />
    <span class="page-title__text">{{ title }}</span>
  </h2>
</template>

<script setup>
/**
 * Props:
 *   - title {string} 标题文案
 *   - showBack {boolean} [true] 是否显示返回箭头图标
 *
 * Events:
 *   - back 点击返回箭头时触发
 */
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  showBack: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['back'])

/**
 * 点击返回箭头时触发，向父组件派发 back 事件
 */
function handleBack() {
  emit('back')
}
</script>

<style lang="less" scoped>
.page-title {
  display: flex;
  align-items: center;
  gap: @padding-xs;
  font-size: @font-size-xl;
  font-weight: 600;
  margin-bottom: @padding-lg;

  @media (max-width: 767px) {
    display: none;
  }

  &__back {
    cursor: pointer;
    flex-shrink: 0;

    &:hover {
      opacity: 0.8;
    }
  }

  &__text {
    flex: 1;
    min-width: 0;
  }
}
</style>
