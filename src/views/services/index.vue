<!--
 * @Author: diaochan diaochan@seatent.com
 * @Date: 2026-01-17 19:16:32
 * @LastEditors: diaochan diaochan@seatent.com
 * @LastEditTime: 2026-01-22 16:37:37
 * @FilePath: /ailimo_h5/src/views/services/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <app-layout>
    <div class="services-page page-content">
      <div class="services-list">
        <service-card
          v-for="service in serviceList"
          :key="service.path"
          :icon="service.icon"
          :title="service.title"
          :description="service.description"
          @click="router.push(service.path)"
        />
      </div>
      
      <!-- 更多服务入口 -->
      <div class="more-services" @click="router.push('/other-services')">
        <van-icon name="apps-o" />
        <div class="more-content">
          <h3 class="more-title">更多服务</h3>
          <p class="more-desc">查看其他技术支持服务</p>
        </div>
        <van-icon name="arrow" class="more-arrow" />
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import ServiceCard from '@/components/common/ServiceCard.vue'

const router = useRouter()

const serviceList = [
  {
    title: '设备预约',
    description: '设备分类、设备名称、预约时间、使用用途',
    icon: 'https://ailimolab.oss-cn-hangzhou.aliyuncs.com/images/h5/device.png',
    path: '/services/equipment'
  },
  {
    title: '笼位预约',
    description: '数量、预约时间、用途（短期实验、长期繁殖）',
    icon: 'https://ailimolab.oss-cn-hangzhou.aliyuncs.com/images/h5/cage.png',
    path: '/services/cage'
  },
  {
    title: '实验代操作',
    description: '动物类型、数量、操作内容、预约时间',
    icon: 'https://ailimolab.oss-cn-hangzhou.aliyuncs.com/images/h5/operation.png',
    path: '/services/experiment'
  },
  {
    title: '动物订购',
    description: '品牌要求、种类/品系、规格、性别、到货日期等',
    icon: 'https://ailimolab.oss-cn-hangzhou.aliyuncs.com/images/h5/animal.png',
    path: '/services/animal'
  },
  {
    title: '试剂耗材订购',
    description: '品牌要求、种类/品系、规格、性别、到货日期等',
    icon: 'https://ailimolab.oss-cn-hangzhou.aliyuncs.com/images/h5/reagent.png',
    path: '/services/reagent'
  }
]
</script>

<style lang="less" scoped>
.services-page {

  .services-list {
    display: flex;
    flex-direction: column;
    gap: @padding-md;
  }

  .more-services {
    display: flex;
    align-items: center;
    gap: @padding-md;
    background-color: var(--bg-color-white);
    border-radius: @border-radius-md;
    padding: @padding-md;
    margin-top: @padding-md;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      transform: translateY(-2px);
    }

    :deep(.van-icon) {
      &:first-child {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: @primary-color;
        color: #fff;
        border-radius: 50%;
        font-size: 24px;
        flex-shrink: 0;
      }
    }

    .more-content {
      flex: 1;
      min-width: 0;

      .more-title {
        font-size: @font-size-lg;
        font-weight: 600;
        color: var(--text-color);
        margin-bottom: 4px;
      }

      .more-desc {
        font-size: @font-size-sm;
        color: var(--text-color-3);
      }
    }

    .more-arrow {
      color: var(--text-color-3);
      font-size: 16px;
      flex-shrink: 0;
    }
  }
}
</style>
