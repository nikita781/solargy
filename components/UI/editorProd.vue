<template>
  <client-only>
    <div ref="editor" class="editor"></div>
    <!--    <button @click="exportHtml" type="button" class="main_btn">Применить редактор</button>-->
  </client-only>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, defineEmits } from 'vue';
import axios from "axios";

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
  const token = localStorage.getItem('authToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  if (process.client) {
    const { default: EditorJS } = await import('@editorjs/editorjs');
    const { default: Header } = await import('@editorjs/header');
    const { default: List } = await import('@editorjs/list');
    const { default: Table } = await import('@editorjs/table');
    const { default: ImageTool } = await import('@editorjs/image');
    const { default: EditorJSHTML } = await import('editorjs-html');

    const htmlParser = EditorJSHTML({
      table: (block: any) => {
        const rows = block.data.content.map((row: string[], rowIndex: number) => {
          const cells = row
              .map((cell: string) => {
                return rowIndex === 0
                    ? `<th>${cell}</th>`
                    : `<td>${cell}</td>`;
              })
              .join('');
          return `<tr>${cells}</tr>`;
        }).join('');
        return `<div class="table-container"><table>${rows}</table></div>`;
      },
      image: (block: any, previousBlock: any) => {
        // Проверяем, является ли это изображение и предыдущий блок тоже изображением
        const isConsecutiveImage = previousBlock && previousBlock.type === 'image';

        // Если это первое изображение или оно не идет подряд с другим изображением
        if (!isConsecutiveImage) {
          return `<div class="image-block">
                <img src="${block.data.file.url}" alt="" />
              </div>`;
        }

        // Если изображения идут подряд, оборачиваем их в один контейнер
        return `<div class="image-block-group">
              <img src="${block.data.file.url}" alt="" />
            </div>`;
      },
    });

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
        table: {
          class: Table,
          inlineToolbar: true,
          config: {
            rows: 2,
            cols: 3,
          },
        },
        image: {
          class: ImageTool,
          config: {
            endpoints: {
              byFile: 'http://127.0.0.1:8000/api/upload-image',
            },
            uploader: {
              uploadByFile: async (file: File) => {
                const token = localStorage.getItem('authToken');

                const formData = new FormData();
                formData.append('image', file);

                try {
                  const response = await fetch('http://127.0.0.1:8000/api/upload-image', {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${token || ''}`,
                    },
                    body: formData,
                  });

                  if (!response.ok) {
                    console.error('Ошибка загрузки:', await response.text());
                    throw new Error('Загрузка изображения не удалась');
                  }

                  const result = await response.json();

                  // Условие проверки формата ответа
                  if (!result.success || !result.file?.url) {
                    console.error('Неверный ответ от API:', result);
                    throw new Error('Некорректный формат ответа от API');
                  }

                  return {
                    success: 1, // Редактор ожидает 1, а не true
                    file: {
                      url: result.file.url,
                    },
                  };
                } catch (error) {
                  console.error('Ошибка при загрузке изображения:', error);
                  return {
                    success: 0,
                  };
                }
              },
            },
          },
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
      onChange: async () => {
        const data = await editorInstance.save();
        const html = editorInstance.htmlParser.parse(data).join('');
        emit('export-html', html);
      },
    });
    editorInstance.htmlParser = htmlParser;
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