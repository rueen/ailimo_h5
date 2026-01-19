<!--
 * @Author: diaochan diaochan@seatent.com
 * @Date: 2026-01-17 19:16:39
 * @LastEditors: diaochan diaochan@seatent.com
 * @LastEditTime: 2026-01-19 16:01:00
 * @FilePath: /ailimo_h5/src/views/about/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <app-layout>
    <div class="about-page page-content">
      <div v-if="loading" class="about-loading">
        <van-loading vertical>加载中...</van-loading>
      </div>

      <div v-else-if="companyInfo" class="about-content">
        <section v-if="companyInfo.company_name" class="info-section">
          <h3 class="section-head">公司名称</h3>
          <p class="section-body">{{ companyInfo.company_name }}</p>
        </section>

        <section v-if="companyInfo.company_intro" class="info-section">
          <h3 class="section-head">公司简介</h3>
          <p class="section-body">{{ companyInfo.company_intro }}</p>
        </section>

        <section v-if="companyInfo.service_concept" class="info-section">
          <h3 class="section-head">服务理念</h3>
          <p class="section-body">{{ companyInfo.service_concept }}</p>
        </section>

        <section class="contact-section">
          <h3 class="section-head">联系方式</h3>
          <van-cell-group>
            <van-cell v-if="companyInfo.contact_phone" title="联系电话" :value="companyInfo.contact_phone" />
            <van-cell v-if="companyInfo.email" title="邮箱" :value="companyInfo.email" />
            <van-cell v-if="companyInfo.company_address" title="公司地址" :label="companyInfo.company_address" />
            <van-cell v-if="companyInfo.work_time" title="工作时间" :value="companyInfo.work_time" />
          </van-cell-group>
        </section>
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
  padding-top: @padding-md;

  /* 加载状态：垂直居中，避免布局跳动 */
  .about-loading {
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: @padding-xl;
  }

  /* 信息块 / 联系方式的统一卡片样式 */
  .info-section,
  .contact-section {
    margin-bottom: @padding-lg;
    padding: @padding-lg;
    background-color: var(--bg-color-white);
    border-radius: @border-radius-md;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  /* 区块标题：左侧主题色竖线强调 */
  .section-head {
    position: relative;
    padding-left: (@padding-sm + 4px);
    margin-bottom: @padding-md;
    font-size: @font-size-lg;
    font-weight: 600;
    color: var(--text-color);
    border-left: 4px solid @primary-color;
  }

  /* 正文：行高与换行 */
  .section-body {
    margin: 0;
    font-size: @font-size-md;
    color: var(--text-color-2);
    line-height: 1.8;
    white-space: pre-wrap;
  }

  /* 联系方式：底部无外边距，Cell 组与卡片统一 */
  .contact-section {
    margin-bottom: 0;

    .section-head {
      margin-bottom: @padding-sm;
    }

    :deep(.van-cell-group) {
      margin: 0;
      background: transparent;
    }

    :deep(.van-cell) {
      padding: @padding-sm @padding-md;
    }
  }

  @media (max-width: 767px) {
    .info-section,
    .contact-section {
      padding: @padding-md;
    }

    .section-head {
      font-size: @font-size-md;
    }

    .section-body {
      font-size: @font-size-sm;
    }
  }
}
</style>
