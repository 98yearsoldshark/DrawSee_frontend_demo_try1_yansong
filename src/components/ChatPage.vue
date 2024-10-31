<template>
  <div class="chat-page">
    <h2>"图趣"线性代数课程智能体</h2>
    <div class="input-group">
      <el-input v-model="userInput" placeholder="请输入您的问题" @keyup.enter="sendMessage"></el-input>
      <el-button type="primary" @click="sendMessage">发送</el-button>
    </div>
    <div class="response-container">
      <VueFlow
          v-if="nodes.length"
          :nodes="nodes"
          :edges="edges"
          :default-viewport="{ x: 0, y: 0, zoom: 1 }"
          :fit-view-on-init="true"
          class="vue-flow-wrapper"
      >
        <template #node-custom="{ data }">
          <div class="custom-node">
            <div class="node-header">{{ data.label }}</div>
            <iframe
                :src="data.iframeSrc"
                frameborder="0"
                class="node-iframe"
            ></iframe>
          </div>
        </template>
        <Panel position="top-right">
          <button @click="onFit">Fit View</button>
          <button @click="onZoomIn">Zoom In</button>
          <button @click="onZoomOut">Zoom Out</button>
        </Panel>
      </VueFlow>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import {
  VueFlow,
  Panel,
  useVueFlow,
  Node,
  Edge,
  Position,
  Connection
} from '@vue-flow/core';
import '@vue-flow/core/dist/style.css';

interface ChatResponse {
  responses: string[];
}

interface NodeData {
  label: string;
  iframeSrc: string;
}

interface CustomNode extends Node {
  data: NodeData;
}

interface CustomEdge extends Edge {
  animated: boolean;
}

export default defineComponent({
  name: 'ChatFlow',
  components: {
    VueFlow,
    Panel
  },
  setup() {
    const userInput = ref<string>('');
    const responses = ref<string[]>([]);
    const nodes = ref<CustomNode[]>([]);
    const edges = ref<CustomEdge[]>([]);
    const route = useRoute();

    const {
      onPaneReady,
      fitView,
      zoomIn,
      zoomOut
    } = useVueFlow({
      defaultViewport: { x: 0, y: 0, zoom: 1 }
    });

    const onFit = (): void => {
      fitView();
    };

    const onZoomIn = (): void => {
      zoomIn();
    };

    const onZoomOut = (): void => {
      zoomOut();
    };

    const sendMessage = async (): Promise<void> => {
      if (!userInput.value.trim()) return;

      try {
        const response = await fetch('http://127.0.0.1:8000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question: userInput.value }),
        });

        const data: ChatResponse = await response.json();
        responses.value = data.responses;
        setupFlowData(responses.value);
        userInput.value = '';
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      }
    };

    const setupFlowData = (responses: string[]): void => {
      // 创建树状结构的节点
      nodes.value = responses.map((resp: string, index: number): CustomNode => ({
        id: `node-${index}`,
        type: 'custom',
        data: {
          label: `响应 ${index + 1}`,
          iframeSrc: resp
        },
        position: {
          x: index * 300,
          y: Math.floor(index / 2) * 200
        },
        style: {
          width: 280,
          height: 200,
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: 'white',
        },
      }));

      // 创建连接边
      edges.value = responses.slice(0, -1).map((_, index: number): CustomEdge => ({
        id: `edge-${index}`,
        source: `node-${index}`,
        target: `node-${index + 1}`,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6E7B8B' },
      }));
    };

    onPaneReady(({ fitView }): void => {
      fitView();
    });

    return {
      userInput,
      sendMessage,
      nodes,
      edges,
      responses,
      onFit,
      onZoomIn,
      onZoomOut
    };
  },
});
</script>

<style>
.chat-page {
  height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.response-container {
  flex-grow: 1;
  height: calc(100vh - 150px);
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.vue-flow-wrapper {
  width: 100%;
  height: 100%;
}

.custom-node {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.node-header {
  padding: 8px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  font-weight: bold;
}

.node-iframe {
  flex-grow: 1;
  width: 100%;
  border: none;
}

.vue-flow__panel {
  gap: 8px;
}

.vue-flow__panel button {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}

.vue-flow__panel button:hover {
  background: #f5f5f5;
}
</style>
