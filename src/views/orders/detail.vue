<template>
  <app-layout>
    <div class="order-detail-page page-content">
      <van-loading v-if="loading" vertical>加载中...</van-loading>

      <div v-else-if="orderDetail" class="order-detail">
        <!-- 订单信息 -->
        <div class="detail-section">
          <div class="section-title">订单信息</div>
          <van-cell-group>
            <van-cell title="订单类型" :value="orderDetail.type_name" />
            <van-cell title="订单状态">
              <van-tag :type="getStatusType(orderDetail.status)" size="large">
                {{ orderDetail.status_text }}
              </van-tag>
            </van-cell>
            <van-cell v-if="orderDetail.reject_reason" title="拒绝原因" :value="`#${orderDetail.reject_reason}`" />
            <van-cell title="订单编号" :value="`#${orderDetail.order_sn}`" />
            <van-cell title="创建时间" :value="orderDetail.created_at" />
            <van-cell v-if="orderDetail.audit_time" title="审核时间" :value="orderDetail.audit_time" />
            <van-cell v-if="orderDetail.completed_time" title="完成时间" :value="orderDetail.completed_time" />
          </van-cell-group>
        </div>

        <!-- 设备租赁详情 -->
        <template v-if="orderDetail.type === 'equipment'">
          <div class="detail-section">
            <div class="section-title">设备信息</div>
            <van-cell-group>
              <van-cell title="设备名称" :value="orderDetail.equipment?.name" is-link @click="router.push(`/equipment/${orderDetail.equipment_id}`)" />
              <van-cell v-if="orderDetail.remark" title="备注" :label="orderDetail.remark" />
            </van-cell-group>
          </div>

          <div class="detail-section">
            <div class="section-title">预约信息</div>
            <van-cell-group>
              <van-cell title="预约日期" :value="orderDetail.reservation_date" />
              <van-cell title="预约时段" :value="orderDetail.time_slots?.join('、')" />
            </van-cell-group>
          </div>
        </template>

        <!-- 笼位预约详情 -->
        <template v-else-if="orderDetail.type === 'cage'">
          <div class="detail-section">
            <div class="section-title">笼位信息</div>
            <van-cell-group>
              <van-cell title="动物类型" :value="orderDetail.animal_type?.name" />
              <van-cell title="环境类型" :value="orderDetail.environment?.name" />
              <van-cell title="笼位数量" :value="`${orderDetail.quantity} 个`" />
              <van-cell title="用途" :value="orderDetail.purpose?.name" />
              <van-cell v-if="orderDetail.remark" title="备注" :label="orderDetail.remark" />
            </van-cell-group>
          </div>

          <div class="detail-section">
            <div class="section-title">预约信息</div>
            <van-cell-group>
              <van-cell title="预约日期" :value="orderDetail.reservation_date" />
              <van-cell title="预约时段" :value="orderDetail.time_slots?.join('、')" />
            </van-cell-group>
          </div>
        </template>

        <!-- 实验代操作详情 -->
        <template v-else-if="orderDetail.type === 'experiment'">
          <div class="detail-section">
            <div class="section-title">实验信息</div>
            <van-cell-group>
              <van-cell title="操作内容" :value="orderDetail.operation_content?.name" />
              <van-cell title="动物类型" :value="orderDetail.animal_type?.name" />
              <van-cell title="动物数量" :value="`${orderDetail.quantity} 只`" />
              <van-cell v-if="orderDetail.remark" title="备注" :label="orderDetail.remark" />
            </van-cell-group>
          </div>

          <div class="detail-section">
            <div class="section-title">预约信息</div>
            <van-cell-group>
              <van-cell title="预约日期" :value="orderDetail.reservation_date" />
              <van-cell title="预约时段" :value="orderDetail.timeSlots?.join('、')" />
            </van-cell-group>
          </div>
        </template>

        <!-- 动物订购详情 -->
        <template v-else-if="orderDetail.type === 'animal'">
          <div class="detail-section">
            <div class="section-title">动物信息</div>
            <van-cell-group>
              <van-cell title="品牌" :value="orderDetail.brand?.name" />
              <van-cell title="品系" :value="orderDetail.variety?.name" />
              <van-cell title="规格" :value="orderDetail.specification?.name" />
              <van-cell title="性别" :value="orderDetail.gender_text" />
              <van-cell title="环境" :value="orderDetail.environment?.name" />
              <van-cell title="要求" :value="orderDetail.requirement?.name" />
              <van-cell v-if="orderDetail.remark" title="备注" :label="orderDetail.remark" />
            </van-cell-group>
          </div>

          <div class="detail-section">
            <div class="section-title">订购信息</div>
            <van-cell-group>
              <van-cell title="导师姓名" :value="orderDetail.supervisor_name" />
              <van-cell title="订购人" :value="orderDetail.orderer_name" />
              <van-cell title="联系电话" :value="orderDetail.contact_phone" />
              <van-cell title="到货日期" :value="orderDetail.delivery_date" />
            </van-cell-group>
          </div>

          <div class="detail-section">
            <div class="section-title">收货地址</div>
            <van-cell-group>
              <van-cell 
                title="所在地区" 
                :value="getRegionText(orderDetail)" 
              />
              <van-cell title="详细地址" :label="orderDetail.address" />
            </van-cell-group>
          </div>
        </template>

        <!-- 试剂耗材订购详情 -->
        <template v-else-if="orderDetail.type === 'reagent'">
          <div class="detail-section">
            <div class="section-title">试剂耗材信息</div>
            <van-cell-group>
              <van-cell title="名称" :value="orderDetail.name" />
              <van-cell title="品牌" :value="orderDetail.brand?.name" />
              <van-cell title="规格" :value="orderDetail.specification?.name" />
              <van-cell title="数量" :value="`${orderDetail.quantity} 件`" />
              <van-cell v-if="orderDetail.remark" title="备注" :label="orderDetail.remark" />
            </van-cell-group>
          </div>

          <div class="detail-section">
            <div class="section-title">订购信息</div>
            <van-cell-group>
              <van-cell title="订购人" :value="orderDetail.orderer_name" />
              <van-cell title="联系电话" :value="orderDetail.contact_phone" />
              <van-cell title="到货日期" :value="orderDetail.delivery_date" />
            </van-cell-group>
          </div>

          <div class="detail-section">
            <div class="section-title">收货地址</div>
            <van-cell-group>
              <van-cell 
                title="所在地区" 
                :value="getRegionText(orderDetail)" 
              />
              <van-cell title="详细地址" :label="orderDetail.address" />
            </van-cell-group>
          </div>
        </template>

        
      </div>

      <!-- 空状态 -->
      <van-empty v-else description="订单不存在" />
    </div>
  </app-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import AppLayout from '@/components/layout/AppLayout.vue'
