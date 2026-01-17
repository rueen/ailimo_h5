<template>
  <app-layout>
    <div class="orders-page page-content">
      <h2 class="page-title">我的订单</h2>

      <van-list
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { getMyOrders } from '@/api/order'

const router = useRouter()
const loading = ref(false)
const finished = ref(false)
const orderList = ref([])
const page = ref(0)
const pageSize = 10

/**
 * 获取订单状态对应的标签类型
 * @param {number} status - 订单状态
 * @returns {string} 标签类型
 */
function getStatusType(status) {
  const typeMap = {
    0: 'warning',  // 待审核
    1: 'primary',  // 进行中
    2: 'danger',   // 已拒绝
    3: 'success',  // 已完成
    4: 'default'   // 已取消
  }
  return typeMap[status] || 'default'
}

/**
 * 加载订单列表
 */
async function loadOrders() {
  try {
    const params = {
      page: page.value,
      page_size: pageSize
    }
    
    const data = await getMyOrders(params)
    
    // 检查返回的数据
    const list = data.list || []
    
    if (page.value === 1) {
      orderList.value = list
    } else {
      orderList.value.push(...list)
    }
    
    // 判断是否加载完成：
    // 1. 如果返回的数据少于 pageSize，说明没有更多数据了
    // 2. 如果总数已知，判断已加载数量是否达到总数
    if (list.length < pageSize) {
      finished.value = true
    } else if (data.total !== undefined) {
      finished.value = orderList.value.length >= data.total
    }
    
    loading.value = false
  } catch (error) {
    console.error('加载订单失败:', error)
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
  loadOrders()
}

/**
 * 跳转到订单详情
 * @param {object} order - 订单对象
 */
function goDetail(order) {
  router.push(`/orders/${order.type}/${order.id}`)
}
</script>

<style lang="less" scoped>
.orders-page {
  .page-title {
    font-size: @font-size-xl;
    font-weight: 600;
    margin-bottom: @padding-lg;
  }
  
  .van-card {
    margin-bottom: @padding-md;
    cursor: pointer;
    
    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
