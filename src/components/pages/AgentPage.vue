<template>
  <div class="agents-container">
    <!-- 智能体卡片 -->
    <a-row gutter="16">
      <a-col
          v-for="agent in agents"
          :key="agent._id"
          :span="6"
      >
        <a-card
            hoverable
            :title="agent.name"
            style="width: 300px"
        >
          <template #cover>
            <img
                alt="example"
                src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
            />
          </template>
          <a-card-meta
              :description="agent.description"
          />
          <template #actions>
            <a-button type="primary" @click="enterAgent(agent._id, agent.name)">
              订阅并进入
            </a-button>
          </template>
        </a-card>
      </a-col>
    </a-row>

    <!-- 新建智能体按钮和模态框 -->
    <a-button class="new-agent-btn" type="primary" @click="showNewAgentModal">
      新建智能体
    </a-button>
    <a-modal
        v-model:visible="isNewAgentModalVisible"
        title="新建智能体"
        @ok="createAgent"
        @cancel="closeNewAgentModal"
    >
      <a-form layout="vertical">
        <a-form-item label="智能体名称">
          <a-input v-model:value="newAgentName" placeholder="请输入智能体名称" />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="newAgentDescription" placeholder="请输入描述" />
        </a-form-item>
        <a-form-item label="选择知识库">
          <a-select v-model:value="selectedKnowledgeBaseId" placeholder="请选择知识库">
            <a-select-option
                v-for="kb in knowledgeBases"
                :key="kb._id"
                :value="kb._id"
            >{{ kb.name }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { Agent, KnowledgeBase } from './types/types';

const userid = ref('');
const agents = ref<Agent[]>([]);
const knowledgeBases = ref<KnowledgeBase[]>([]);
const isNewAgentModalVisible = ref(false);
const newAgentName = ref('');
const newAgentDescription = ref('');
const selectedKnowledgeBaseId = ref('');
const router = useRouter();

const fetchAgents = async () => {
  try {
    const response = await axios.get<Agent[]>('http://127.0.0.1:8000/api/agents');
    agents.value = response.data;
  } catch (error) {
    console.error('获取智能体失败:', error);
  }
};

const fetchKnowledgeBases = async () => {
  try {
    const response = await axios.get<KnowledgeBase[]>('http://127.0.0.1:8000/api/knowledge-bases');
    knowledgeBases.value = response.data;
  } catch (error) {
    console.error('获取知识库失败:', error);
  }
};

onMounted(() => {
  userid.value = localStorage.getItem('user_id') || '';
  fetchAgents();
  fetchKnowledgeBases();
});

const showNewAgentModal = () => {
  isNewAgentModalVisible.value = true;
};

const closeNewAgentModal = () => {
  isNewAgentModalVisible.value = false;
  resetNewAgentForm();
};

const resetNewAgentForm = () => {
  newAgentName.value = '';
  newAgentDescription.value = '';
  selectedKnowledgeBaseId.value = '';
};

const createAgent = async () => {
  if (!newAgentName.value || !selectedKnowledgeBaseId.value) {
    return;
  }
  try {
    await axios.post('http://127.0.0.1:8000/api/agents', {
      name: newAgentName.value,
      description: newAgentDescription.value,
      knowledge_base_id: selectedKnowledgeBaseId.value,
    });
    closeNewAgentModal();
    await fetchAgents(); // 更新智能体列表
  } catch (error) {
    console.error('创建智能体失败:', error);
  }
};

const enterAgent = (agentId: string, agentName: string) => {
  router.push({
    name: 'ChatPage',
    params: {
      agentId,
      agentName,
      userid: userid.value
    }
  });
};
</script>

<style scoped>
.agents-container {
  padding: 20px;
}
.new-agent-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
}
</style>
