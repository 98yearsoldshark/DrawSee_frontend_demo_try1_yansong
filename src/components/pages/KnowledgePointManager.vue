<template>
  <div class="point-manager">
    <div class="header">
      <h2>知识点管理</h2>
      <a-button type="primary" @click="openAddDialog">
        <i class="fas fa-plus"></i>
        添加知识点
      </a-button>
    </div>

    <a-table :dataSource="knowledgePoints" :columns="columns">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <div class="action-buttons">
            <a-button type="link" @click="editPoint(record)">
              <i class="fas fa-edit"></i>
              编辑
            </a-button>
            <a-button type="link" danger @click="handleDelete(record._id)">
              <i class="fas fa-trash-alt"></i>
              删除
            </a-button>
          </div>
        </template>
      </template>
    </a-table>

    <a-modal
        v-model:visible="showDialog"
        :title="isEditMode ? '编辑知识点' : '添加知识点'"
        @ok="savePoint"
        @cancel="showDialog = false"
    >
      <a-form :model="currentPoint" layout="vertical">
        <a-form-item label="知识点名称">
          <a-input v-model:value="currentPoint.name" placeholder="请输入知识点名称" />
        </a-form-item>
        <a-form-item label="资源">
          <resource-editor v-model="currentPoint.resource" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 删除确认对话框 -->
    <a-modal
        v-model:visible="showDeleteConfirm"
        title="确认删除"
        :maskClosable="false"
        :centered="true"
    >
      <template #default>
        <p>确定要删除这个知识点吗？</p>
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
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import axios from 'axios';
import ResourceEditor from './ResourceEditor.vue';

interface KnowledgePoint {
  id?: string; // 修改为id而不是_id
  name: string;
  resource: any[];
  children: any[];
}

export default defineComponent({
  components: { ResourceEditor },
  props: {
    user_id: {
      type: String,
      required: true
    },
    knowledge_base_id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const knowledgePoints = ref<KnowledgePoint[]>([]);
    const showDialog = ref(false);
    const showDeleteConfirm = ref(false);
    const isEditMode = ref(false);
    const currentPoint = ref<KnowledgePoint>({ name: '', resource: [], children: [] });
    const deleteId = ref('');

    const columns = [
      {
        title: '知识点名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '操作',
        key: 'action',
        width: 200,
      }
    ];

    const getAuthToken = () => {
      const token = localStorage.getItem('access_token');
      return token ? `Bearer ${token}` : '';
    };

    const loadPoints = async () => {
      try {
        const token = getAuthToken();
        console.log('Knowledge Base ID:', props.knowledge_base_id);
        const response = await axios.get(
            `http://127.0.0.1:8000/api/knowledge_bases/${props.knowledge_base_id}/points`,
            {
              headers: { Authorization: token }
            }
        );
        knowledgePoints.value = response.data;
      } catch (error) {
        console.error('Load points error:', error);
        message.error('加载知识点失败');
      }
    };

    const openAddDialog = () => {
      currentPoint.value = { name: '', resource: [], children: [] };
      isEditMode.value = false;
      showDialog.value = true;
    };

    const savePoint = async () => {
      try {
        const token = getAuthToken();
        if (isEditMode.value && currentPoint.value.id) {  // 修改为 id
          // 更新知识点
          await axios.put(
              `http://127.0.0.1:8000/api/knowledge_bases/${props.knowledge_base_id}/points/${currentPoint.value.id}`,
              currentPoint.value,
              {
                headers: { Authorization: token }
              }
          );
          message.success('知识点更新成功');
        } else {
          // 创建知识点
          await axios.post(
              `http://127.0.0.1:8000/api/knowledge_bases/${props.knowledge_base_id}/points`,
              currentPoint.value,
              {
                headers: { Authorization: token }
              }
          );
          message.success('知识点创建成功');
        }
        showDialog.value = false;
        await loadPoints();
      } catch (error) {
        console.error('Save point error:', error);
        message.error('操作失败');
      }
    };

    const editPoint = (point: KnowledgePoint) => {
      currentPoint.value = { ...point };
      isEditMode.value = true;
      showDialog.value = true;
    };

    const handleDelete = (id: string) => {
      deleteId.value = id;
      showDeleteConfirm.value = true;
    };

    const confirmDelete = async () => {
      try {
        const token = getAuthToken();
        // 删除知识点时通过请求体传递 point_id
        await axios.delete(
            `http://127.0.0.1:8000/api/knowledge_bases/${props.knowledge_base_id}/points`,
            {
              headers: { Authorization: token },
              data: { point_id: deleteId.value }  // 通过请求体传递 point_id
            }
        );
        message.success('知识点删除成功');
        showDeleteConfirm.value = false;
        await loadPoints();
      } catch (error) {
        console.error('Delete point error:', error);
        message.error('删除失败');
      }
    };

    onMounted(() => {
      console.log('Component mounted with knowledge_base_id:', props.knowledge_base_id);
      loadPoints();
    });

    return {
      knowledgePoints,
      columns,
      showDialog,
      showDeleteConfirm,
      currentPoint,
      isEditMode,
      openAddDialog,
      savePoint,
      editPoint,
      handleDelete,
      confirmDelete
    };
  }
});
</script>

<style scoped>
.point-manager {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

:deep(.ant-btn-link) {
  padding: 0 8px;
}

:deep(.ant-btn-link i) {
  margin-right: 4px;
}
</style>
