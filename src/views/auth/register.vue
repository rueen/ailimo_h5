<template>
  <app-layout :show-header="false">
    <div class="register-page page-content">
      <page-title title="用户注册" @back="goHome" />
      <div class="register-container">

        <!-- 注册表单 -->
        <van-form @submit="handleRegister">
          <van-cell-group inset>
            <van-field
              v-model="formData.name"
              name="name"
              label="姓名"
              placeholder="请输入姓名"
              :rules="[{ required: true, message: '请输入姓名' }]"
            />
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
            
            <van-field
              v-model="organizationText"
              is-link
              readonly
              name="organization"
              label="组织机构"
              placeholder="请选择组织机构"
              :rules="[{ required: true, message: '请选择组织机构' }]"
              @click="showOrganizationPicker = true"
            />
            <!-- 组织机构选择"其他"时显示输入框 -->
            <van-field
              v-if="formData.organization_id === 0"
              v-model="formData.user_input_organization_name"
              name="user_input_organization_name"
              label="组织机构名称"
              placeholder="请输入组织机构名称"
              maxlength="100"
              show-word-limit
              :rules="[
                { required: true, message: '请输入组织机构名称' },
                { 
                  validator: (value) => value && value.trim().length > 0,
                  message: '组织机构名称不能为空'
                }
              ]"
            />
            
            <van-field
              v-model="departmentText"
              is-link
              readonly
              name="department"
              label="学院"
              placeholder="请选择学院"
              :disabled="!isOrganizationSelected"
              :rules="[{ required: true, message: '请选择学院' }]"
              @click="handleDepartmentClick"
            />
            <!-- 学院选择"其他"时显示输入框 -->
            <van-field
              v-if="formData.department_id === 0"
              v-model="formData.user_input_department_name"
              name="user_input_department_name"
              label="学院名称"
              placeholder="请输入学院名称"
              maxlength="100"
              show-word-limit
              :rules="[
                { required: true, message: '请输入学院名称' },
                { 
                  validator: (value) => value && value.trim().length > 0,
                  message: '学院名称不能为空'
                }
              ]"
            />
            
            <van-field
              v-model="researchGroupText"
              is-link
              readonly
              name="researchGroup"
              label="课题组"
              placeholder="请选择课题组"
              :disabled="!isDepartmentSelected"
              :rules="[{ required: true, message: '请选择课题组' }]"
              @click="handleResearchGroupClick"
            />
            <!-- 课题组选择"其他"时显示输入框 -->
            <van-field
              v-if="formData.research_group_id === 0"
              v-model="formData.user_input_research_group_name"
              name="user_input_research_group_name"
              label="课题组名称"
              placeholder="请输入课题组名称"
              maxlength="100"
              show-word-limit
              :rules="[
                { required: true, message: '请输入课题组名称' },
                { 
                  validator: (value) => value && value.trim().length > 0,
                  message: '课题组名称不能为空'
                }
              ]"
            />

            <region-picker
              v-model="formData.region"
              label="所在地区"
              placeholder="请选择省市区（选填）"
            />

            <van-field
              v-model="formData.address"
              name="address"
              label="详细地址"
              placeholder="请输入详细地址（选填）"
              type="textarea"
              rows="2"
            />
          </van-cell-group>

          <div class="register-actions">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              :loading="loading"
            >
              提交注册
            </van-button>
          </div>
        </van-form>

        <!-- 登录链接 -->
        <div class="register-footer">
          <span>已有账号？</span>
          <a @click="goLogin">立即登录</a>
        </div>
      </div>

      <!-- 组织机构选择器 -->
      <van-popup v-model:show="showOrganizationPicker" position="bottom">
        <van-picker
          title="选择组织机构"
          :columns="organizationList"
          @confirm="onConfirmOrganization"
          @cancel="showOrganizationPicker = false"
        />
      </van-popup>

      <!-- 学院选择器 -->
      <van-popup v-model:show="showDepartmentPicker" position="bottom">
        <van-picker
          title="选择学院"
          :columns="departmentList"
          @confirm="onConfirmDepartment"
          @cancel="showDepartmentPicker = false"
        />
      </van-popup>

      <!-- 课题组选择器 -->
      <van-popup v-model:show="showResearchGroupPicker" position="bottom">
        <van-picker
          title="选择课题组"
          :columns="researchGroupList"
          @confirm="onConfirmResearchGroup"
          @cancel="showResearchGroupPicker = false"
        />
      </van-popup>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import AppLayout from '@/components/layout/AppLayout.vue'
