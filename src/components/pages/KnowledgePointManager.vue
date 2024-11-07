<template>
  <div>
    <el-button @click="openAddDialog">添加知识点</el-button>
    <el-table :data="knowledgePoints" style="width: 100%">
      <el-table-column prop="name" label="知识点名称" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button @click="editPoint(scope.row)">编辑</el-button>
          <el-button @click="deletePoint(scope.row._id)" type="danger">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="showDialog" title="知识点信息">
      <el-input v-model="currentPoint.name" placeholder="名称" />
      <resource-editor v-model="currentPoint.resource" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="showDialog = false">取消</el-button>
        <el-button @click="savePoint" type="primary">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, defineComponent } from 'vue'
import axios from 'axios'
import ResourceEditor from './ResourceEditor.vue'

interface KnowledgePoint {
  _id?: string;
  name: string;
  resource: any[];
  children: any[];
}

export default defineComponent({
  components: { ResourceEditor },
  setup() {
    const knowledgePoints = ref<KnowledgePoint[]>([])
    const showDialog = ref(false)
    const currentPoint = ref<KnowledgePoint>({ name: '', resource: [], children: [] })

    const loadPoints = async () => {
      knowledgePoints.value = await axios.get('/api/knowledge_points').then(res => res.data)
    }

    const openAddDialog = () => {
      currentPoint.value = { name: '', resource: [], children: [] }
      showDialog.value = true
    }

    const savePoint = async () => {
      if (currentPoint.value._id) {
        await axios.put(`/api/knowledge_points/${currentPoint.value._id}`, currentPoint.value)
      } else {
        await axios.post('/api/knowledge_points', currentPoint.value)
      }
      showDialog.value = false
      loadPoints()
    }

    const editPoint = (point: KnowledgePoint) => {
      currentPoint.value = { ...point }
      showDialog.value = true
    }

    const deletePoint = async (id: string) => {
      await axios.delete(`/api/knowledge_points/${id}`)
      loadPoints()
    }

    onMounted(loadPoints)

    return { knowledgePoints, showDialog, currentPoint, openAddDialog, savePoint, editPoint, deletePoint }
  }
})
</script>

