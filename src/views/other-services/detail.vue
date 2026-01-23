<template>
  <app-layout>
    <div class="other-service-detail-page page-content">
      <!-- 加载状态 -->
      <van-loading v-if="loading" type="spinner" vertical>加载中...</van-loading>

      <!-- 详情内容 -->
      <div v-else-if="detail" class="detail-container">
        <!-- 标题 -->
        <h1 class="detail-title">{{ detail.title }}</h1>

        <!-- 时间信息 -->
        <div class="detail-meta">
          <span class="meta-item">
            <van-icon name="clock-o" />
            {{ formatTime(detail.created_at) }}
          </span>
        </div>

        <!-- 分割线 -->
        <van-divider />

        <!-- 富文本内容 -->
        <div class="detail-content" v-html="detail.content"></div>
      </div>

      <!-- 空状态 -->
      <van-empty v-else description="服务不存在或已下线" />
    </div>
  </app-layout>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import AppLayout from '@/components/layout/AppLayout.vue'
import { getOtherServiceDetail } from '@/api/otherService'

const route = useRoute()

/**
 * 详情数据
 */
const detail = ref(null)
const loading = ref(false)
const navBarTitle = ref('其他服务详情')
/**
 * 提供导航栏标题给AppNavBar组件
 */
provide('navBarTitle', navBarTitle)

/**
 * 获取详情
 */
async function fetchDetail() {
  try {
    loading.value = true
    const data = await getOtherServiceDetail(route.params.id)

    detail.value = data;
    // 更新导航栏标题为设备名称
    if (detail.value?.title) {
      navBarTitle.value = detail.value.title
      // 同时更新页面标题
      document.title = detail.value.title + ' - 其他服务详情'
    }
  } catch (error) {
    console.error('获取其他服务详情失败:', error)
    showToast('获取详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

/**
 * 格式化时间
 */
function formatTime(time) {
  if (!time) return ''
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

/**
 * 页面加载时获取详情
 */
onMounted(() => {
  fetchDetail()
})
</script>

<style lang="less" scoped>
.other-service-detail-page {
  .detail-container {
    background-color: var(--bg-color-white);
    border-radius: @border-radius-md;
    padding: @padding-lg;

    .detail-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-color);
      line-height: 1.5;
      margin-bottom: @padding-md;
    }

    .detail-meta {
      display: flex;
      align-items: center;
      gap: @padding-md;
      margin-bottom: @padding-md;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: @font-size-sm;
        color: var(--text-color-3);

        :deep(.van-icon) {
          font-size: @font-size-sm;
        }
      }
    }

    .detail-content {
      font-size: @font-size-md;
      color: var(--text-color-2);
      line-height: 1.8;
      word-break: break-word;

      // 富文本样式
      :deep(img) {
        max-width: 100%;
        height: auto;
        display: block;
        margin: @padding-md 0;
        border-radius: @border-radius-sm;
      }

      :deep(p) {
        margin: @padding-sm 0;
      }

      :deep(h1),
      :deep(h2),
      :deep(h3),
      :deep(h4),
      :deep(h5),
      :deep(h6) {
        margin: @padding-md 0;
        font-weight: 600;
        color: var(--text-color);
      }

      :deep(ul),
      :deep(ol) {
        padding-left: @padding-lg;
        margin: @padding-sm 0;
      }

      :deep(li) {
        margin: 4px 0;
      }

      :deep(a) {
        color: @primary-color;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }

      :deep(blockquote) {
        border-left: 4px solid @primary-color;
        padding-left: @padding-md;
        margin: @padding-md 0;
        color: var(--text-color-3);
      }

      :deep(code) {
        background-color: var(--bg-color);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
        font-size: @font-size-sm;
      }

      :deep(pre) {
        background-color: var(--bg-color);
        padding: @padding-md;
        border-radius: @border-radius-sm;
        overflow-x: auto;
        margin: @padding-md 0;

        code {
          background-color: transparent;
          padding: 0;
        }
      }

      :deep(table) {
        width: 100%;
        border-collapse: collapse;
        margin: @padding-md 0;

        th,
        td {
          border: 1px solid var(--border-color);
          padding: 8px;
          text-align: left;
        }

        th {
          background-color: var(--bg-color);
          font-weight: 600;
        }
      }
    }
  }
}
</style>
