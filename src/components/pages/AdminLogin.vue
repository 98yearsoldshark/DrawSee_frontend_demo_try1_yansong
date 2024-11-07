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
          :rules="loginRules"
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
const loginRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
});

// 登录方法
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await axios.post('http://127.0.0.1:8000/api/login', {
          username: loginForm.username,
          password: loginForm.password,
        });

        if (response.data.role === 'admin') {
          // 保存 token 并跳转到后台管理页面
          localStorage.setItem('access_token', response.data.access_token);
          ElMessage.success('登录成功');
          router.push({ name: 'KnowledgePointManager' });
        } else {
          ElMessage.error('您没有管理员权限');
        }
      } catch (error) {
        ElMessage.error('用户名或密码错误');
      }
    }
  });
};
</script>

<style scoped>
.admin-login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-card {
  width: 400px;
  padding: 40px;
  background: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  text-align: center;
}

.header {
  margin-bottom: 20px;
}

.header .logo {
  width: 80px;
  height: 80px;
  margin-bottom: 10px;
}

.header h2 {
  font-size: 1.5rem;
  color: #333;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.el-input__inner {
  border-radius: 5px;
}

.el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
  border-radius: 5px;
}
</style>
