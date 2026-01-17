<template>
  <div class="app-footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-info">
          <div class="footer-logo">
            <img :src="logoUrl" alt="艾力默" />
            <span>艾力默生物科技</span>
          </div>
          <p class="footer-desc">专业的实验动物服务平台</p>
        </div>

        <div v-if="companyInfo" class="footer-contact">
          <h4>联系我们</h4>
          <p v-if="companyInfo.contact_phone">
            <van-icon name="phone-o" />
            {{ companyInfo.contact_phone }}
          </p>
          <p v-if="companyInfo.email">
            <van-icon name="envelop-o" />
            {{ companyInfo.email }}
          </p>
          <p v-if="companyInfo.company_address">
            <van-icon name="location-o" />
            {{ companyInfo.company_address }}
          </p>
        </div>
      </div>

      <div class="footer-copyright">
        <p>Copyright © 2026 浙江艾力默生物技术有限公司 版权所有</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCompanyStore } from '@/stores/company'

/**
 * Logo 地址
 */
const logoUrl = 'https://ailimolab.oss-cn-hangzhou.aliyuncs.com/images/h5/logo.png'

/**
 * 公司信息（从 store 获取，无需重复请求）
 */
const companyStore = useCompanyStore()
const companyInfo = computed(() => companyStore.companyInfo)
</script>

<style lang="less" scoped>
.app-footer {
  background-color: #2c3e50;
  color: #fff;
  padding: @padding-xl 0;

  .footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 @padding-md;
  }

  .footer-content {
    display: flex;
    flex-wrap: wrap;
    gap: 40px;
    margin-bottom: @padding-lg;
  }

  .footer-info {
    flex: 1;
    min-width: 200px;

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      img {
        width: 40px;
        height: 40px;
      }

      span {
        font-size: @font-size-lg;
        font-weight: 600;
      }
    }

    .footer-desc {
      color: rgba(255, 255, 255, 0.7);
      font-size: @font-size-sm;
    }
  }

  .footer-contact {
    flex: 1;
    min-width: 200px;

    h4 {
      font-size: @font-size-lg;
      margin-bottom: 12px;
    }

    p {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      color: rgba(255, 255, 255, 0.8);
      font-size: @font-size-sm;
    }
  }

  .footer-copyright {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: @padding-md;
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    font-size: @font-size-xs;
  }

  // 移动端适配
  @media (max-width: 768px) {
    padding: @padding-md 0;

    .footer-content {
      flex-direction: column;
      gap: 20px;
    }
  }
}
</style>
