<template>
  <div class="knowledge-base-manager">
    <a-button type="primary" @click="openAddDialog">创建知识库</a-button>

    <a-row gutter="16" class="knowledge-base-list">
      <a-col v-for="knowledgeBase in knowledgeBases" :key="knowledgeBase.knowledge_base_id" :span="8">
        <a-card
            :title="knowledgeBase.name"
            bordered
            class="knowledge-base-card"
        >
          <p>{{ knowledgeBase.description }}</p>
          <template #actions>
            <a-button type="link" @click="editKnowledgeBase(knowledgeBase)">修改</a-button>
            <a-button type="link" @click="goToKnowledgeBase(knowledgeBase.knowledge_base_id)">进入编辑</a-button>
          </template>
        </a-card>
      </a-col>
    </a-row>

    <el-dialog v-model="showDialog" :title="isEditMode ? '修改知识库' : '创建知识库'">
      <el-input v-model="currentKnowledgeBase.name" placeholder="知识库名称" />
      <el-input v-model="currentKnowledgeBase.description" placeholder="描述" type="textarea" />

      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="saveKnowledgeBase">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import axios from 'axios';
import { KnowledgeBase } from "@/components/pages/types/types";

export default defineComponent({
  setup() {
    const router = useRouter();
    const knowledgeBases = ref<KnowledgeBase[]>([]);
    const showDialog = ref(false);
    const isEditMode = ref(false);
    const currentKnowledgeBase = ref<KnowledgeBase>({ knowledge_base_id: "", name: '', description: '' });
    const currentUserId = ref<string>('');

    // 获取当前用户的ID
    const getCurrentUserId = () => {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        currentUserId.value = userId;
      } else {
        message.error('未找到用户 ID');
      }
    };

    // 获取 Authorization token
    const getAuthToken = () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        return `Bearer ${token}`;
      }
      return '';
    };

    // 加载知识库列表
    const loadKnowledgeBases = async () => {
      try {
        const token = getAuthToken();  // 获取 token
        const response = await axios.get(`http://127.0.0.1:8000/api/knowledge_bases/${currentUserId.value}`, {
          headers: {
            Authorization: token,  // 在请求头中携带 token
          },
        });
        knowledgeBases.value = response.data;
      } catch (error) {
        message.error('加载知识库失败');
      }
    };

    // 打开新增/编辑知识库对话框
    const openAddDialog = () => {
      currentKnowledgeBase.value = { knowledge_base_id: "", name: '', description: '' };
      isEditMode.value = false;
      showDialog.value = true;
    };

    // 保存知识库（新增或编辑）
    const saveKnowledgeBase = async () => {
      try {
        const token = getAuthToken();  // 获取 token
        if (isEditMode.value && currentKnowledgeBase.value.knowledge_base_id) {
          // 编辑模式 - 使用 PUT 方法更新知识库
          await axios.put(`http://127.0.0.1:8000/api/knowledge_bases/${currentUserId.value}/${currentKnowledgeBase.value.knowledge_base_id}`, {
            name: currentKnowledgeBase.value.name,
            description: currentKnowledgeBase.value.description
          }, {
            headers: {
              Authorization: token,  // 在请求头中携带 token
            },
          });
          message.success('知识库修改成功');
        } else {
          // 创建模式 - 使用 POST 方法创建新知识库
          const response = await axios.post(`http://127.0.0.1:8000/api/knowledge_bases/${currentUserId.value}`, {
            name: currentKnowledgeBase.value.name,
            description: currentKnowledgeBase.value.description
          }, {
            headers: {
              Authorization: token,  // 在请求头中携带 token
            },
          });
          message.success('知识库创建成功');
          currentKnowledgeBase.value.knowledge_base_id = response.data.knowledge_base_id;
        }
        showDialog.value = false;
        await loadKnowledgeBases();  // 重新加载知识库列表
      } catch (error) {
        message.error('操作失败');
      }
    };

    // 编辑知识库
    const editKnowledgeBase = (knowledgeBase: KnowledgeBase) => {
      currentKnowledgeBase.value = { ...knowledgeBase };
      isEditMode.value = true;
      showDialog.value = true;
    };

    // 跳转到知识库详情页
    const goToKnowledgeBase = (id: string) => {
      router.push({ name: 'KnowledgePointManager', params: { knowledgeBaseId: id } });
    };

    // 在组件挂载时执行
    onMounted(() => {
      getCurrentUserId();  // 获取当前用户 ID
      loadKnowledgeBases();
    });

    return {
      knowledgeBases,
      showDialog,
      isEditMode,
      currentKnowledgeBase,
      openAddDialog,
      saveKnowledgeBase,
      editKnowledgeBase,
      goToKnowledgeBase
    };
  },
});
</script>

<style scoped>
.knowledge-base-manager {
  padding: 20px;
}

.knowledge-base-list {
  margin-top: 20px;
}

.knowledge-base-card {
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
