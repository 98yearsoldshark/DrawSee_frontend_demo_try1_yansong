<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <div class="logo-area">
        <h2>“昭析”知识库管理</h2>
      </div>
      <div class="sidebar-menu">
        <a-button type="primary" class="create-btn" @click="openAddDialog">
          <i class="fas fa-plus"></i>
          创建知识库
        </a-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <div class="content-header">
        <h2>我的知识库</h2>
      </div>

      <div class="knowledge-base-grid">
        <div v-for="knowledgeBase in knowledgeBases"
             :key="knowledgeBase.knowledge_base_id"
             class="kb-card">
          <div class="kb-card-content">
            <div class="kb-image">
              <img :src="`https://picsum.photos/seed/${knowledgeBase.knowledge_base_id}/300/200`"
                   :alt="knowledgeBase.name">
            </div>
            <div class="kb-info">
              <h3>{{ knowledgeBase.name }}</h3>
              <p class="description">{{ knowledgeBase.description }}</p>
            </div>
          </div>
          <div class="kb-actions">
            <a-tooltip title="设置">
              <a-button class="action-btn" type="text" @click="editKnowledgeBase(knowledgeBase)">
                <i class="fas fa-cog"></i>
              </a-button>
            </a-tooltip>
            <a-tooltip title="删除">
              <a-button class="action-btn delete-btn" type="text" @click="deleteKnowledgeBase(knowledgeBase.knowledge_base_id)">
                <i class="fas fa-trash-alt"></i>
              </a-button>
            </a-tooltip>
            <a-tooltip title="进入知识库">
              <a-button class="action-btn enter-btn" type="text" @click="goToKnowledgeBase(knowledgeBase.knowledge_base_id)">
                <i class="fas fa-arrow-right"></i>
              </a-button>
            </a-tooltip>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="showDialog"
               :title="isEditMode ? '修改知识库' : '创建知识库'"
               width="500px"
               class="kb-dialog">
      <el-form label-position="top">
        <el-form-item label="知识库名称">
          <el-input v-model="currentKnowledgeBase.name" placeholder="请输入知识库名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="currentKnowledgeBase.description"
                    type="textarea"
                    rows="4"
                    placeholder="请输入知识库描述" />
        </el-form-item>
      </el-form>
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

    const getCurrentUserId = () => {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        currentUserId.value = userId;
      } else {
        message.error('未找到用户 ID');
      }
    };

    const getAuthToken = () => {
      const token = localStorage.getItem('access_token');
      return token ? `Bearer ${token}` : '';
    };

    const loadKnowledgeBases = async () => {
      try {
        const token = getAuthToken();
        const response = await axios.get(`http://127.0.0.1:8000/api/knowledge_bases/${currentUserId.value}`, {
          headers: { Authorization: token },
        });

        // 将返回的知识库详细信息直接赋值给 knowledgeBases
        knowledgeBases.value = response.data;
      } catch (error) {
        message.error('加载知识库失败');
      }
    };

    const openAddDialog = () => {
      currentKnowledgeBase.value = { knowledge_base_id: "", name: '', description: '' };
      isEditMode.value = false;
      showDialog.value = true;
    };

    const saveKnowledgeBase = async () => {
      try {
        const token = getAuthToken();
        if (isEditMode.value && currentKnowledgeBase.value.knowledge_base_id) {
          await axios.put(`http://127.0.0.1:8000/api/knowledge_bases/${currentUserId.value}/${currentKnowledgeBase.value.knowledge_base_id}`, {
            name: currentKnowledgeBase.value.name,
            description: currentKnowledgeBase.value.description
          }, {
            headers: { Authorization: token },
          });
          message.success('知识库修改成功');
        } else {
          const response = await axios.post(`http://127.0.0.1:8000/api/knowledge_bases/${currentUserId.value}`, {
            name: currentKnowledgeBase.value.name,
            description: currentKnowledgeBase.value.description
          }, {
            headers: { Authorization: token },
          });
          message.success('知识库创建成功');
          currentKnowledgeBase.value.knowledge_base_id = response.data.knowledge_base_id;
        }
        showDialog.value = false;
        await loadKnowledgeBases();
      } catch (error) {
        message.error('操作失败');
      }
    };

    const editKnowledgeBase = (knowledgeBase: KnowledgeBase) => {
      currentKnowledgeBase.value = { ...knowledgeBase };
      isEditMode.value = true;
      showDialog.value = true;
    };

    const deleteKnowledgeBase = async (knowledgeBaseId: string) => {
      try {
        const token = getAuthToken();
        await axios.delete(`http://127.0.0.1:8000/api/knowledge_bases/${currentUserId.value}/${knowledgeBaseId}`, {
          headers: { Authorization: token },
        });
        message.success('知识库删除成功');
        await loadKnowledgeBases();
      } catch (error) {
        message.error('删除知识库失败');
      }
    };

    const goToKnowledgeBase = (id: string) => {
      router.push({ name: 'KnowledgePointManager', params: { knowledgeBaseId: id } });
    };

    onMounted(() => {
      getCurrentUserId();
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
      deleteKnowledgeBase,
      goToKnowledgeBase
    };
  },
});
</script>

<style scoped>
@import "../../assets/styles/knowledgebasemanager.css";
</style>
