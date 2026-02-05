<template>
  <client-only>
    <div ref="editor" class="editor"></div>
    <!-- <button @click="exportHtml" type="button" class="main_btn">Применить редактор</button> -->
  </client-only>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, defineEmits } from "vue";
import axios from "axios";

const props = defineProps({
  initialHtml: {
    type: String,
    default: "",
  },
});

const editor = ref<HTMLElement | null>(null);
let editorInstance: any = null;
const emit = defineEmits(["export-html"]);

onMounted(async () => {
  const token = localStorage.getItem("authToken");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  if (!process.client) return;

  const { default: EditorJS } = await import("@editorjs/editorjs");
  const { default: Header } = await import("@editorjs/header");
  const { default: List } = await import("@editorjs/list");
  const { default: Table } = await import("@editorjs/table");
  const { default: ImageTool } = await import("@editorjs/image");
  const { default: Columns } = await import("@calumk/editorjs-columns");
  const { default: ImageGallery } = await import("@kiberpro/editorjs-gallery");
  const { default: AlignmentTune } = await import("editor-js-alignment-tune");
  const { default: EditorJSHTML } = await import("editorjs-html");

  // ---- helpers for LIST (Start with / Counter type) ----
  const counterTypeToOlType = (counterType?: string) => {
    switch (counterType) {
      case "lower-alpha":
        return "a";
      case "upper-alpha":
        return "A";
      case "lower-roman":
        return "i";
      case "upper-roman":
        return "I";
      case "numeric":
      default:
        return "1";
    }
  };

  const renderListItems = (
      items: any[] = [],
      style: string,
      counterType?: string
  ): string => {
    const tag = style === "ordered" ? "ol" : "ul";

    return items
        .map((it) => {
          // @editorjs/list v2: { content, items, meta }
          // на всякий случай поддержим и строковый формат
          const content =
              typeof it === "string" ? it : (it?.content ?? it?.text ?? "");
          const checked = style === "checklist" ? !!it?.meta?.checked : false;

          const checkbox =
              style === "checklist"
                  ? `<input type="checkbox" disabled ${checked ? "checked" : ""} /> `
                  : "";

          const nested =
              Array.isArray(it?.items) && it.items.length
                  ? `<${tag}>${renderListItems(it.items, style, counterType)}</${tag}>`
                  : "";

          return `<li>${checkbox}${content}${nested}</li>`;
        })
        .join("");
  };

  // ---- HTML parser ----
  const htmlParser = EditorJSHTML({
    // ✅ ВАЖНО: кастомный list — учитывает meta.start и meta.counterType
    list: (block: any) => {
      const style = block?.data?.style || "unordered";
      const items = block?.data?.items || [];
      const meta = block?.data?.meta || {};

      // unordered / checklist
      if (style !== "ordered") {
        const cls = style === "checklist" ? ' class="checklist"' : "";
        return `<ul${cls}>${renderListItems(items, style)}</ul>`;
      }

      // ordered
      const start = Number.isFinite(meta.start) ? Number(meta.start) : 1;
      const counterType = meta.counterType || "numeric";
      const typeAttr = counterTypeToOlType(counterType);

      const startAttr = start !== 1 ? ` start="${start}"` : "";
      const type = typeAttr && typeAttr !== "1" ? ` type="${typeAttr}"` : "";

      return `<ol${startAttr}${type}>${renderListItems(
          items,
          "ordered",
          counterType
      )}</ol>`;
    },

    table: (block: any) => {
      const alignments =
          block.data.alignments && block.data.alignments.length > 0
              ? block.data.alignments
              : block.data.content.map((row: any[]) =>
                  row.map(() => block.tunes?.alignmentTune?.alignment || "left")
              );

      const rows = block.data.content
          .map((row: any[], rowIndex: number) => {
            const cells = row
                .map((cell: string, cellIndex: number) => {
                  const alignment = alignments?.[rowIndex]?.[cellIndex] || "left";
                  return rowIndex === 0
                      ? `<th class="align-${alignment}">${cell}</th>`
                      : `<td class="align-${alignment}">${cell}</td>`;
                })
                .join("");
            return `<tr>${cells}</tr>`;
          })
          .join("");

      return `<div class="table-container"><table>${rows}</table></div>`;
    },

    image: (block: any, previousBlock: any) => {
      const isConsecutiveImage = previousBlock && previousBlock.type === "image";
      if (!isConsecutiveImage) {
        return `<div class="image-block"><img src="${block.data.file.url}" alt="" /></div>`;
      }
      return `<div class="image-block-group"><img src="${block.data.file.url}" alt="" /></div>`;
    },

    columns: (block: any) => {
      if (!block.data || !block.data.cols || !Array.isArray(block.data.cols)) {
        console.error("Invalid columns block structure:", block);
        return '<div class="columns">Invalid columns data</div>';
      }

      const columnsHtml = block.data.cols
          .map((column: any) => {
            if (!column.blocks || !Array.isArray(column.blocks)) {
              console.error("Invalid column structure:", column);
              return '<div class="column">Invalid column data</div>';
            }

            const columnContent = column.blocks
                .map((innerBlock: any) => htmlParser.parseBlock(innerBlock))
                .join("");

            return `<div class="column">${columnContent}</div>`;
          })
          .join("");

      return `<div class="columns">${columnsHtml}</div>`;
    },

    gallery: (block: any) => {
      if (!block.data || !block.data.files || !Array.isArray(block.data.files)) {
        console.error("❌ Invalid gallery block structure:", block);
        return '<div class="gallery">Invalid gallery data</div>';
      }

      const imagesHtml = block.data.files
          .map((img: any) => `<img src="${img.url}" alt="Gallery Image" class="gallery-img">`)
          .join("");

      return `<div class="gallery">${imagesHtml}</div>`;
    },
  });

  // ---- tools for columns ----
  const column_tools = {
    header: Header,
    image: {
      class: ImageTool,
      config: {
        endpoints: {
          byFile: "https://api.solargy.shop/api/upload-image",
        },
        uploader: {
          uploadByFile: async (file: File) => {
            const token = localStorage.getItem("authToken");
            const formData = new FormData();
            formData.append("image", file);

            try {
              const response = await fetch("https://api.solargy.shop/api/upload-image", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token || ""}`,
                },
                body: formData,
              });

              if (!response.ok) {
                console.error("Ошибка загрузки:", await response.text());
                throw new Error("Загрузка изображения не удалась");
              }

              const result = await response.json();

              if (!result.success || !result.file?.url) {
                console.error("Неверный ответ от API:", result);
                throw new Error("Некорректный формат ответа от API");
              }

              return {
                success: 1,
                file: { url: result.file.url },
              };
            } catch (error) {
              console.error("Ошибка при загрузке изображения:", error);
              return { success: 0 };
            }
          },
        },
      },
    },
  };

  // ---- EditorJS ----
  editorInstance = new EditorJS({
    holder: editor.value!,
    tools: {
      paragraph: {
        inlineToolbar: true,
      },

      header: {
        class: Header,
        inlineToolbar: ["bold", "italic"],
      },

      list: {
        class: List,
        inlineToolbar: true,
      },

      table: {
        class: Table,
        inlineToolbar: true,
        tunes: ["alignmentTune"],
        config: {},
      },

      alignmentTune: {
        class: AlignmentTune,
        config: {
          default: "left",
          blocks: {
            header: {
              availableAlignments: ["left", "center", "right"],
            },
          },
        },
      },

      image: {
        class: ImageTool,
        config: {
          endpoints: {
            byFile: "https://api.solargy.shop/api/upload-image",
          },
          uploader: {
            uploadByFile: async (file: File) => {
              const token = localStorage.getItem("authToken");
              const formData = new FormData();
              formData.append("image", file);

              try {
                const response = await fetch("https://api.solargy.shop/api/upload-image", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token || ""}`,
                  },
                  body: formData,
                });

                if (!response.ok) {
                  console.error("Ошибка загрузки:", await response.text());
                  throw new Error("Загрузка изображения не удалась");
                }

                const result = await response.json();

                if (!result.success || !result.file?.url) {
                  console.error("Неверный ответ от API:", result);
                  throw new Error("Некорректный формат ответа от API");
                }

                return {
                  success: 1,
                  file: { url: result.file.url },
                };
              } catch (error) {
                console.error("Ошибка при загрузке изображения:", error);
                return { success: 0 };
              }
            },
          },
          captionPlaceholder: "",
          caption: false,
        },
      },

      columns: {
        class: Columns,
        config: {
          EditorJsLibrary: EditorJS,
          tools: column_tools,
        },
      },

      gallery: {
        class: ImageGallery,
        config: {
          endpoints: {
            byFile: "https://api.solargy.shop/api/upload-image",
          },
          uploader: {
            uploadByFile: async (file: File) => {
              const token = localStorage.getItem("authToken");
              const formData = new FormData();
              formData.append("image", file);

              try {
                const response = await fetch("https://api.solargy.shop/api/upload-image", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token || ""}`,
                  },
                  body: formData,
                });

                if (!response.ok) {
                  console.error("Ошибка загрузки:", await response.text());
                  throw new Error("Загрузка изображения не удалась");
                }

                const result = await response.json();

                if (!result.success || !result.file?.url) {
                  console.error("Неверный ответ от API:", result);
                  throw new Error("Некорректный формат ответа от API");
                }

                return {
                  success: 1,
                  file: { url: result.file.url },
                };
              } catch (error) {
                console.error("Ошибка при загрузке изображения:", error);
                return { success: 0 };
              }
            },
          },
        },
      },
    },

    placeholder: "Начните писать здесь...",

    onReady: () => {
      if (props.initialHtml) {
        try {
          const blocks = parseHtmlToEditorBlocks(props.initialHtml);
          editorInstance.blocks.render({ blocks });
        } catch {
          // fallback
          editorInstance.blocks.renderFromHTML(props.initialHtml);
        }
      }
    },

    onChange: async () => {
      const data = await editorInstance.save();
      const html = editorInstance.htmlParser.parse(data).join("");
      emit("export-html", html);
    },
  });

  editorInstance.htmlParser = htmlParser;
});

function parseHtmlToEditorBlocks(html: string): { type: string; data: any; tunes?: any }[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const blocks: { type: string; data: any; tunes?: any }[] = [];

  const olTypeToCounterType = (t: string) => {
    switch (t) {
      case "a":
        return "lower-alpha";
      case "A":
        return "upper-alpha";
      case "i":
        return "lower-roman";
      case "I":
        return "upper-roman";
      case "1":
      default:
        return "numeric";
    }
  };

  doc.body.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      blocks.push({
        type: "paragraph",
        data: { text: node.textContent.trim() },
      });
      return;
    }

    if (!(node instanceof HTMLElement)) return;

    if (node.tagName === "P") {
      blocks.push({
        type: "paragraph",
        data: { text: node.innerHTML },
      });
      return;
    }

    if (node.tagName === "H2") {
      blocks.push({
        type: "header",
        data: { text: node.innerHTML, level: 2 },
      });
      return;
    }

    // ✅ UL (unordered / checklist)
    if (node.tagName === "UL") {
      const isChecklist =
          node.classList.contains("checklist") ||
          !!node.querySelector('input[type="checkbox"]');

      const items = Array.from(node.querySelectorAll(":scope > li")).map((li) => {
        const liEl = li as HTMLElement;

        // если checklist — убираем input из content, а checked кладём в meta
        const checkbox = liEl.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
        if (isChecklist && checkbox) {
          checkbox.remove();
        }

        return {
          content: liEl.innerHTML.trim(),
          items: [],
          meta: isChecklist ? { checked: !!checkbox?.checked } : {},
        };
      });

      blocks.push({
        type: "list",
        data: {
          style: isChecklist ? "checklist" : "unordered",
          items,
        },
      });
      return;
    }

    // ✅ OL (ordered + start/type)
    if (node.tagName === "OL") {
      const start = parseInt(node.getAttribute("start") || "1", 10) || 1;
      const typeAttr = (node.getAttribute("type") || "1").trim();

      const items = Array.from(node.querySelectorAll(":scope > li")).map((li) => {
        const liEl = li as HTMLElement;
        return {
          content: liEl.innerHTML.trim(),
          items: [],
          meta: {},
        };
      });

      blocks.push({
        type: "list",
        data: {
          style: "ordered",
          meta: { start, counterType: olTypeToCounterType(typeAttr) },
          items,
        },
      });
      return;
    }

    // table-container -> table
    if (node.tagName === "DIV" && node.classList.contains("table-container")) {
      const table = node.querySelector("table");
      if (table) {
        const alignmentCounts = { left: 0, center: 0, right: 0 };

        Array.from(table.querySelectorAll("th, td")).forEach((cell) => {
          if (cell.classList.contains("align-left")) alignmentCounts.left++;
          if (cell.classList.contains("align-center")) alignmentCounts.center++;
          if (cell.classList.contains("align-right")) alignmentCounts.right++;
        });

        const tableAlignment = (Object.keys(alignmentCounts) as Array<
            keyof typeof alignmentCounts
        >).reduce((a, b) => (alignmentCounts[a] > alignmentCounts[b] ? a : b));

        const rows = Array.from(table.querySelectorAll("tr")).map((row) => {
          return Array.from(row.querySelectorAll("th, td")).map((cell) =>
              (cell as HTMLElement).innerHTML.trim()
          );
        });

        blocks.push({
          type: "table",
          data: { content: rows },
          tunes: {
            alignmentTune: {
              alignment: tableAlignment,
            },
          },
        });
      }
      return;
    }

    // image-block
    if (node.tagName === "DIV" && node.classList.contains("image-block")) {
      const img = node.querySelector("img");
      if (img) {
        blocks.push({
          type: "image",
          data: { file: { url: (img as HTMLImageElement).src } },
        });
      }
      return;
    }

    // columns
    if (node.tagName === "DIV" && node.classList.contains("columns")) {
      const columns = Array.from(node.querySelectorAll(".column")).map((column) => {
        const blocksInColumn = parseHtmlToEditorBlocks((column as HTMLElement).innerHTML);
        return { blocks: blocksInColumn };
      });

      blocks.push({
        type: "columns",
        data: { cols: columns },
      });
      return;
    }

    // gallery
    if (node.tagName === "DIV" && node.classList.contains("gallery")) {
      const images = Array.from(node.querySelectorAll("img")).map((img) => ({
        url: (img as HTMLImageElement).src,
      }));

      blocks.push({
        type: "gallery",
        data: {
          files: images,
          style: "slider",
        },
      });
      return;
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
  const html = editorInstance.htmlParser.parse(data).join("");
  emit("export-html", html);
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
