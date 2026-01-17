<template>
  <app-layout>
    <div class="cases-page page-content">
      <h2 class="page-title">案例展示</h2>

      <van-loading v-if="loading" vertical>加载中...</van-loading>

      <van-list
        v-else
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
const page = ref(1)

async function loadCases() {
  try {
    loading.value = true
    const data = await getCaseList({ page: page.value, page_size: 10 })
    if (page.value === 1) {
      caseList.value = data.list
    } else {
      caseList.value.push(...data.list)
    }
    finished.value = caseList.value.length >= data.total
  } catch (error) {
    console.error('加载案例失败:', error)
  } finally {
    loading.value = false
  }
}

function onLoad() {
  page.value++
  loadCases()
}

onMounted(() => {
  loadCases()
})
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
