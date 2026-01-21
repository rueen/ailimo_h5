<!--
 * @Author: diaochan diaochan@seatent.com
 * @Date: 2026-01-17 19:16:48
 * @LastEditors: diaochan diaochan@seatent.com
 * @LastEditTime: 2026-01-21 19:50:11
 * @FilePath: /ailimo_h5/src/views/my/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <app-layout>
    <div class="my-page page-content">
      <div class="user-header">
        <van-icon name="user-circle-o" size="48" color="#07C160" />
        <div class="user-info">
          <div class="user-name-row">
            <h3>{{ userStore.userInfo?.name }}</h3>
            <span class="user-status" :class="userStatusClass">{{ userStatusText }}</span>
          </div>
          <p>{{ userStore.userInfo?.phone }}</p>
        </div>
      </div>

      <van-cell-group>
        <van-cell title="用户编号" :value="userStore.userInfo?.user_no" />
        <van-cell title="组织机构" :value="userStore.userInfo?.organization?.name" />
        <van-cell title="学院" :value="userStore.userInfo?.department?.name" />
        <van-cell title="课题组" :value="userStore.userInfo?.research_group?.name" />
        <van-cell
          v-if="userStore.userInfo?.province"
          title="收货地址"
          :value="`${userStore.userInfo.province.name} ${userStore.userInfo.city.name} ${userStore.userInfo.district.name}`"
        />
        <van-cell v-if="userStore.userInfo?.address" title="详细地址" :label="userStore.userInfo.address" />
      </van-cell-group>

      <van-cell-group style="margin-top: 16px;">
        <van-cell title="我的订单" is-link @click="router.push('/orders')" />
        <van-cell title="审核状态" is-link @click="router.push('/audit-status')" />
      </van-cell-group>

      <div class="logout-btn">
        <van-button block round type="danger" @click="handleLogout">
          退出登录
        </van-button>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

/**
 * 用户状态文本
 */
const userStatusText = computed(() => {
  const status = userStore.userInfo?.status
  if (status === 0) return '已禁用'
  if (status === 1) return '正常'
  return '未知'
})

/**
 * 用户状态样式类
 */
const userStatusClass = computed(() => {
  const status = userStore.userInfo?.status
  if (status === 0) return 'status-disabled'
  if (status === 1) return 'status-normal'
  return ''
})

/**
 * 退出登录
 */
async function handleLogout() {
  showConfirmDialog({
    title: '提示',
    message: '确定要退出登录吗？'
  })
    .then(async () => {
      await userStore.logout()
      router.replace('/home')
    })
    .catch(() => {})
}

/**
 * 页面加载时获取最新用户信息
 */
onMounted(async () => {
  try {
    await userStore.getProfile()
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
})
</script>

<style lang="less" scoped>
.my-page {
  .user-header {
    display: flex;
    align-items: center;
    gap: @padding-md;
    padding: @padding-xl;
    background-color: var(--bg-color-white);
    border-radius: @border-radius-md;
    margin-bottom: @padding-md;

    .user-info {
      flex: 1;

      .user-name-row {
        display: flex;
        align-items: center;
        gap: @padding-xs;
        margin-bottom: 4px;
      }

      h3 {
        font-size: @font-size-lg;
        font-weight: 600;
      }

      .user-status {
        display: inline-block;
        padding: 2px 8px;
        font-size: @font-size-xs;
        border-radius: @border-radius-sm;
        font-weight: 500;

        &.status-normal {
          color: @success-color;
          background-color: rgba(7, 193, 96, 0.1);
        }

        &.status-disabled {
          color: @danger-color;
          background-color: rgba(238, 10, 36, 0.1);
        }
      }

      p {
        font-size: @font-size-sm;
        color: var(--text-color-3);
      }
    }
  }

  .logout-btn {
    margin-top: @padding-xl;
  }
}
</style>
