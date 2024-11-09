<template>
  <div class="admin-login">
    <div class="login-card">
      <div class="header">
        <img src="../../assets/drawsee-logo.png" alt="Admin Logo" class="logo" />
        <h2>管理员登录</h2>
      </div>
      <el-form
          ref="loginFormRef"
          :model="loginForm"
          label-position="top"
          class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="el-icon-user"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" block>登录</el-button>
        </el-form-item>
      </el-form>
      <!-- 注册管理员用户入口 -->
      <div class="register-admin-link">
        <el-link @click="showSuperadminDialog">注册管理员用户</el-link>
      </div>

      <!-- 超级管理员验证弹出窗口 -->
      <el-dialog v-model="superadminDialogVisible" title="超级管理员验证" width="400px">
        <el-form ref="superadminFormRef" :model="superadminForm" :rules="superadminRules">
          <el-form-item label="超级管理员密码" prop="superadminPassword">
            <el-input
                v-model="superadminForm.superadminPassword"
                type="password"
                placeholder="请输入超级管理员密码"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSuperadminLogin">验证</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>

      <!-- 注册新管理员表单 -->
      <el-dialog v-model="adminRegistrationDialogVisible" title="注册新管理员用户" width="400px">
        <el-form ref="adminRegisterFormRef" :model="adminRegisterForm" :rules="adminRegisterRules">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="adminRegisterForm.username" placeholder="请输入新管理员用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="adminRegisterForm.password" type="password" placeholder="请输入密码" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleAdminRegistration">注册</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { FormInstance, FormRules, ElMessage } from 'element-plus';
import axios from 'axios';

const router = useRouter();
const loginFormRef = ref<FormInstance>();

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
});

// 表单验证规则
const handleLogin = async () => {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await axios.post('http://127.0.0.1:8000/api/admin/login', {
          username: loginForm.username,
          password: loginForm.password,
        });

        if (response.data.role === 'admin') {
          // 保存 token 和 user_id
          localStorage.setItem('access_token', response.data.access_token);
          localStorage.setItem('user_id', response.data.user_id);

          ElMessage.success('登录成功');

          // 路由跳转并传递 user_id 参数
          await router.push({
            name: 'KnowledgeBaseManager',
            params: { user_id: response.data.user_id }
          });
        } else {
          ElMessage.error('您没有管理员权限');
        }
      } catch (error) {
        ElMessage.error('用户名或密码错误');
      }
    }
  });
};

// 超级管理员验证
const superadminDialogVisible = ref(false);
const superadminFormRef = ref<FormInstance>();
const superadminForm = reactive({
  superadminPassword: '',
});
const superadminRules = reactive<FormRules>({
  superadminPassword: [{ required: true, message: '请输入超级管理员密码', trigger: 'blur' }],
});

// 显示超级管理员验证对话框
const showSuperadminDialog = () => {
  superadminDialogVisible.value = true;
};

// 验证超级管理员身份
const handleSuperadminLogin = async () => {
  if (!superadminFormRef.value) return;
  const formEl = superadminFormRef.value as FormInstance;
  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        const response = await axios.post('http://127.0.0.1:8000/api/superadmin-login', {
          username: 'superadmin',
          password: superadminForm.superadminPassword,
        });

        console.log("Response data:", response.data);  // 调试输出

        if (response.data.access_token) {  // 检查 access_token 是否存在
          localStorage.setItem('access_token', response.data.access_token);
          localStorage.setItem('user_id', response.data.user_id);
          ElMessage.success('超级管理员验证成功');
          superadminDialogVisible.value = false;
          adminRegistrationDialogVisible.value = true;
        } else {
          ElMessage.error('超级管理员验证失败');
        }
      } catch (error) {
        ElMessage.error('验证失败');
      }
    }
  });
};

// 注册新管理员
const adminRegistrationDialogVisible = ref(false);
const adminRegisterFormRef = ref<FormInstance>();
const adminRegisterForm = reactive({
  username: '',
  password: '',
});
const adminRegisterRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
});

// 提交注册新管理员
const handleAdminRegistration = async () => {
  if (!adminRegisterFormRef.value) return;
  const formEl = adminRegisterFormRef.value as FormInstance;

  formEl.validate(async (valid) => {
    if (valid) {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.post(
            'http://127.0.0.1:8000/api/admin/register',
            {
              username: adminRegisterForm.username,
              password: adminRegisterForm.password,
            },
        );

        console.log("Response data:", response.data);  // 调试输出

        ElMessage.success('管理员注册成功');
        adminRegistrationDialogVisible.value = false;
      } catch (error) {
        console.error('Registration error:', error);
        ElMessage.error('注册失败');
      }
    }
  });
};
</script>

<style scoped>
@import "../../assets/styles/adminlogin.css";
</style>