import PageTitle from '@/components/common/PageTitle.vue'
import RegionPicker from '@/components/common/RegionPicker.vue'
import { register, sendCode } from '@/api/auth'
import { getOrganizations, getDepartments, getResearchGroups } from '@/api/common'
import { validatePhone } from '@/utils/validate'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

/**
 * 表单数据
 */
const formData = ref({
  name: '',
  phone: '',
  code: '',
  organization_id: null,
  department_id: null,
  research_group_id: null,
  user_input_organization_name: null,
  user_input_department_name: null,
  user_input_research_group_name: null,
  region: {},
  address: ''
})

/**
 * 加载状态
 */
const loading = ref(false)

/**
 * 倒计时
 */
const countdown = ref(0)
let timer = null

/**
 * 组织机构相关
 */
const showOrganizationPicker = ref(false)
const organizationList = ref([])
const organizationText = computed(() => {
  const item = organizationList.value.find((o) => o.value === formData.value.organization_id)
  return item ? item.text : ''
})

/**
 * 学院相关
 */
const showDepartmentPicker = ref(false)
const departmentList = ref([])
const departmentText = computed(() => {
  const item = departmentList.value.find((d) => d.value === formData.value.department_id)
  return item ? item.text : ''
})

/**
 * 课题组相关
 */
const showResearchGroupPicker = ref(false)
const researchGroupList = ref([])
const researchGroupText = computed(() => {
  const item = researchGroupList.value.find((r) => r.value === formData.value.research_group_id)
  return item ? item.text : ''
})

/**
 * 是否已选择组织机构（包括选择"其他"并输入）
 */
const isOrganizationSelected = computed(() => {
  return formData.value.organization_id !== null
})

/**
 * 是否已选择学院（包括选择"其他"并输入）
 */
const isDepartmentSelected = computed(() => {
  return formData.value.department_id !== null
})

/**
 * 加载组织机构列表
 */
async function loadOrganizations() {
  try {
    const list = await getOrganizations()
    organizationList.value = list.map((item) => ({
      text: item.name,
      value: item.id
    }))
    // 添加"其他"选项
    organizationList.value.push({ text: '其他', value: 0 })
  } catch (error) {
    console.error('加载组织机构失败:', error)
  }
}

/**
 * 加载学院列表
 */
async function loadDepartments() {
  // 如果未选择组织机构，清空列表
  if (formData.value.organization_id === null) {
    departmentList.value = []
    return
  }

  // 如果选择的是"其他"，只显示"其他"选项
  if (formData.value.organization_id === 0) {
    departmentList.value = [{ text: '其他', value: 0 }]
    return
  }

  try {
    const list = await getDepartments({
      organization_id: formData.value.organization_id
    })
    departmentList.value = list.map((item) => ({
      text: item.name,
      value: item.id
    }))
    // 添加"其他"选项
    departmentList.value.push({ text: '其他', value: 0 })
  } catch (error) {
    console.error('加载学院失败:', error)
  }
}

/**
 * 加载课题组列表
 */
async function loadResearchGroups() {
  // 如果未选择学院，清空列表
  if (formData.value.department_id === null) {
    researchGroupList.value = []
    return
  }

  // 如果选择的是"其他"，只显示"其他"选项
  if (formData.value.department_id === 0) {
    researchGroupList.value = [{ text: '其他', value: 0 }]
    return
  }

  try {
    const list = await getResearchGroups({
      department_id: formData.value.department_id
    })
    researchGroupList.value = list.map((item) => ({
      text: item.name,
      value: item.id
    }))
    // 添加"其他"选项
    researchGroupList.value.push({ text: '其他', value: 0 })
  } catch (error) {
    console.error('加载课题组失败:', error)
  }
}

/**
 * 选择组织机构
 */
function onConfirmOrganization({ selectedValues }) {
  const newValue = selectedValues[0]
  formData.value.organization_id = newValue
  
  // 清空学院和课题组的所有选择
  formData.value.department_id = null
  formData.value.research_group_id = null
  formData.value.user_input_department_name = null
  formData.value.user_input_research_group_name = null
  
  // 如果选择了"其他"，清空用户输入字段以外的内容
  if (newValue === 0) {
    formData.value.user_input_organization_name = null
  } else {
    formData.value.user_input_organization_name = null
  }
  
  showOrganizationPicker.value = false
  
  // 加载学院列表
  loadDepartments()
}

