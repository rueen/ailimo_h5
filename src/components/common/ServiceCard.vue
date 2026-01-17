<!--
 * @Author: diaochan diaochan@seatent.com
 * @Date: 2026-01-17 19:14:22
 * @LastEditors: diaochan diaochan@seatent.com
 * @LastEditTime: 2026-01-17 19:53:58
 * @FilePath: /ailimo_h5/src/components/common/ServiceCard.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="service-card" @click="handleClick">
    <div class="service-icon">
      <img :src="icon" :alt="title" />
    </div>
    <div class="service-content">
      <h3 class="service-title">{{ title }}</h3>
      <p class="service-desc">{{ description }}</p>
    </div>
    <van-icon name="arrow" class="service-arrow" />
  </div>
</template>

<script setup>
/**
 * 定义 props
 */
const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
})

/**
 * 定义 emits
 */
const emit = defineEmits(['click'])

/**
 * 点击事件
 */
function handleClick() {
  emit('click')
}
</script>

<style lang="less" scoped>
.service-card {
  display: flex;
  align-items: center;
  gap: @padding-md;
  background-color: var(--bg-color-white);
  border-radius: @border-radius-md;
  padding: @padding-md;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .service-icon {
    width: 48px;
    height: 48px;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .service-content {
    flex: 1;
    min-width: 0;

    .service-title {
      font-size: @font-size-lg;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 4px;
    }

    .service-desc {
      font-size: @font-size-sm;
      color: var(--text-color-3);
      .ellipsis-2();
    }
  }

  .service-arrow {
    color: var(--text-color-4);
    font-size: 16px;
    flex-shrink: 0;
  }
}
</style>
