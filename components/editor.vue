<template>
  <client-only>
    <div ref="editor" class="editor"></div>
    <button @click="exportHtml" type="button" class="main_btn">Применить редактор</button>
  </client-only>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, defineEmits } from 'vue';

const props = defineProps({
  initialHtml: {
    type: String,
    default: '',
  },
});

const editor = ref<HTMLElement | null>(null);
let editorInstance: any = null;
const emit = defineEmits(['export-html']);

onMounted(async () => {
  if (process.client) {
    const { default: EditorJS } = await import('@editorjs/editorjs');
    const { default: Header } = await import('@editorjs/header');
    const { default: List } = await import('@editorjs/list');
    const { default: EditorJSHTML } = await import('editorjs-html');

    editorInstance = new EditorJS({
      holder: editor.value!,
      tools: {
        header: {
          class: Header,
          inlineToolbar: ['bold', 'italic'],
        },
        list: {
          class: List,
          inlineToolbar: true,
        },
      },
      placeholder: 'Начните писать здесь...',
      onReady: () => {
        if (props.initialHtml) {
          try {
            const initialData = JSON.parse(props.initialHtml);
            editorInstance.blocks.render(initialData);
          } catch {
            editorInstance.blocks.renderFromHTML(props.initialHtml);
          }
        }
      },
    });
    editorInstance.htmlParser = EditorJSHTML();
  }
});

onBeforeUnmount(() => {
  editorInstance?.destroy();
  editorInstance = null;
});

const exportHtml = async () => {
  if (!editorInstance) return;

  const data = await editorInstance.save();
  const html = editorInstance.htmlParser.parse(data).join('');
  emit('export-html', html);
};
</script>

<style>
.editor {
  border: 1px solid #ddd;
  padding: 10px;
  min-height: 150px;
  border-radius: 8px;
  background-color: #fff;
}
</style>