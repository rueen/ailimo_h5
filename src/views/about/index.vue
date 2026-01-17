<template>
  <app-layout>
    <div class="about-page page-content">
      <van-loading v-if="loading" vertical>加载中...</van-loading>
      
      <div v-else-if="companyInfo" class="about-content">
        <h2 class="page-title">关于我们</h2>
        
        <div v-if="companyInfo.company_name" class="info-section">
          <h3>公司名称</h3>
          <p>{{ companyInfo.company_name }}</p>
        </div>

        <div v-if="companyInfo.company_intro" class="info-section">
          <h3>公司简介</h3>
          <p>{{ companyInfo.company_intro }}</p>
        </div>

        <div v-if="companyInfo.service_concept" class="info-section">
          <h3>服务理念</h3>
          <p>{{ companyInfo.service_concept }}</p>
        </div>

        <div class="contact-section">
          <h3>联系方式</h3>
          <van-cell-group inset>
            <van-cell v-if="companyInfo.contact_phone" title="联系电话" :value="companyInfo.contact_phone" />
            <van-cell v-if="companyInfo.email" title="邮箱" :value="companyInfo.email" />
            <van-cell v-if="companyInfo.company_address" title="公司地址" :label="companyInfo.company_address" />
            <van-cell v-if="companyInfo.work_time" title="工作时间" :value="companyInfo.work_time" />
          </van-cell-group>
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { getCompanyInfo } from '@/api/company'

const loading = ref(true)
const companyInfo = ref(null)

async function loadCompanyInfo() {
  try {
    loading.value = true
    companyInfo.value = await getCompanyInfo()
  } catch (error) {
    console.error('加载公司信息失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCompanyInfo()
})
</script>

<style lang="less" scoped>
.about-page {
  .page-title {
    font-size: @font-size-xl;
    font-weight: 600;
    margin-bottom: @padding-lg;
  }

  .info-section {
    margin-bottom: @padding-xl;

    h3 {
      font-size: @font-size-lg;
      font-weight: 600;
      margin-bottom: @padding-sm;
      color: var(--text-color);
    }

    p {
      font-size: @font-size-md;
      color: var(--text-color-2);
      line-height: 1.8;
      white-space: pre-wrap;
    }
  }

  .contact-section {
    h3 {
      font-size: @font-size-lg;
      font-weight: 600;
      margin-bottom: @padding-md;
      color: var(--text-color);
    }
  }
}
</style>
