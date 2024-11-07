<template>
  <div class="home">
    <el-header class="fixed-header">
      <!-- 导航栏部分保持不变 -->
      <el-menu
          :default-active="activeIndex"
          class="el-menu-demo"
          mode="horizontal"
          :ellipsis="false"
          @select="handleSelect"
          background-color="#e6f1fc">
        <el-menu-item index="0">
          <img
              style="width: 100px"
              src="../../assets/drawsee-logo.png"
              alt="drawsee-logo"
          />
        </el-menu-item>
        <el-menu-item index="1" @click="navigateTo('about')">关于我们</el-menu-item>
        <el-menu-item index="2" @click="handleAdminNavigation">后台管理</el-menu-item>
      </el-menu>
    </el-header>
    <div class="content">
      <div class="text-center mb-4">
        <h1 class="display-4" style="font-family: 'Kaushan Script', cursive; color: #0e9898; margin-bottom: 120px; font-size: 3rem;">
          DrawSee - 可视化课程智能体平台
        </h1>
      </div>
      <div class="login-form">
        <!-- 登录表单 -->
        <el-form
            v-if="!isRegisterMode"
            ref="loginFormRef"
            style="max-width: 600px"
            :model="loginForm"
            status-icon
            :rules="loginRules"
            label-width="auto"
            class="demo-ruleForm"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="loginForm.username" autocomplete="off" />
          </el-form-item>
          <el-form-item label="密码" prop="pass">
            <el-input v-model="loginForm.pass" type="password" autocomplete="off" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitLoginForm(loginFormRef)">登录</el-button>
            <el-button @click="resetLoginForm(loginFormRef)">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 注册表单 -->
        <el-form
            v-else
            ref="registerFormRef"
            style="max-width: 600px"
            :model="registerForm"
            status-icon
            :rules="registerRules"
            label-width="auto"
            class="demo-ruleForm"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="registerForm.username" autocomplete="off" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="registerForm.email" autocomplete="off" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="registerForm.password" type="password" autocomplete="off" />
          </el-form-item>
          <el-form-item label="确认密码" prop="checkPassword">
            <el-input v-model="registerForm.checkPassword" type="password" autocomplete="off" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitRegisterForm">注册</el-button>
            <el-button @click="resetRegisterForm">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 切换登录/注册的链接 -->
        <div class="switch-mode">
          <a href="#" @click.prevent="toggleMode">
            {{ isRegisterMode ? '已有账号？去登录' : '没有账号？去注册' }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { reactive, ref } from 'vue';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import axios from 'axios';

const router = useRouter();
const loginFormRef = ref<FormInstance>();
const registerFormRef = ref<FormInstance>();
const isRegisterMode = ref(false);

// 登录表单数据
const loginForm = reactive({
  username: '',
  pass: '',
});

// 注册表单数据
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  checkPassword: '',
});

const activeIndex = ref('1');

const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};

// 登录表单验证规则
const loginRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  pass: [{ required: true, message: '请输入密码', trigger: 'blur' }],
});

// 注册表单验证规则
const registerRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  checkPassword: [{ required: true, message: '请确认密码', trigger: 'blur' }],
});

// 切换登录/注册模式
const toggleMode = () => {
  isRegisterMode.value = !isRegisterMode.value;
};

// 登录表单提交
const submitLoginForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      try {
        const response = await axios.post('http://127.0.0.1:8000/api/login', {
          username: loginForm.username,
          password: loginForm.pass,
        });
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('user_id', response.data.user_id);  // 保存 user_id
        router.push({ name: 'ChatPage' });
      } catch (error) {
        ElMessage.error('用户名或密码错误！');
      }
    }
  });
};
// 注册表单提交
const submitRegisterForm = async () => {
  if (registerForm.password !== registerForm.checkPassword) {
    ElMessage.error('密码和确认密码不一致');
    return;
  }
  try {
    const response = await axios.post('http://127.0.0.1:8000/api/register', {
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
    });
    ElMessage.success('注册成功，请登录！');
    localStorage.setItem('user_id', response.data.user_id);
    isRegisterMode.value = false; // 注册成功后切换到登录模式
  } catch (error) {
    ElMessage.error('注册失败，请稍后重试');
  }
};

// 重置表单
const resetLoginForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

const resetRegisterForm = () => {
  registerForm.username = '';
  registerForm.email = '';
  registerForm.password = '';
  registerForm.checkPassword = '';
};

const navigateTo = (page: string) => {
  if (page === 'about') {
    router.push({ name: 'AboutPage' });
  }
};

// 管理后台导航逻辑
const handleAdminNavigation = async () => {
  const token = localStorage.getItem('access_token');
  try {
    // 调用管理员验证接口
    const response = await axios.get('http://127.0.0.1:8000/api/admin/login', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.data.role === 'admin') {
      router.push({ name: 'KnowledgePointManager' });
    } else {
      ElMessage.error('您没有管理员权限');
    }
  } catch (error) {
    ElMessage.error('请先登录管理员账户');
    router.push({ name: 'AdminLogin' });
  }
};
</script>

<style lang="css">
@import "../../assets/styles/home.css";
</style>
