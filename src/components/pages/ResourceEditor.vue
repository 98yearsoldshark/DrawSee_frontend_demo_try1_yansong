<template>
  <div>
    <el-button @click="addResource">添加资源</el-button>

    <el-table :data="resources" style="width: 100%">
      <el-table-column prop="type" label="类型" />
      <el-table-column prop="value" label="内容" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button @click="deleteResource(scope.$index)" type="danger">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showDialog" title="资源信息">
      <el-select v-model="newResource.type" placeholder="选择资源类型">
        <el-option label="PDF" value="pdf" />
        <el-option label="视频" value="video" />
        <el-option label="Iframe" value="iframe" />
      </el-select>
      <el-input v-model="newResource.value" placeholder="资源内容" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="showDialog = false">取消</el-button>
        <el-button @click="saveResource" type="primary">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { ref, watch, defineComponent, PropType } from 'vue';

interface Resource {
  type: string;
  value: string;
}

export default defineComponent({
  props: {
    modelValue: {
      type: Array as PropType<Resource[]>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const resources = ref<Resource[]>([...props.modelValue]);
    const showDialog = ref(false);
    const newResource = ref<Resource>({ type: '', value: '' });

    const addResource = () => {
      newResource.value = { type: '', value: '' };
      showDialog.value = true;
    };

    const saveResource = () => {
      resources.value.push({ ...newResource.value });
      showDialog.value = false;
      emit('update:modelValue', resources.value);
    };

    const deleteResource = (index: number) => {
      resources.value.splice(index, 1);
      emit('update:modelValue', resources.value);
    };

    watch(
        () => props.modelValue,
        (newValue) => {
          resources.value = [...newValue];
        }
    );

    return {
      resources,
      showDialog,
      newResource,
      addResource,
      saveResource,
      deleteResource,
    };
  },
});
</script>
