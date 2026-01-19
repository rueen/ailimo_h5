<template>
  <app-layout>
    <div class="audit-status-page">
      <div class="audit-container">
        <!-- 审核状态图标 -->
        <div class="audit-icon" :class="`status-${auditStatus}`">
          <van-icon
            v-if="auditStatus === 0"
            name="clock-o"
            size="80"
            color="#FF976A"
          />
          <van-icon
            v-else-if="auditStatus === 1"
            name="checked"
            size="80"
            color="#07C160"
          />
          <van-icon
            v-else-if="auditStatus === 2"
            name="close"
            size="80"
            color="#EE0A24"
          />
        </div>

        <!-- 审核状态文本 -->
        <h2 class="audit-title">{{ statusTitle }}</h2>
        <p class="audit-desc">{{ statusDesc }}</p>

        <!-- 用户信息 -->
        <van-cell-group v-if="auditInfo" inset class="audit-info">
          <van-cell title="用户编号" :value="auditInfo.user_no" />
          <van-cell title="姓名" :value="auditInfo.name" />
          <van-cell title="手机号" :value="auditInfo.phone" />
          <van-cell title="提交时间" :value="formatDateTime(auditInfo.created_at)" />
          <van-cell
            v-if="auditInfo.audit_time"
            title="审核时间"
            :value="formatDateTime(auditInfo.audit_time)"
          />
          <van-cell
            v-if="auditInfo.reject_reason"
            title="拒绝原因"
            :label="auditInfo.reject_reason"
          />
        </van-cell-group>

        <!-- 操作按钮 -->
        <div class="audit-actions">
          <van-button
            v-if="auditStatus === 0"
            block
            round
            type="primary"
            @click="refreshStatus"
          >
            刷新状态
          </van-button>
          <van-button
            v-else-if="auditStatus === 1"
            block
            round
            type="primary"
            @click="goHome"
          >
            进入首页
          </van-button>
          <van-button
            v-else-if="auditStatus === 2"
            block
            round
            type="primary"
            @click="contactAdmin"
          >
            联系管理员
          </van-button>
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useUserStore } from '@/stores/user'
import { formatDateTime } from '@/utils/format'

const router = useRouter()
const userStore = useUserStore()

/**
 * 审核信息（从 user store 获取）
 */
const auditInfo = computed(() => userStore.userInfo)

/**
 * 审核状态
 */
const auditStatus = computed(() => {
  return auditInfo.value?.audit_status ?? 0
})

/**
 * 状态标题
 */
const statusTitle = computed(() => {
  const titles = {
    0: '账号审核中',
    1: '审核已通过',
    2: '审核未通过'
  }
  return titles[auditStatus.value] || '未知状态'
})

/**
 * 状态描述
 */
const statusDesc = computed(() => {
  const descs = {
    0: '您的账号正在审核中，请耐心等待',
    1: '恭喜您，账号审核已通过，可以正常使用服务了',
    2: '很抱歉，您的账号审核未通过，请联系管理员'
  }
  return descs[auditStatus.value] || ''
})

/**
 * 加载审核状态（使用 store 的 getProfile）
 */
async function loadAuditStatus() {
  try {
    await userStore.getProfile()
  } catch (error) {
    console.error('加载审核状态失败:', error)
  }
}

/**
 * 刷新状态
 */
async function refreshStatus() {
  showToast('刷新中...')
  await loadAuditStatus()
  if (auditStatus.value === 1) {
    showToast('审核已通过')
  } else if (auditStatus.value === 2) {
    showToast('审核未通过')
  } else {
    showToast('仍在审核中')
  }
}

/**
 * 回到首页
 */
function goHome() {
  router.replace('/home')
}

/**
 * 联系管理员
 */
function contactAdmin() {
  showToast('请拨打客服电话联系管理员')
}

onMounted(() => {
  loadAuditStatus()
})
</script>

<style lang="less" scoped>
.audit-status-page {
  min-height: calc(100vh - 56px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: @padding-md;

  .audit-container {
    width: 100%;
    max-width: 500px;
    text-align: center;
  }

  .audit-icon {
    margin-bottom: @padding-lg;

    &.status-0 {
      animation: pulse 2s infinite;
    }

    &.status-1 {
      animation: scaleIn 0.5s ease-out;
    }

    &.status-2 {
      animation: shake 0.5s ease-out;
    }
  }

  .audit-title {
    font-size: @font-size-xxl;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: @padding-sm;
  }

  .audit-desc {
    font-size: @font-size-md;
    color: var(--text-color-2);
    margin-bottom: @padding-xl;
  }

  .audit-info {
    margin-bottom: @padding-xl;
    text-align: left;
  }

  .audit-actions {
    padding: 0 @padding-md;
  }
}

// 动画
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}
</style>
