<template>
  <div class="empty-state">
    <van-empty :image="image" :description="description">
      <van-button
        v-if="showButton"
        round
        type="primary"
        @click="handleClick"
      >
        {{ buttonText }}
      </van-button>
    </van-empty>
  </div>
</template>

<script setup>
/**
 * 定义 props
 */
const props = defineProps({
  image: {
    type: String,
    default: 'default'
  },
  description: {
    type: String,
    default: '暂无数据'
  },
  showButton: {
    type: Boolean,
    default: false
  },
  buttonText: {
    type: String,
    default: '去看看'
  }
})

/**
 * 定义 emits
 */
const emit = defineEmits(['click'])

/**
 * 按钮点击事件
 */
function handleClick() {
  emit('click')
}
</script>

<style lang="less" scoped>
.empty-state {
  padding: @padding-xl 0;
}
</style>
