<template>
  <app-layout>
    <div class="other-services-page page-content">
      <!-- 服务列表 -->
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div class="services-list">
          <div
            v-for="service in list"
            :key="service.id"
            class="service-item"
            @click="goDetail(service.id)"
          >
            <div class="service-content">
              <h3 class="service-title">{{ service.title }}</h3>
              <div class="service-meta">
                <span class="service-time">{{ formatTime(service.created_at) }}</span>
              </div>
            </div>
            <van-icon name="arrow" class="service-arrow" />
          </div>
        </div>
      </van-list>

      <!-- 空状态 -->
      <van-empty v-if="!loading && list.length === 0" description="暂无其他服务" />
    </div>
  </app-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import AppLayout from '@/components/layout/AppLayout.vue'
import { getOtherServices } from '@/api/otherService'

const router = useRouter()

/**
 * 列表数据
 */
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 10

/**
 * 加载数据
 */
async function onLoad() {
  try {
    loading.value = true
    const data = await getOtherServices({
      page: page.value,
      page_size: pageSize
    })

    // 检查返回的数据
    const _list = data.list || []
    
    if (page.value === 1) {
      list.value = _list
    } else {
      list.value.push(..._list)
    }
    
    // 判断是否加载完成：
    // 1. 如果返回的数据少于 pageSize，说明没有更多数据了
    // 2. 如果总数已知，判断已加载数量是否达到总数
    if (list.length < pageSize) {
      finished.value = true
    } else if (data.total !== undefined) {
      finished.value = list.value.length >= data.total
    }
  } catch (error) {
    console.error('加载其他服务列表失败:', error)
    showToast('加载失败，请稍后重试')
    finished.value = true
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
  return `${year}-${month}-${day}`
}

/**
 * 跳转详情页
 */
function goDetail(id) {
  router.push(`/other-services/${id}`)
}
</script>

<style lang="less" scoped>
.other-services-page {
  .services-list {
    display: flex;
    flex-direction: column;
    gap: @padding-md;
    margin-bottom: @padding-md;

    .service-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: var(--bg-color-white);
      border-radius: @border-radius-md;
      padding: @padding-md;
      cursor: pointer;
      transition: all 0.3s;

      &:active {
        background-color: var(--bg-color);
      }

      .service-content {
        flex: 1;
        min-width: 0;

        .service-title {
          font-size: @font-size-lg;
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 8px;
          .ellipsis();
        }

        .service-meta {
          display: flex;
          align-items: center;
          gap: @padding-sm;

          .service-time {
            font-size: @font-size-sm;
            color: var(--text-color-3);
          }
        }
      }

      .service-arrow {
        color: var(--text-color-3);
        font-size: 16px;
        flex-shrink: 0;
        margin-left: @padding-md;
      }
    }
  }
}
</style>
