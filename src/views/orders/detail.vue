<template>
  <app-layout>
    <div class="order-detail-page">
      <van-loading v-if="loading" vertical>加载中...</van-loading>

      <div v-else-if="orderDetail" class="order-detail">
        <!-- 订单状态卡片 -->
        <div class="status-card">
          <div class="status-header">
            <span class="order-type-name">{{ orderDetail.type_name }}</span>
            <van-tag :type="getStatusType(orderDetail.status)" class="status-tag">
              {{ orderDetail.statusText }}
            </van-tag>
          </div>
          <div class="order-title-main">{{ orderDetail.title }}</div>
        </div>

        <!-- 订单信息 -->
        <div class="detail-section">
          <div class="section-title">订单信息</div>
          <van-cell-group inset>
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
        </div>

        <!-- 详细信息 -->
        <div class="detail-section">
          <div class="section-title">详细信息</div>
          <van-cell-group inset>
            <!-- 设备租赁 -->
            <template v-if="orderDetail.type === 'equipment'">
              <van-cell title="设备名称" :value="orderDetail.equipment?.name" />
              <van-cell title="预约日期" :value="orderDetail.reservation_date" />
              <van-cell title="预约时段" :value="orderDetail.time_slots?.join('、')" />
            </template>

            <!-- 笼位租赁 -->
            <template v-else-if="orderDetail.type === 'cage'">
              <van-cell title="动物类型" :value="orderDetail.animal_type?.name" />
              <van-cell title="环境" :value="orderDetail.environment?.name" />
              <van-cell title="数量" :value="orderDetail.quantity" />
              <van-cell title="预约日期" :value="orderDetail.reservation_date" />
            </template>

            <!-- 动物订购 -->
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
  background-color: var(--bg-color);
  padding: @padding-md;

  .order-detail {
    .status-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: @border-radius-md;
      padding: @padding-xl;
      margin-bottom: @padding-lg;
      color: #fff;

      .status-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: @padding-md;

        .order-type-name {
          font-size: @font-size-lg;
          font-weight: 600;
        }

        .status-tag {
          font-size: @font-size-sm;
        }
      }

      .order-title-main {
        font-size: @font-size-md;
        opacity: 0.9;
        line-height: 1.5;
      }
    }

    .detail-section {
      margin-bottom: @padding-lg;

      .section-title {
        font-size: @font-size-lg;
        font-weight: 600;
        color: var(--text-color);
        margin-bottom: @padding-sm;
        padding: 0 @padding-sm;
      }

      :deep(.van-cell-group) {
        margin-bottom: 0;
        border-radius: @border-radius-md;
        overflow: hidden;
      }

      :deep(.van-cell) {
        padding: @padding-md;

        .van-cell__title {
          font-weight: 500;
          color: var(--text-color-2);
          flex: 0 0 100px;
        }

        .van-cell__value {
          color: var(--text-color);
          text-align: right;
        }

        .van-cell__label {
          color: var(--text-color-2);
          margin-top: 4px;
          line-height: 1.5;
        }
      }
    }
  }
}
</style>
