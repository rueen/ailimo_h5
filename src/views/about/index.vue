<!--
 * @Author: diaochan diaochan@seatent.com
 * @Date: 2026-01-17 19:16:39
 * @LastEditors: diaochan diaochan@seatent.com
 * @LastEditTime: 2026-01-18 21:30:10
 * @FilePath: /ailimo_h5/src/views/about/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <app-layout>
    <div class="about-page page-content">
      <van-loading v-if="loading" vertical>加载中...</van-loading>
      
      <div v-else-if="companyInfo" class="about-content">
        
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
          <van-cell-group>
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
import { computed } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useCompanyStore } from '@/stores/company'

const companyStore = useCompanyStore()

/**
 * 加载状态（从 store 获取）
 */
const loading = computed(() => companyStore.loading && !companyStore.loaded)

/**
 * 公司信息（从 store 获取，无需重复请求）
 */
const companyInfo = computed(() => companyStore.companyInfo)
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