import { getMyOrderDetail } from '@/api/order'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const orderDetail = ref(null)

/**
 * 性别映射
 */
const genderTextMap = {
  0: '雌性',
  1: '雄性',
  2: '不限'
}

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
 * 获取地区文本
 * @param {object} order - 订单对象
 * @returns {string} 地区文本
 */
function getRegionText(order) {
  const parts = []
  if (order.province?.name) parts.push(order.province.name)
  if (order.city?.name) parts.push(order.city.name)
  if (order.district?.name) parts.push(order.district.name)
  return parts.length > 0 ? parts.join(' ') : '-'
}

/**
 * 加载订单详情
 */
async function loadOrderDetail() {
  try {
    loading.value = true
    const { type, id } = route.params
    
    if (!type || !id) {
      showToast('订单参数错误')
      return
    }
    
    const data = await getMyOrderDetail(type, id)
    
    // 补充缺失的字段
    if (data) {
      
      // 添加性别文本（动物订购，如果后端没返回）
      if (data.type === 'animal' && data.gender !== undefined && !data.gender_text) {
        data.gender_text = genderTextMap[data.gender] || '未知'
      }
      
      // 处理省市区（如果只有ID没有对象）
      if (data.province_id && !data.province) {
        data.province = { id: data.province_id, name: '' }
      }
      if (data.city_id && !data.city) {
        data.city = { id: data.city_id, name: '' }
      }
      if (data.district_id && !data.district) {
        data.district = { id: data.district_id, name: '' }
      }
    }
    
    orderDetail.value = data
  } catch (error) {
    console.error('加载订单详情失败:', error)
    showToast(error.message || '加载订单详情失败')
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
  background-color: @bg-color;
  min-height: 100vh;

  .order-detail {

    .detail-section {
      margin-bottom: @padding-lg;

      .section-title {
        font-size: @font-size-lg;
        font-weight: 600;
        color: @text-color;
        margin-bottom: @padding-sm;
        padding-left: @padding-xs;
        border-left: 3px solid var(--primary-color);
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
          color: @text-color-2;
          flex: 0 0 100px;
        }

        .van-cell__value {
          color: @text-color;
          text-align: right;
          flex: 1;
        }

        .van-cell__label {
          color: @text-color-2;
          margin-top: 4px;
          line-height: 1.5;
          text-align: left;
        }
      }
    }
  }
}
</style>