/**
 * 选择学院
 */
function onConfirmDepartment({ selectedValues }) {
  const newValue = selectedValues[0]
  formData.value.department_id = newValue
  
  // 清空课题组的所有选择
  formData.value.research_group_id = null
  formData.value.user_input_research_group_name = null
  
  // 如果选择了"其他"，清空用户输入字段以外的内容
  if (newValue === 0) {
    formData.value.user_input_department_name = null
  } else {
    formData.value.user_input_department_name = null
  }
  
  showDepartmentPicker.value = false
  
  // 加载课题组列表
  loadResearchGroups()
}

/**
 * 选择课题组
 */
function onConfirmResearchGroup({ selectedValues }) {
  const newValue = selectedValues[0]
  formData.value.research_group_id = newValue
  
  // 如果选择了"其他"，清空用户输入字段
  if (newValue === 0) {
    formData.value.user_input_research_group_name = null
  } else {
    formData.value.user_input_research_group_name = null
  }
  
  showResearchGroupPicker.value = false
}

/**
 * 点击学院选择器
 */
function handleDepartmentClick() {
  if (!isOrganizationSelected.value) {
    showToast('请先选择组织机构')
    return
  }
  showDepartmentPicker.value = true
}

/**
 * 点击课题组选择器
 */
function handleResearchGroupClick() {
  if (!isDepartmentSelected.value) {
    showToast('请先选择学院')
    return
  }
  showResearchGroupPicker.value = true
}

/**
 * 发送验证码
 */
async function handleSendCode() {
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
      type: 2 // 2-注册
    })
    showToast('验证码已发送')
    
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
 * 注册（注册成功后自动登录）
 */
async function handleRegister() {
  try {
    loading.value = true
    
    // 构建注册数据
    const data = {
      name: formData.value.name,
      phone: formData.value.phone,
      code: formData.value.code
    }

    // 处理组织机构
    if (formData.value.organization_id === 0) {
      // 选择了"其他"
      data.organization_id = null
      data.user_input_organization_name = formData.value.user_input_organization_name
    } else {
      // 选择了具体的组织机构
      data.organization_id = formData.value.organization_id
      data.user_input_organization_name = null
    }

    // 处理学院
    if (formData.value.department_id === 0) {
      // 选择了"其他"
      data.department_id = null
      data.user_input_department_name = formData.value.user_input_department_name
    } else {
      // 选择了具体的学院
      data.department_id = formData.value.department_id
      data.user_input_department_name = null
    }

    // 处理课题组
    if (formData.value.research_group_id === 0) {
      // 选择了"其他"
      data.research_group_id = null
      data.user_input_research_group_name = formData.value.user_input_research_group_name
    } else {
      // 选择了具体的课题组
      data.research_group_id = formData.value.research_group_id
      data.user_input_research_group_name = null
    }

    // 添加地区信息（如果有）
    if (formData.value.region.province_id) {
      data.province_id = formData.value.region.province_id
      data.city_id = formData.value.region.city_id
      data.district_id = formData.value.region.district_id
    }

    // 添加详细地址（如果有）
    if (formData.value.address) {
      data.address = formData.value.address
    }

    // 注册接口返回 token 和 user，与登录接口结构一致
    const result = await register(data)
    
    // 保存登录状态到 store（注册后自动登录）
    userStore.setAuth(result.token, result.user)
    
    // 根据审核状态跳转
    showToast('注册成功')
    setTimeout(() => {
      router.replace('/home')
    }, 1500)
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 去登录
 */
function goLogin() {
  router.push('/login')
}

/**
 * 返回首页
 */
function goHome() {
  router.push('/home')
}

/**
 * 初始化
 */
import { onMounted, onUnmounted } from 'vue'
onMounted(() => {
  loadOrganizations()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="less" scoped>
.register-page {
  min-height: 100vh;
  background-color: var(--bg-color);
  padding: @padding-md;

  .register-container {
    max-width: 600px;
    margin: 0 auto;
  }

  .register-actions {
    margin-top: @padding-lg;
    padding: 0 @padding-md;
  }

  .register-footer {
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
