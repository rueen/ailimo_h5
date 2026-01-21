<template>
  <app-layout>
    <div class="orders-page page-content">
      <page-title title="我的订单" @back="router.back()" />

      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div
          v-for="order in orderList"
          :key="`${order.type}-${order.id}`"
          class="order-card"
          @click="goDetail(order)"
        >
          <div class="order-header">
            <div class="order-title">
              <span class="order-type">{{ order.type_name }}</span>
              <van-tag :type="getStatusType(order.status)" class="order-status">
                {{ order.status_text }}
              </van-tag>
            </div>
            <div class="order-date">{{ order.date }}</div>
          </div>
          
          <div class="order-content">
            <div class="order-info">
              <div class="order-title-text">{{ order.title }}</div>
            </div>
            <van-icon name="arrow" class="order-arrow" />
          </div>
        </div>
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
import PageTitle from '@/components/common/PageTitle.vue'
import { getDateRangeText, formatDateRange } from '@/utils/timeSlot'

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
 * 处理订单数据，格式化日期显示
 * @param {Array} orders - 订单列表
 * @returns {Array} 处理后的订单列表
 */
function processOrders(orders) {
  return orders.map(order => {
    // 对于设备预约和实验代操作订单，从 time_slots 中提取日期
    if ((order.type === 'equipment' || order.type === 'experiment') && order.time_slots) {
      order.date = getDateRangeText(order.time_slots)
    }
    
    // 对于笼位预约订单，格式化日期范围
    if (order.type === 'cage' && order.start_date) {
      order.date = formatDateRange(order.start_date, order.end_date)
    }
    
    return order
  })
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
    let list = data.list || []
    
    // 处理订单数据
    list = processOrders(list)
    
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
  background-color: var(--bg-color);
  padding: @padding-md;

  .order-card {
    background-color: var(--bg-color-white);
    border-radius: @border-radius-md;
    padding: @padding-md;
    margin-bottom: @padding-md;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: @padding-sm;

      .order-title {
        display: flex;
        align-items: center;
        gap: @padding-sm;
        flex: 1;

        .order-type {
          font-size: @font-size-md;
          font-weight: 600;
          color: var(--text-color);
        }
      }

      .order-date {
        font-size: @font-size-sm;
        color: var(--text-color-3);
        white-space: nowrap;
      }
    }

    .order-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: @padding-sm;

      .order-info {
        flex: 1;
        min-width: 0;

        .order-title-text {
          font-size: @font-size-sm;
          color: var(--text-color-2);
          .ellipsis();
        }
      }

      .order-arrow {
        color: var(--text-color-4);
        font-size: 16px;
        flex-shrink: 0;
      }
    }
  }
}
</style>
