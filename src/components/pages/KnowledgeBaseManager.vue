<template>
  <div class="app-container">
    <div class="sidebar">
      <div class="logo-area">
        <img src="../../assets/drawsee-logo.png" alt="昭析" class="logo-img">
        <h2>"昭析"知识库管理</h2>
      </div>
      <div class="sidebar-menu">
        <a-button type="success" class="create-btn" @click="openAddDialog">
          <i class="fas fa-plus"></i>
          创建知识库
        </a-button>
      </div>
    </div>

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
            <a-button class="action-btn" type="text" @click="editKnowledgeBase(knowledgeBase)">
              <SettingOutlined />
            </a-button>
            <a-button class="action-btn delete-btn" type="text" @click="handleDelete(knowledgeBase.knowledge_base_id)">
              <DeleteOutlined />
            </a-button>
            <a-button class="action-btn enter-btn" type="text" @click="goToKnowledgeBase(knowledgeBase)">
              <ArrowRightOutlined />
            </a-button>
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
    <!-- 修改删除确认对话框 -->
    <a-modal
        v-model:visible="showDeleteConfirm"
        title="确认删除"
        :maskClosable="false"
        :centered="true"
        :width="400"
    >
      <template #default>
        <p style="margin: 0;">确定要删除这个知识库吗？</p>
      </template>
      <template #footer>
        <a-button @click="() => showDeleteConfirm = false">取消</a-button>
        <a-button type="primary" danger @click="confirmDelete">删除</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import axios from 'axios';
import { KnowledgeBase } from "@/components/pages/types/types";
import { SettingOutlined, DeleteOutlined, ArrowRightOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  components: {
    SettingOutlined,
    DeleteOutlined,
    ArrowRightOutlined,
  },
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
    const showDeleteConfirm = ref(false);
    const deleteId = ref('');

    const handleDelete = (id: string) => {
      deleteId.value = id;
      showDeleteConfirm.value = true;
    };

    const confirmDelete = async () => {
      await deleteKnowledgeBase(deleteId.value);
      showDeleteConfirm.value = false;
    };

    const goToKnowledgeBase = (knowledgeBase: KnowledgeBase) => {
      if (knowledgeBase && knowledgeBase.knowledge_base_id) {
        router.push({
          name: 'KnowledgePointManager',
          params: {
            user_id: currentUserId.value,
            knowledge_base_id: knowledgeBase.knowledge_base_id
          }
        });
      } else {
        message.error('无效的知识库ID');
      }
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
      goToKnowledgeBase,
      showDeleteConfirm,
      handleDelete,
      confirmDelete
    };
    },
}
);
</script>

<style scoped>
@import "../../assets/styles/knowledgebasemanager.css";
</style>
