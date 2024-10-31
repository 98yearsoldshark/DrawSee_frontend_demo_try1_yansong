<template>
  <div class="home" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <div class="text-center mb-4">
      <h1 class="display-4" style="font-family: 'Kaushan Script', cursive; color: #07b6b6; margin-bottom: 20px;">
        DrawSee - 可视化课程智能体平台
      </h1>
    </div>
    <div class="login-form">
      <el-form
          ref="ruleFormRef"
          style="max-width: 600px"
          :model="ruleForm"
          status-icon
          :rules="rules"
          label-width="auto"
          class="demo-ruleForm"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="ruleForm.username" autocomplete="off" />
        </el-form-item>
        <el-form-item label="密码" prop="pass">
          <el-input v-model="ruleForm.pass" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm(ruleFormRef)">登录</el-button>
          <el-button @click="resetForm(ruleFormRef)">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import backgroundImage from '../assets/background.png';
import { useRouter } from 'vue-router';
import { reactive, ref } from 'vue';
import {ElMessage, FormInstance, FormRules} from 'element-plus';

const router = useRouter();
const ruleFormRef = ref<FormInstance>();

const ruleForm = reactive({
  username: '',
  pass: '',
  checkPass: '',
});

const rules = reactive<FormRules<typeof ruleForm>>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  pass: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  checkPass: [{ required: true, message: '请确认密码', trigger: 'blur' }],
});

const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      if (ruleForm.username === 'admin' && ruleForm.pass === 'admin') {
        console.log('登录成功！');
        router.push({ name: 'ChatPage' });
      } else {
        console.error('用户名或密码错误！');
        ElMessage.error('用户名或密码错误！');
      }
    } else {
      console.log('表单提交失败，请检查输入！');
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};
</script>

<style scoped>
.home {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background-size: cover;
  background-position: center;
}
.login-form {
  background-color: rgba(255, 255, 255, 0.9);
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  width: 300px;
}
</style>
