<template>
  <client-only>
    <div ref="editor" class="editor"></div>
    <!-- <button @click="exportHtml" type="button" class="main_btn">Применить редактор</button> -->
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
    const { default: MyCustomTableTool  } = await import('./CustomTableTool');
    const { default: ImageTool } = await import('@editorjs/image');
    const { default: Columns } = await import('@calumk/editorjs-columns');
    const { default: ImageGallery } = await import('@kiberpro/editorjs-gallery');
    const { default: AlignmentTune  } = await import('editor-js-alignment-tune');
    const { default: EditorJSHTML } = await import('editorjs-html');

    const htmlParser = EditorJSHTML({
      table: (block) => {
        // Если alignments отсутствует, заполняем его значением из alignmentTune
        const alignments =
            block.data.alignments && block.data.alignments.length > 0
                ? block.data.alignments
                : block.data.content.map((row) =>
                    row.map(() => block.tunes?.alignmentTune?.alignment || 'left')
                );

        const rows = block.data.content.map((row, rowIndex) => {
          const cells = row.map((cell, cellIndex) => {
            const alignment = alignments?.[rowIndex]?.[cellIndex] || 'left';
            return rowIndex === 0
                ? `<th class="align-${alignment}">${cell}</th>`
                : `<td class="align-${alignment}">${cell}</td>`;
          }).join('');
          return `<tr>${cells}</tr>`;
        }).join('');

        return `<div class="table-container"><table>${rows}</table></div>`;
      },
      image: (block: any, previousBlock: any) => {
        const isConsecutiveImage = previousBlock && previousBlock.type === 'image';
        if (!isConsecutiveImage) {
          return `<div class="image-block"><img src="${block.data.file.url}" alt="" /></div>`;
        }
        return `<div class="image-block-group"><img src="${block.data.file.url}" alt="" /></div>`;
      },
      columns: (block: any) => {
        if (!block.data || !block.data.cols || !Array.isArray(block.data.cols)) {
          console.error('Invalid columns block structure:', block);
          return '<div class="columns">Invalid columns data</div>';
        }

        const columnsHtml = block.data.cols
            .map((column: any) => {
              if (!column.blocks || !Array.isArray(column.blocks)) {
                console.error('Invalid column structure:', column);
                return '<div class="column">Invalid column data</div>';
              }

              const columnContent = column.blocks
                  .map((innerBlock: any) => htmlParser.parseBlock(innerBlock))
                  .join('');
              return `<div class="column">${columnContent}</div>`;
            })
            .join('');

        return `<div class="columns">${columnsHtml}</div>`;
      },
      gallery: (block: any) => {
        // console.log("📌 Gallery Block Data:", block);

        if (!block.data || !block.data.files || !Array.isArray(block.data.files)) {
          console.error("❌ Invalid gallery block structure:", block);
          return '<div class="gallery">Invalid gallery data</div>';
        }

        // Генерация HTML для изображений в галерее
        const imagesHtml = block.data.files
            .map((img: any) => `<img src="${img.url}" alt="Gallery Image" class="gallery-img">`)
            .join("");

        return `<div class="gallery">${imagesHtml}</div>`;
      },
    });

    // Конфигурация инструментов
    const column_tools = {
      header: Header,
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

                if (!result.success || !result.file?.url) {
                  console.error('Неверный ответ от API:', result);
                  throw new Error('Некорректный формат ответа от API');
                }

                return {
                  success: 1,
                  file: { url: result.file.url },
                };
              } catch (error) {
                console.error('Ошибка при загрузке изображения:', error);
                return { success: 0 };
              }
            },
          },
        },
      },
    };

    // Главные инструменты
    editorInstance = new EditorJS({
      holder: editor.value!,
      tools: {
        paragraph: {
          inlineToolbar: true,
          // tunes: ['alignmentTune'],
        },
        header: {
          class: Header,
          inlineToolbar: ['bold', 'italic'],
          // tunes: ['alignmentTune']
        },
        list: {
          class: List,
          inlineToolbar: true,
          // tunes: ['alignmentTune']
        },
        table: {
          class: Table,
          inlineToolbar: true,
          tunes: ['alignmentTune'],
          config: {
            // Конфигурация
          },
        },
        // myTable: {
        //   class: MyCustomTableTool,
        //   // Можно задать настройки:
        //   config: {
        //     rows: 3,
        //     cols: 3,
        //   },
        // },
        alignmentTune: {
          class: AlignmentTune,
          config: {
            default: 'left',
            blocks: {
              header: {
                availableAlignments: ['left', 'center', 'right']
              },
            }
          }
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

                  if (!result.success || !result.file?.url) {
                    console.error('Неверный ответ от API:', result);
                    throw new Error('Некорректный формат ответа от API');
                  }

                  return {
                    success: 1,
                    file: { url: result.file.url },
                  };
                } catch (error) {
                  console.error('Ошибка при загрузке изображения:', error);
                  return { success: 0 };
                }
              },
            },
          },
        },
        columns: {
          class: Columns,
          // tunes: ['alignmentTune'],
          config: {
            EditorJsLibrary: EditorJS,
            tools: column_tools,
          },
        },
        // column: {
        //   class: Column,
        //   // tunes: ['alignmentTune'],
        //   config: {
        //     EditorJsLibrary: EditorJS,
        //     tools: column_tools,
        //   },
        // },
        gallery: {
          class: ImageGallery,
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

                  if (!result.success || !result.file?.url) {
                    console.error('Неверный ответ от API:', result);
                    throw new Error('Некорректный формат ответа от API');
                  }

                  return {
                    success: 1,
                    file: { url: result.file.url },
                  };
                } catch (error) {
                  console.error('Ошибка при загрузке изображения:', error);
                  return { success: 0 };
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
            const blocks = parseHtmlToEditorBlocks(props.initialHtml);
            editorInstance.blocks.render({ blocks });
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

function parseHtmlToEditorBlocks(html: string): { type: string; data: any }[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks: { type: string; data: any }[] = [];

  doc.body.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      blocks.push({
        type: 'paragraph',
        data: { text: node.textContent.trim() },
      });
    } else if (node instanceof HTMLElement) {
      if (node.tagName === 'P') {
        blocks.push({
          type: 'paragraph',
          data: { text: node.innerHTML },
        });
      } else if (node.tagName === 'H2') {
        blocks.push({
          type: 'header',
          data: { text: node.innerHTML, level: 2 },
        });
      } else if (node.tagName === 'UL') {
        const items = Array.from(node.querySelectorAll('li')).map((li) => li.innerHTML.trim());
        if (items.length > 0) {
          blocks.push({
            type: 'list',
            data: { style: 'unordered', items },
          });
        }
      } else if (node instanceof HTMLElement && node.tagName === 'DIV' && node.classList.contains('table-container')) {
        const table = node.querySelector('table');
        if (table) {
          // Считаем количество различных классов выравнивания среди всех ячеек таблицы
          const alignmentCounts = { left: 0, center: 0, right: 0 };

          Array.from(table.querySelectorAll('th, td')).forEach((cell) => {
            if (cell.classList.contains('align-left')) alignmentCounts.left++;
            if (cell.classList.contains('align-center')) alignmentCounts.center++;
            if (cell.classList.contains('align-right')) alignmentCounts.right++;
          });

          // Определяем глобальное выравнивание как наиболее частый класс
          const tableAlignment = Object.keys(alignmentCounts).reduce((a, b) =>
              alignmentCounts[a] > alignmentCounts[b] ? a : b
          );

          // Извлекаем строки таблицы
          const rows = Array.from(table.querySelectorAll('tr')).map((row) => {
            return Array.from(row.querySelectorAll('th, td')).map((cell) => cell.innerHTML.trim());
          });

          // Добавляем блок таблицы с глобальным выравниванием
          blocks.push({
            type: 'table',
            data: {
              content: rows, // Контент таблицы
            },
            tunes: {
              alignmentTune: {
                alignment: tableAlignment, // Сохраняем выравнивание в tunes
              },
            },
          });
        }
      } else if (node.tagName === 'DIV' && node.classList.contains('image-block')) {
        const img = node.querySelector('img');
        if (img) {
          blocks.push({
            type: 'image',
            data: { file: { url: img.src } },
          });
        }
      } else if (node.tagName === 'DIV' && node.classList.contains('columns')) {
        const columns = Array.from(node.querySelectorAll('.column')).map((column) => {
          const blocksInColumn = parseHtmlToEditorBlocks(column.innerHTML);
          return {
            blocks: blocksInColumn,
          };
        });

        blocks.push({
          type: 'columns',
          data: { cols: columns },
        });
      } else if (node.tagName === 'DIV' && node.classList.contains('gallery')) {
        // Собираем все <img> внутри .gallery
        const images = Array.from(node.querySelectorAll('img')).map((img) => ({
          url: img.src,
        }));

        // Пример: style берем "slider" по умолчанию, если нужно
        blocks.push({
          type: 'gallery',
          data: {
            files: images,
            style: 'slider', // или 'grid' — настройте как вам нужно
          },
        });
      }
    }
  });

  return blocks;
}

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
