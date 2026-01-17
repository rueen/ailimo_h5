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
        <van-card
          v-for="item in caseList"
          :key="item.id"
          :title="item.project_name"
          :desc="item.project_summary"
          :thumb="item.images?.[0]"
          @click="router.push(`/cases/${item.id}`)"
        />
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

  .van-card {
    margin-bottom: @padding-md;
  }
}
</style>
