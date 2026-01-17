<template>
  <app-layout>
    <div class="services-page page-content">
      <h2 class="page-title">服务中心</h2>
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
    title: '设备租赁',
    description: '设备分类、设备名称、预约时间、使用用途',
    icon: 'https://ailimolab.oss-cn-hangzhou.aliyuncs.com/images/h5/device.png',
    path: '/equipment'
  },
  {
    title: '笼位租赁',
    description: '数量、预约时间、用途（短期实验、长期繁殖）',
    icon: 'https://ailimolab.oss-cn-hangzhou.aliyuncs.com/images/h5/cage.png',
    path: '/cage'
  },
  {
    title: '实验代操作',
    description: '动物类型、数量、操作内容、预约时间',
    icon: 'https://ailimolab.oss-cn-hangzhou.aliyuncs.com/images/h5/operation.png',
    path: '/experiment'
  },
  {
    title: '动物订购',
    description: '品牌要求、种类/品系、规格、性别、到货日期等',
    icon: 'https://ailimolab.oss-cn-hangzhou.aliyuncs.com/images/h5/animal.png',
    path: '/animal'
  },
  {
    title: '试剂耗材订购',
    description: '品牌要求、种类/品系、规格、性别、到货日期等',
    icon: 'https://ailimolab.oss-cn-hangzhou.aliyuncs.com/images/h5/reagent.png',
    path: '/reagent'
  }
]
</script>

<style lang="less" scoped>
.services-page {
  .page-title {
    font-size: @font-size-xl;
    font-weight: 600;
    margin-bottom: @padding-lg;
  }

  .services-list {
    display: flex;
    flex-direction: column;
    gap: @padding-md;
  }
}
</style>
