<template>
  <client-only>
    <div ref="editor" class="editor"></div>
    <!-- <button @click="exportHtml" type="button" class="main_btn">Применить редактор</button> -->
  </client-only>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, defineEmits } from "vue";

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
  if (!process.client) return;

  const { default: EditorJS } = await import("@editorjs/editorjs");
  const { default: Header } = await import("@editorjs/header");
  const { default: List } = await import("@editorjs/list");
  const { default: Table } = await import("@editorjs/table");
  const { default: EditorJSHTML } = await import("editorjs-html");

  // ---------- LIST helpers (Start with / Counter type) ----------
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

  const renderListItems = (items: any[] = [], style: string): string => {
    return items
        .map((it) => {
          // @editorjs/list v2: { content, items, meta }
          // запасной вариант для старого формата
          const content =
              typeof it === "string" ? it : (it?.content ?? it?.text ?? "");
          const checked = style === "checklist" ? !!it?.meta?.checked : false;

          const checkbox =
              style === "checklist"
                  ? `<input type="checkbox" disabled ${checked ? "checked" : ""} /> `
                  : "";

          const nested =
              Array.isArray(it?.items) && it.items.length
                  ? `<ul>${renderListItems(it.items, style)}</ul>`
                  : "";

          return `<li>${checkbox}${content}${nested}</li>`;
        })
        .join("");
  };

  // ---------- HTML parser ----------
  const htmlParser = EditorJSHTML({
    // ✅ фикс: сохраняем "Start with" и "Counter type" в HTML
    list: (block: any) => {
      const style = block?.data?.style || "unordered";
      const items = block?.data?.items || [];
      const meta = block?.data?.meta || {};

      if (style !== "ordered") {
        const cls = style === "checklist" ? ' class="checklist"' : "";
        return `<ul${cls}>${renderListItems(items, style)}</ul>`;
      }

      const start = Number.isFinite(meta.start) ? Number(meta.start) : 1;
      const counterType = meta.counterType || "numeric";
      const typeAttr = counterTypeToOlType(counterType);

      const startAttr = start !== 1 ? ` start="${start}"` : "";
      const type = typeAttr && typeAttr !== "1" ? ` type="${typeAttr}"` : "";

      return `<ol${startAttr}${type}>${renderListItems(items, "ordered")}</ol>`;
    },

    table: (block: any) => {
      const rows = block.data.content
          .map((row: string[], rowIndex: number) => {
            const cells = row
                .map((cell: string) => {
                  return rowIndex === 0 ? `<th>${cell}</th>` : `<td>${cell}</td>`;
                })
                .join("");
            return `<tr>${cells}</tr>`;
          })
          .join("");

      return `<div class="table-container"><table>${rows}</table></div>`;
    },
  });

  // ---------- EditorJS ----------
  editorInstance = new EditorJS({
    holder: editor.value!,
    tools: {
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
        config: {
          rows: 2,
          cols: 3,
        },
      },
    },
    placeholder: "Начните писать здесь...",

    onReady: () => {
      if (props.initialHtml) {
        try {
          // если вам реально прилетает JSON EditorJS
          const initialData = JSON.parse(props.initialHtml);
          editorInstance.blocks.render(initialData);
        } catch {
          // иначе HTML
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
