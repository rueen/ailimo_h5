<template>
  <app-layout>
    <div class="cases-page page-content">
      <h2 class="page-title">案例展示</h2>

      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div class="case-grid">
          <div
            class="case-item"
            v-for="(item, index) in caseList"
            :key="item.id ?? index"
            @click="router.push(`/cases/${item.id}`)"
          >
            <div class="case-image">
              <van-image :src="item.images?.[0]" alt="案例图片" fit="cover" />
            </div>
            <div class="case-content">
              <h3 class="case-title">{{ item.project_name }}</h3>
              <p class="case-desc">{{ item.project_summary }}</p>
            </div>
          </div>
        </div>
      </van-list>

      <empty-state v-if="!loading && caseList.length === 0" description="暂无案例" />
    </div>
  </app-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { getCaseList } from '@/api/case'

const router = useRouter()
const loading = ref(false)
const finished = ref(false)
const caseList = ref([])
const page = ref(0)
const pageSize = 10

/**
 * 加载案例列表
 */
async function loadCases() {
  try {
    const data = await getCaseList({ page: page.value, page_size: pageSize })
    
    // 检查返回的数据
    const list = data.list || []
    
    if (page.value === 1) {
      caseList.value = list
    } else {
      caseList.value.push(...list)
    }
    
    // 判断是否加载完成：
    // 1. 如果返回的数据少于 pageSize，说明没有更多数据了
    // 2. 如果总数已知，判断已加载数量是否达到总数
    if (list.length < pageSize) {
      finished.value = true
    } else if (data.total !== undefined) {
      finished.value = caseList.value.length >= data.total
    }
    
    loading.value = false
  } catch (error) {
    console.error('加载案例失败:', error)
    // 发生错误时也要停止加载，避免无限请求
    finished.value = true
    loading.value = false
  }
}

/**
 * van-list 组件的 load 事件处理
 */
function onLoad() {
  page.value++
  loadCases()
}
</script>

<style lang="less" scoped>
.cases-page {
  .page-title {
    font-size: @font-size-xl;
    font-weight: 600;
    margin-bottom: @padding-lg;
  }

  /* 多列网格：移动端 2 列，平板 3 列 */
  .case-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: @padding-md;
    @media (min-width: 768px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .case-item {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s, box-shadow 0.3s;
    cursor: pointer;
    border-radius: @border-radius-md;
  }

  .case-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  .case-image {
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #fcfcfc;
    overflow: hidden;
  }

  .case-content {
    padding: @padding-sm @padding-md;
  }

  .case-title {
    font-size: @font-size-md;
    font-weight: 600;
    color: @text-color;
    margin-bottom: 4px;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .case-desc {
    font-size: @font-size-sm;
    color: @text-color-2;
    line-height: 1.5;
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}
</style>
