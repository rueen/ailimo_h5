<template>
  <app-layout>
    <div class="orders-page page-content">
      <van-tabs v-model:active="activeTab" @change="onTabChange">
        <van-tab title="全部" name="all" />
        <van-tab title="待审核" name="0" />
        <van-tab title="进行中" name="1" />
        <van-tab title="已完成" name="3" />
      </van-tabs>

      <van-loading v-if="loading" vertical>加载中...</van-loading>

      <van-list
        v-else
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-card
          v-for="order in orderList"
          :key="`${order.type}-${order.id}`"
          :title="order.title"
          :desc="`${order.type_name} | ${order.date}`"
          @click="goDetail(order)"
        >
          <template #tags>
            <van-tag :type="getStatusType(order.status)">{{ order.status_text }}</van-tag>
          </template>
        </van-card>
      </van-list>

      <empty-state v-if="!loading && orderList.length === 0" description="暂无订单" />
    </div>
  </app-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { getMyOrders } from '@/api/order'

const router = useRouter()
const loading = ref(false)
const finished = ref(false)
const activeTab = ref('all')
const orderList = ref([])
const page = ref(1)

function getStatusType(status) {
  const typeMap = {
    0: 'warning',
    1: 'primary',
    2: 'danger',
    3: 'success',
    4: 'default'
  }
  return typeMap[status] || 'default'
}

async function loadOrders() {
  try {
    loading.value = true
    const params = {
      page: page.value,
      page_size: 10
    }
    if (activeTab.value !== 'all') {
      params.status = Number(activeTab.value)
    }
    const data = await getMyOrders(params)
    if (page.value === 1) {
      orderList.value = data.list
    } else {
      orderList.value.push(...data.list)
    }
    finished.value = orderList.value.length >= data.total
  } catch (error) {
    console.error('加载订单失败:', error)
  } finally {
    loading.value = false
  }
}

function onLoad() {
  page.value++
  loadOrders()
}

function onTabChange() {
  page.value = 1
  orderList.value = []
  finished.value = false
  loadOrders()
}

function goDetail(order) {
  router.push(`/orders/${order.type}/${order.id}`)
}

onMounted(() => {
  loadOrders()
})
</script>

<style lang="less" scoped>
.orders-page {
  padding-top: 0;
  
  .van-card {
    margin-bottom: @padding-md;
  }
}
</style>
