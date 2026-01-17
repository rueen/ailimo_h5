<template>
  <app-layout :show-header="false">
    <div class="login-page">
      <div class="login-container">
        <!-- Logo -->
        <div class="login-logo">
          <img :src="logoUrl" alt="艾力默" />
          <h1>艾力默用户端</h1>
        </div>

        <!-- 登录表单 -->
        <van-form @submit="handleLogin">
          <van-cell-group inset>
            <van-field
              v-model="formData.phone"
              name="phone"
              label="手机号"
              placeholder="请输入手机号"
              type="tel"
              maxlength="11"
              :rules="[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
              ]"
            />
            <van-field
              v-model="formData.code"
              name="code"
              label="验证码"
              placeholder="请输入验证码"
              maxlength="6"
              :rules="[
                { required: true, message: '请输入验证码' },
                { pattern: /^\d{6}$/, message: '验证码为6位数字' }
              ]"
            >
              <template #button>
                <van-button
                  size="small"
                  type="primary"
                  :disabled="countdown > 0"
                  @click="handleSendCode"
                >
                  {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
                </van-button>
              </template>
            </van-field>
          </van-cell-group>

          <div class="login-actions">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              :loading="loading"
            >
              登录
            </van-button>
          </div>
        </van-form>

        <!-- 注册链接 -->
        <div class="login-footer">
          <span>还没有账号？</span>
          <a @click="goRegister">立即注册</a>
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useUserStore } from '@/stores/user'
import { sendCode } from '@/api/auth'
import { validatePhone } from '@/utils/validate'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

/**
 * Logo 地址
 */
const logoUrl = 'https://ailimolab.oss-cn-hangzhou.aliyuncs.com/images/h5/logo.png'

/**
 * 表单数据
 */
const formData = ref({
  phone: '',
  code: ''
})

/**
 * 加载状态
 */
const loading = ref(false)

/**
 * 倒计时
 */
const countdown = ref(0)

/**
 * 倒计时定时器
 */
let timer = null

/**
 * 发送验证码
 */
async function handleSendCode() {
  // 验证手机号
  if (!formData.value.phone) {
    showToast('请输入手机号')
    return
  }
  if (!validatePhone(formData.value.phone)) {
    showToast('手机号格式不正确')
    return
  }

  try {
    await sendCode({
      phone: formData.value.phone,
      type: 1 // 1-登录
    })
    showToast('验证码已发送')
    
    // 开始倒计时
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
        timer = null
      }
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败:', error)
  }
}

/**
 * 登录
 */
async function handleLogin() {
  try {
    loading.value = true
    await userStore.login(formData.value)
    showToast('登录成功')
    
    // 跳转到重定向页面或首页
    const redirect = route.query.redirect || '/home'
    router.replace(redirect)
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 去注册
 */
function goRegister() {
  router.push('/register')
}

/**
 * 组件卸载时清除定时器
 */
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="less" scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: @padding-md;

  .login-container {
    width: 100%;
    max-width: 400px;
    background-color: var(--bg-color-white);
    border-radius: @border-radius-lg;
    padding: @padding-xl;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .login-logo {
    text-align: center;
    margin-bottom: @padding-xl;

    img {
      width: 80px;
      height: 80px;
      margin-bottom: @padding-md;
    }

    h1 {
      font-size: @font-size-xxl;
      font-weight: 600;
      color: var(--text-color);
    }
  }

  .login-actions {
    margin-top: @padding-lg;
    padding: 0 @padding-md;
  }

  .login-footer {
    text-align: center;
    margin-top: @padding-lg;
    font-size: @font-size-sm;
    color: var(--text-color-2);

    a {
      color: var(--primary-color);
      margin-left: 8px;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    }
  }
}
</style>
