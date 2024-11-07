<template>
  <div class="register">
    <h2>注册新用户</h2>
    <el-form
        ref="registerFormRef"
        :model="registerForm"
        status-icon
        :rules="rules"
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
        <el-button type="primary" @click="submitForm">注册</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const registerFormRef = ref<FormInstance>();
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  checkPassword: '',
});

const rules = reactive<FormRules<typeof registerForm>>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  checkPassword: [{ required: true, message: '请确认密码', trigger: 'blur' }],
});

const submitForm = async () => {
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
    ElMessage.success('注册成功，快去登录吧！');
    // 注册成功后跳转到登录页面
    router.push({ name: 'Home' });
  } catch (error) {
    ElMessage.error('注册失败，请稍后重试');
  }
};

const resetForm = () => {
  registerForm.username = '';
  registerForm.email = '';
  registerForm.password = '';
  registerForm.checkPassword = '';
};
</script>

<style lang="css">
/* 自定义样式 */
</style>
