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
            <!-- 在现有知识点旁边添加加号按钮 -->
            <a-button type="link" @click="addSubPoint(record)">
              <i class="fas fa-plus-circle"></i> 添加子节点
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
  id?: string;
  name: string;
  resource: any[];
  children: any[];
  parent_knowledge_point_id?: string;  // 可选字段
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
      currentPoint.value = { name: '', resource: [], parent_knowledge_point_id: '', children: [] };
      isEditMode.value = false;
      showDialog.value = true;
    };

    const savePoint = async () => {
      try {
        const token = getAuthToken();
        const requestData = {
          name: Array.isArray(currentPoint.value.name) ? currentPoint.value.name : [currentPoint.value.name],
          resource: currentPoint.value.resource.length ? currentPoint.value.resource : [
            { type: "", value: "" }
          ],
          parent_knowledge_point_id: currentPoint.value.parent_knowledge_point_id || null,
        };

        if (isEditMode.value && currentPoint.value.id) {
          // 更新操作
          await axios.put(
              `http://127.0.0.1:8000/api/knowledge_bases/${props.knowledge_base_id}/points/${currentPoint.value.id}`,
              requestData,
              { headers: { Authorization: token } }
          );
          message.success('知识点更新成功');
        } else {
          // 创建操作
          const response = await axios.post(
              `http://127.0.0.1:8000/api/knowledge_bases/${props.knowledge_base_id}/points`,
              requestData,
              { headers: { Authorization: token } }
          );
          message.success('知识点创建成功');

          // 这里确保将新创建的知识点 ID 保存在 currentPoint 中
          currentPoint.value.id = response.data.id;  // 保存返回的 ID

          // 如果是添加子节点，则返回父节点 ID
          if (currentPoint.value.parent_knowledge_point_id) {
            currentPoint.value.parent_knowledge_point_id = response.data.id;
          }
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
      // 删除时直接赋值为当前选择的知识点 ID
      deleteId.value = id;
      showDeleteConfirm.value = true;
    };

    const confirmDelete = async () => {
      try {
        const token = getAuthToken();
        // 通过 deleteId 获取正确的 ID
        await axios.delete(
            `http://127.0.0.1:8000/api/knowledge_bases/${props.knowledge_base_id}/points/${deleteId.value}`,
            { headers: { Authorization: token } }
        );
        message.success('知识点删除成功');
        showDeleteConfirm.value = false;
        await loadPoints();  // 删除成功后刷新列表
      } catch (error) {
        console.error('Delete point error:', error);
        message.error('删除失败');
      }
    };

    const addSubPoint = (parentPoint: KnowledgePoint) => {
      currentPoint.value = {
        name: '',
        resource: [],
        parent_knowledge_point_id: parentPoint.id,  // 自动填充父级节点的 ID
        children: []
      };
      isEditMode.value = false;
      showDialog.value = true;
    };

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
      confirmDelete,
      addSubPoint
    };
  }
});
</script>

<style scoped>
@import "../../assets/styles/knowledgepointmanager.css";
</style>
