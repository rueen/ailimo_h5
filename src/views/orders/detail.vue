<template>
  <app-layout>
    <div class="order-detail-page page-content">
      <van-loading v-if="loading" vertical>加载中...</van-loading>

      <div v-else-if="orderDetail" class="order-detail">
        <van-cell-group inset title="订单信息">
          <van-cell title="订单类型" :value="orderDetail.type_name" />
          <van-cell title="订单状态">
            <template #value>
              <van-tag :type="getStatusType(orderDetail.status)">{{ orderDetail.statusText }}</van-tag>
            </template>
          </van-cell>
          <van-cell v-if="orderDetail.created_at" title="创建时间" :value="orderDetail.created_at" />
          <van-cell v-if="orderDetail.auditTime" title="审核时间" :value="orderDetail.auditTime" />
          <van-cell v-if="orderDetail.completedTime" title="完成时间" :value="orderDetail.completedTime" />
          <van-cell v-if="orderDetail.rejectReason" title="拒绝原因" :label="orderDetail.rejectReason" />
        </van-cell-group>

        <van-cell-group inset title="详细信息">
          <!-- 根据订单类型显示不同的详情 -->
          <template v-if="orderDetail.type === 'equipment'">
            <van-cell title="设备名称" :value="orderDetail.equipment?.name" />
            <van-cell title="预约日期" :value="orderDetail.reservation_date" />
            <van-cell title="预约时段" :value="orderDetail.time_slots?.join('、')" />
          </template>

          <template v-else-if="orderDetail.type === 'cage'">
            <van-cell title="动物类型" :value="orderDetail.animal_type?.name" />
            <van-cell title="环境" :value="orderDetail.environment?.name" />
            <van-cell title="数量" :value="orderDetail.quantity" />
            <van-cell title="预约日期" :value="orderDetail.reservation_date" />
          </template>

          <template v-else-if="orderDetail.type === 'animal'">
            <van-cell title="品牌" :value="orderDetail.brand?.name" />
            <van-cell title="品系" :value="orderDetail.variety?.name" />
            <van-cell title="规格" :value="orderDetail.specification?.name" />
            <van-cell title="导师" :value="orderDetail.supervisor_name" />
            <van-cell title="到货日期" :value="orderDetail.delivery_date" />
          </template>

          <van-cell v-if="orderDetail.remark" title="备注" :label="orderDetail.remark" />
        </van-cell-group>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import { getMyOrderDetail } from '@/api/order'

const route = useRoute()
const loading = ref(false)
const orderDetail = ref(null)

function getStatusType(status) {
  const typeMap = { 0: 'warning', 1: 'primary', 2: 'danger', 3: 'success', 4: 'default' }
  return typeMap[status] || 'default'
}

async function loadOrderDetail() {
  try {
    loading.value = true
    orderDetail.value = await getMyOrderDetail(route.params.type, route.params.id)
  } catch (error) {
    console.error('加载订单详情失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrderDetail()
})
</script>

<style lang="less" scoped>
.order-detail-page {
  .van-cell-group {
    margin-bottom: @padding-md;
  }
}
</style>
