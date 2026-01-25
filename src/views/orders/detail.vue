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
            <van-cell title="订单编号">
              <template #value>
                <div class="order-sn-cell">
                  <span>#{{ orderDetail.order_sn }}</span>
                  <van-button
                    size="mini"
                    type="primary"
                    plain
                    icon="copy"
                    @click.stop="copyOrderSn(orderDetail.order_sn)"
                  >
                    复制
                  </van-button>
                </div>
              </template>
            </van-cell>
            <van-cell title="创建时间" :value="orderDetail.created_at" />
            <van-cell v-if="orderDetail.audit_time" title="审核时间" :value="orderDetail.audit_time" />
            <van-cell v-if="orderDetail.completed_time" title="完成时间" :value="orderDetail.completed_time" />
          </van-cell-group>
        </div>

        <!-- 设备预约详情 -->
        <template v-if="orderDetail.type === 'equipment'">
          <div class="detail-section">
            <div class="section-title">设备信息</div>
            <van-cell-group>
              <van-cell title="设备名称" :value="orderDetail.equipment?.name" is-link @click="router.push(`/equipment/${orderDetail.equipment_id}`)" />
              <van-cell v-if="orderDetail.remark" title="备注" :value="orderDetail.remark" />
            </van-cell-group>
          </div>

          <div class="detail-section">
            <div class="section-title">预约信息</div>
            <van-cell-group>
              <van-cell title="预约时间" :label="formatTimeSlots(orderDetail.time_slots)" />
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
              <van-cell v-if="orderDetail.remark" title="备注" :value="orderDetail.remark" />
            </van-cell-group>
          </div>

          <div class="detail-section">
            <div class="section-title">预约信息</div>
            <van-cell-group>
              <van-cell 
                v-if="orderDetail.start_date"
                title="开始日期" 
                :value="orderDetail.start_date" 
              />
              <van-cell 
                v-if="orderDetail.start_date"
                title="结束日期" 
                :value="formatEndDate(orderDetail.end_date)"
                :label="getReservationPeriodText(orderDetail.start_date, orderDetail.end_date)"
              />
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
              <van-cell v-if="orderDetail.remark" title="备注" :value="orderDetail.remark" />
            </van-cell-group>
          </div>

          <div class="detail-section">
            <div class="section-title">预约信息</div>
            <van-cell-group>
              <van-cell title="预约时间" :label="formatTimeSlots(orderDetail.time_slots)" />
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
              <van-cell title="是否打耳标" :value="getNeedEarTagText(orderDetail.need_ear_tag)" />
              <van-cell v-if="orderDetail.remark" title="备注" :value="orderDetail.remark" />
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
                title="收货地址" 
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
              <van-cell title="品牌" :value="orderDetail.brand_name" />
              <van-cell title="规格" :value="orderDetail.specification_name" />
              <van-cell title="数量" :value="`${orderDetail.quantity} 件`" />
              <van-cell v-if="orderDetail.remark" title="备注" :value="orderDetail.remark" />
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
                title="收货地址" 
                :value="getRegionText(orderDetail)" 
              />
              <van-cell title="详细地址" :value="orderDetail.address" />
            </van-cell-group>
          </div>
        </template>

        <div class="contact-tip">
          如需修改订单信息，请联系客服
          <template v-if="companyInfo?.contact_phone">
            ，客服电话：<a :href="`tel:${companyInfo.contact_phone}`">{{ companyInfo.contact_phone }}</a>
          </template>
        </div>
      </div>

      <!-- 空状态 -->
      <van-empty v-else description="订单不存在" />
    </div>
  </app-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import { getMyOrderDetail } from '@/api/order'
import { formatTimeSlotsDisplay, getReservationPeriod } from '@/utils/timeSlot'
import { copyToClipboard } from '@/utils/clipboard'
import { useCompanyStore } from '@/stores/company'

const route = useRoute()
const router = useRouter()
const companyStore = useCompanyStore()
const loading = ref(false)
const orderDetail = ref(null)

/**
 * 公司信息（客服电话来源）
 */
const companyInfo = computed(() => companyStore.companyInfo)

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
 * 格式化时间段显示
 * @param {Array<string>} timeSlots - 时间段数组
 * @returns {string} 格式化后的文本
 */
function formatTimeSlots(timeSlots) {
  return formatTimeSlotsDisplay(timeSlots)
}

/**
 * 格式化结束日期显示
 * @param {string|null} endDate - 结束日期
 * @returns {string} 格式化后的文本
 */
function formatEndDate(endDate) {
  if (!endDate || endDate === null) {
    return '长期'
  }
  return endDate
}

/**
 * 获取预约期限文本
 * @param {string} startDate - 开始日期
 * @param {string|null} endDate - 结束日期
 * @returns {string} 预约期限文本
 */
function getReservationPeriodText(startDate, endDate) {
  return getReservationPeriod(startDate, endDate)
}

/**
 * 获取是否打耳标文本
 * @param {number|boolean} needEarTag - 是否打耳标：0/false-否，1/true-是
 * @returns {string} 是否打耳标文本
 */
function getNeedEarTagText(needEarTag) {
  if (needEarTag === 1 || needEarTag === true) {
    return '是'
  }
  return '否'
}

/**
 * 复制订单编号
 * @param {string} orderSn - 订单编号
 */
async function copyOrderSn(orderSn) {
  await copyToClipboard(orderSn, {
    successMessage: '订单编号已复制',
    errorMessage: '复制失败，请手动复制'
  })
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

      .order-sn-cell {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
      }
    }

    .contact-tip {
      padding: @padding-md @padding-lg;
      font-size: @font-size-sm;
      color: var(--text-color-3);
      background-color: var(--bg-color-white);
      border-radius: @border-radius-md;
      margin-top: @padding-md;
      line-height: 1.5;

      a {
        color: @primary-color;
        text-decoration: none;
      }
    }
  }
}
</style>
