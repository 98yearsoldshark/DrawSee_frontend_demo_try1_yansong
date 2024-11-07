<template>
  <div class="app-container">
    <!-- 左侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1 class="logo">昭析智能体</h1>
        <button class="new-chat-btn" @click="createChat">
          <span class="icon">+</span> 新建问答
        </button>
      </div>

      <div class="history-list">
        <div v-for="record in chatRecords"
             :key="record.chat_id"
             :class="['history-item', { active: record.chat_id === chatId }]"
             @click="loadChat(record.chat_id)">
          <span class="chat-icon">💭</span>
          <span class="chat-title">对话 {{ record.chat_id }}</span>
          <button class="delete-btn">×</button>
        </div>
      </div>
    </aside>

    <!-- 主聊天区域 -->
    <main class="main-content">
      <div class="chat-header">
        <h2>{{ agentName }}</h2> <!-- 动态显示智能体名称 -->
      </div>

      <div class="messages-container">
        <div class="vue-flow-wrapper">
          <VueFlow :nodes="nodes" :edges="edges" />
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-container">
        <div class="input-wrapper">
          <textarea
              v-model="userInput"
              placeholder="输入你的问题..."
              class="chat-input"
              @keydown.enter.exact.prevent="sendMessage"
          ></textarea>
          <button class="send-btn" @click="sendMessage">
            <span class="send-icon">↗</span>
          </button>
        </div>
        <div class="input-tips">
          按 Enter 发送 / Shift + Enter 换行
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Node, Edge } from '@vue-flow/core';
import { RequestModel, ResponseModel } from './types/types';

export default defineComponent({
  props: {
    agentId: {
      type: String,
      required: true
    },
    agentName: {
      type: String,
      default: '智能体',
    },
    agentTitle: {
      type: String,
      default: 'AI 问答智能体',
    },
    userid: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const userid = ref<string>('');
    const chatId = ref<string>('');
    const userInput = ref<string>('');
    const nodes = ref<Node[]>([]);
    const edges = ref<Edge[]>([]);
    const chatRecords = ref<any[]>([]);

    onMounted(async () => {
      userid.value = localStorage.getItem('user_id') || '';
      await fetchChatRecords();
    });

    const fetchChatRecords = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/chat/');
        chatRecords.value = response.data;
      } catch (error) {
        console.error('获取历史对话失败:', error);
      }
    };

    const createChat = () => {
      chatId.value = uuidv4().slice(0, 8);
      nodes.value = [];
      edges.value = [];
    };

    const sendMessage = async () => {
      if (!userInput.value) return;

      const requestData: RequestModel = {
        chat_id: chatId.value,
        message: [{ content: userInput.value }],
        userid: props.userid,
        agent_id: props.agentId
      };

      try {
        const response = await axios.post<ResponseModel>(
            'http://127.0.0.1:8000/api/chat',
            requestData
        );
        updateChatNodes(response.data.message);
      } catch (error) {
        console.error('发送请求失败:', error);
      }

      userInput.value = '';
    };

    const loadChat = async (chatIdToLoad: string) => {
      try {
        const response = await axios.get<ResponseModel>(
            `http://127.0.0.1:8000/api/chat/${chatIdToLoad}`
        );
        nodes.value = [];
        edges.value = [];
        updateChatNodes(response.data.message);
      } catch (error) {
        console.error('加载历史对话失败:', error);
      }
    };

    const updateChatNodes = (messages: any[]) => {
      messages.forEach((msg, index) => {
        const nodeId = `${chatId.value}-${index}`;
        nodes.value.push({
          id: nodeId,
          data: { label: msg.content },
          position: { x: 100, y: 100 + index * 100 },
        });

        if (index > 0) {
          edges.value.push({
            id: `e${chatId.value}-${index - 1}-${index}`,
            source: `${chatId.value}-${index - 1}`,
            target: nodeId,
            animated: true,
          });
        }

        if (msg.attachments) {
          msg.attachments.forEach(att => {
            const attNodeId = `${nodeId}-att-${att.id}`;
            nodes.value.push({
              id: attNodeId,
              data: { label: `下载 ${att.type}` },
              position: { x: 300, y: 100 + index * 100 },
            });
            edges.value.push({
              id: `e${attNodeId}`,
              source: nodeId,
              target: attNodeId,
              animated: true,
            });
          });
        }

        if (msg.iframe) {
          const iframeNodeId = `${nodeId}-iframe`;
          nodes.value.push({
            id: iframeNodeId,
            data: { label: '查看内容', iframe: msg.iframe },
            position: { x: 300, y: 200 + index * 100 },
          });
          edges.value.push({
            id: `e${iframeNodeId}`,
            source: nodeId,
            target: iframeNodeId,
            animated: true,
          });
        }
      });
    };

    return {
      chatId,
      userInput,
      nodes,
      edges,
      chatRecords,
      createChat,
      sendMessage,
      loadChat,
      agentName: props.agentName,
      agentTitle: props.agentTitle,
    };
  },
});
</script>

<style lang="css">
@import "../../assets/styles/chatpage.css";
</style>
