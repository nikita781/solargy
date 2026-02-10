<template>
  <client-only>
    <div ref="editor" class="editor"></div>
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

/**
 * ✅ Хранилище Start with по ID блока списка.
 */
const orderedStartByBlockId = new Map<string, number>();

let popoverObserver: MutationObserver | null = null;
let inputListener: ((e: Event) => void) | null = null;

const getFocusedBlockEl = () => {
  const root = editor.value;
  if (!root) return null;
  return (
      root.querySelector(".ce-block--focused") ||
      root.querySelector(".ce-block--selected") ||
      root.querySelector(".ce-block.ce-block--focused") ||
      root.querySelector(".ce-block.ce-block--selected")
  ) as HTMLElement | null;
};

const getFocusedBlockId = () => {
  const el = getFocusedBlockEl();
  return el?.getAttribute("data-id") || "";
};

/**
 * ✅ ВАЖНО: ordered list в EditorJS часто НЕ <ol>, а .cdx-list--ordered
 */
const isFocusedBlockOrderedList = () => {
  const el = getFocusedBlockEl();
  if (!el) return false;
  return !!el.querySelector("ol") || !!el.querySelector(".cdx-list--ordered");
};

const getPopoverEl = () => {
  return (
      document.querySelector(".ce-popover") ||
      document.querySelector(".cdx-popover") ||
      document.querySelector(".ce-popover__container") ||
      document.querySelector(".cdx-popover__container")
  ) as HTMLElement | null;
};

/**
 * Надежнее находим input "Start with" по тексту (Start with / Начать с),
 * иначе fallback — числовой input не Filter.
 */
const findStartWithInput = (): HTMLInputElement | null => {
  const popover = getPopoverEl();
  if (!popover) return null;

  const needles = ["start with", "начать с", "начинать с", "start"];
  const allEls = Array.from(popover.querySelectorAll("*")) as HTMLElement[];

  const labelEl = allEls.find((el) => {
    const t = (el.textContent || "").trim().toLowerCase();
    if (!t) return false;
    return needles.some((n) => t === n || t.includes(n));
  });

  if (labelEl) {
    const row = labelEl.closest("div")?.parentElement || labelEl.parentElement;
    const inp = row?.querySelector("input") as HTMLInputElement | null;
    if (inp) return inp;
  }

  // fallback
  const inputs = Array.from(popover.querySelectorAll("input")) as HTMLInputElement[];

  const candidates = inputs.filter((inp) => {
    const ph = (inp.getAttribute("placeholder") || "").toLowerCase();
    if (ph.includes("filter")) return false;
    if (inp.type === "search") return false;
    return true;
  });

  const numeric = candidates.find((inp) => {
    const v = (inp.value || "").trim();
    if (v === "") return true;
    return /^\d+$/.test(v);
  });

  return numeric || null;
};

/**
 * ✅ Применяем start из Map в UI поповера
 */
const applyStartToPopoverIfNeeded = () => {
  const blockId = getFocusedBlockId();
  if (!blockId) return;
  if (!isFocusedBlockOrderedList()) return;

  const saved = orderedStartByBlockId.get(blockId);
  if (!saved || saved === 1) return;

  const inp = findStartWithInput();
  if (!inp) return;

  const desired = String(saved);
  if (inp.value !== desired) {
    inp.value = desired;
    inp.dispatchEvent(new Event("input", { bubbles: true }));
    inp.dispatchEvent(new Event("change", { bubbles: true }));
  }
};

/**
 * ✅ Получить DOM контейнер ordered-списка в блоке.
 * (ol или .cdx-list--ordered)
 */
const getOrderedListDomEl = (blockEl: HTMLElement): HTMLElement | null => {
  // чаще всего именно так
  const cdx = blockEl.querySelector(".cdx-list--ordered") as HTMLElement | null;
  if (cdx) return cdx;

  // иногда бывает нативный ol
  const ol = blockEl.querySelector("ol") as HTMLElement | null;
  if (ol) return ol;

  return null;
};

/**
 * ✅ Ключевой фикс: если список рисуется CSS counter-ами,
 * то start нужно задавать через counter-reset.
 *
 * Работает и для .cdx-list--ordered, и для ol (если ol стилизован counter-ами).
 */
const applyStartToDomList = (blockId: string, start: number) => {
  const root = editor.value;
  if (!root) return;

  const blockEl = root.querySelector(`.ce-block[data-id="${blockId}"]`) as HTMLElement | null;
  if (!blockEl) return;

  const listEl = getOrderedListDomEl(blockEl);
  if (!listEl) return;

  const desiredStart = Number.isFinite(start) ? start : 1;
  const resetValue = Math.max(0, desiredStart - 1);

  // 1) если это ol — поставим и атрибут start (на всякий случай)
  if (listEl.tagName === "OL") {
    const ol = listEl as HTMLOListElement;
    if (desiredStart > 1) ol.setAttribute("start", String(desiredStart));
    else ol.removeAttribute("start");
  }

  // 2) главное: counter-reset
  // читаем какой именно counter используется (чтобы не гадать имя)
  const computed = window.getComputedStyle(listEl);
  const cr = (computed.counterReset || "").trim(); // например: "item 0" или "cdx-list-counter 0"
  // берем первый counter (если их несколько, разделяются запятыми)
  const first = cr && cr !== "none" ? cr.split(",")[0].trim() : "";
  const counterName = first ? first.split(/\s+/)[0] : "item";

  // ставим inline override
  listEl.style.counterReset = `${counterName} ${resetValue}`;
};

/**
 * Рекурсивный обход блоков (для columns и т.п.)
 */
const walkBlocks = (blocks: any[], cb: (b: any) => void) => {
  for (const b of blocks || []) {
    if (!b) continue;
    cb(b);

    if (b.type === "columns" && Array.isArray(b.data?.cols)) {
      for (const col of b.data.cols) {
        if (Array.isArray(col?.blocks)) {
          walkBlocks(col.blocks, cb);
        }
      }
    }
  }
};

/**
 * ✅ Патчим start перед экспортом (и вложенные тоже)
 */
const patchOrderedListMetaBeforeExport = (data: any) => {
  if (!data?.blocks?.length) return data;

  walkBlocks(data.blocks, (b) => {
    if (!b || b.type !== "list") return;
    if (b.data?.style !== "ordered") return;

    const id = b.id;
    if (!id) return;

    const meta = (b.data.meta = { ...(b.data.meta || {}) });

    const currentStartRaw = meta.start ?? b.data.start ?? 1;
    const currentStart = Number.isFinite(Number(currentStartRaw)) ? Number(currentStartRaw) : 1;

    const fromMap = orderedStartByBlockId.get(id);
    const finalStart = fromMap && fromMap > 1 ? fromMap : currentStart;

    meta.start = finalStart;
    b.data.start = finalStart;
  });

  return data;
};

onMounted(async () => {
  const token = localStorage.getItem("authToken");
  if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

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

  // ---------------- LIST helpers ----------------
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

  const getItemContent = (it: any) => (typeof it === "string" ? it : it?.content ?? it?.text ?? "");
  const getItemChecked = (it: any) => !!(it?.checked ?? it?.meta?.checked);
  const getItemChildren = (it: any) => (Array.isArray(it?.items) ? it.items : []);

  const renderListItems = (items: any[] = [], style: string): string => {
    const nestedTag = style === "ordered" ? "ol" : "ul";
    const ulCls = style === "checklist" ? ' class="checklist"' : "";

    return items
        .map((it) => {
          const content = getItemContent(it);
          const checked = style === "checklist" ? getItemChecked(it) : false;

          const checkbox =
              style === "checklist"
                  ? `<input type="checkbox" disabled ${checked ? "checked" : ""} /> `
                  : "";

          const children = getItemChildren(it);
          const nested =
              children.length
                  ? `<${nestedTag}${nestedTag === "ul" ? ulCls : ""}>${renderListItems(children, style)}</${nestedTag}>`
                  : "";

          return `<li>${checkbox}${content}${nested}</li>`;
        })
        .join("");
  };

  // ---------------- HTML parser ----------------
  const htmlParser = EditorJSHTML({
    list: (block: any) => {
      const style = block?.data?.style || "unordered";
      const items = block?.data?.items || [];
      const meta = block?.data?.meta || {};

      if (style !== "ordered") {
        const cls = style === "checklist" ? ' class="checklist"' : "";
        return `<ul${cls}>${renderListItems(items, style)}</ul>`;
      }

      const startRaw = meta.start ?? block?.data?.start ?? 1;
      const start = Number.isFinite(Number(startRaw)) ? Number(startRaw) : 1;

      const counterTypeRaw = meta.counterType ?? block?.data?.counterType ?? "numeric";
      const counterType = String(counterTypeRaw || "numeric");
      const typeAttr = counterTypeToOlType(counterType);

      const startAttr = start !== 1 ? ` start="${start}"` : "";
      const type = typeAttr && typeAttr !== "1" ? ` type="${typeAttr}"` : "";

      return `<ol${startAttr}${type}>${renderListItems(items, "ordered")}</ol>`;
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

            const columnContent = column.blocks.map((innerBlock: any) => htmlParser.parseBlock(innerBlock)).join("");
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

  // ---------------- upload image helper ----------------
  const getUploadImageUrl = () => {
    const base = axios.defaults.baseURL;
    if (base) return `${String(base).replace(/\/$/, "")}/upload-image`;
    return "/api/upload-image";
  };

  const uploadImageUrl = getUploadImageUrl();

  const uploadImage = async (file: File) => {
    const token = localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(uploadImageUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${token || ""}` },
        body: formData,
      });

      if (!response.ok) {
        console.error("Ошибка загрузки:", await response.text());
        throw new Error("Загрузка изображения не удалась");
      }

      const result = await response.json();
      const url =
          result?.file?.url ||
          result?.url ||
          result?.data?.url ||
          result?.data?.file?.url ||
          "";
      if (!url) {
        console.error("Неверный ответ от API:", result);
        throw new Error("Некорректный формат ответа от API");
      }

      return { success: 1, file: { url } };
    } catch (error) {
      console.error("Ошибка при загрузке изображения:", error);
      return { success: 0 };
    }
  };

  const column_tools = {
    header: Header,
    image: {
      class: ImageTool,
      config: {
        endpoints: { byFile: uploadImageUrl },
        uploader: { uploadByFile: uploadImage },
      },
    },
  };

  /**
   * ✅ Собираем "семена" start из initial blocks (и вложенных тоже), в порядке появления.
   */
  const collectOrderedSeeds = (blocks: any[]) => {
    const seeds: number[] = [];
    walkBlocks(blocks, (b) => {
      if (b?.type !== "list") return;
      if (b?.data?.style !== "ordered") return;

      const startRaw = b.data?.meta?.start ?? b.data?.start ?? 1;
      const start = Number.isFinite(Number(startRaw)) ? Number(startRaw) : 1;
      seeds.push(start);
    });
    return seeds;
  };

  /**
   * ✅ Привязываем seeds к реальным id блоков после render()
   * и применяем к DOM (counter-reset), чтобы в редакторе было 7, а не 1.
   */
  const applyOrderedSeedsToRealBlockIds = async (seeds: number[]) => {
    if (!seeds.length) return;

    try {
      const saved = await editorInstance.save();

      let i = 0;
      walkBlocks(saved.blocks || [], (b) => {
        if (b?.type !== "list") return;
        if (b?.data?.style !== "ordered") return;

        const seed = seeds[i++];
        if (seed == null) return;

        if (seed > 1) {
          orderedStartByBlockId.set(b.id, seed);
        } else {
          orderedStartByBlockId.delete(b.id);
        }

        // ✅ DOM apply чуть позже, чтобы точно уже отрисовано
        requestAnimationFrame(() => applyStartToDomList(b.id, seed));
      });
    } catch {
      // ignore
    }
  };

  // ---------------- EditorJS ----------------
  editorInstance = new EditorJS({
    holder: editor.value!,
    tools: {
      paragraph: { inlineToolbar: true },
      header: { class: Header, inlineToolbar: ["bold", "italic"] },
      list: { class: List, inlineToolbar: true },

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
          blocks: { header: { availableAlignments: ["left", "center", "right"] } },
        },
      },

      image: {
        class: ImageTool,
        config: {
          endpoints: { byFile: uploadImageUrl },
          uploader: { uploadByFile: uploadImage },
          captionPlaceholder: "",
          caption: false,
        },
      },

      columns: {
        class: Columns,
        config: { EditorJsLibrary: EditorJS, tools: column_tools },
      },

      gallery: {
        class: ImageGallery,
        config: {
          endpoints: { byFile: uploadImageUrl },
          uploader: { uploadByFile: uploadImage },
        },
      },
    },

    placeholder: "Начните писать здесь...",

    onReady: async () => {
      if (!props.initialHtml) return;

      let blocks: any[] | null = null;
      try {
        blocks = parseHtmlToEditorBlocks(props.initialHtml);
      } catch {
        blocks = null;
      }

      const seeds = blocks ? collectOrderedSeeds(blocks) : [];

      try {
        if (blocks) {
          await editorInstance.blocks.render({ blocks });
        } else {
          editorInstance.blocks.renderFromHTML(props.initialHtml);
        }
      } finally {
        // ✅ после render() маппим seeds -> реальные id и применяем counter-reset
        setTimeout(async () => {
          await applyOrderedSeedsToRealBlockIds(seeds);
        }, 0);
      }
    },

    onChange: async () => {
      const data = await editorInstance.save();

      // ✅ подмешиваем start из Map перед экспортом
      const patched = patchOrderedListMetaBeforeExport(data);

      const html = editorInstance.htmlParser.parse(patched).join("");
      emit("export-html", html);
    },
  });

  editorInstance.htmlParser = htmlParser;

  // ---------------- UI hook: Start with input persistence ----------------
  inputListener = (e: Event) => {
    const t = e.target as HTMLElement | null;
    if (!t || !(t instanceof HTMLInputElement)) return;

    const inPopover = !!t.closest(".ce-popover,.cdx-popover,.ce-popover__container,.cdx-popover__container");
    if (!inPopover) return;

    const ph = (t.getAttribute("placeholder") || "").toLowerCase();
    if (ph.includes("filter")) return;

    const blockId = getFocusedBlockId();
    if (!blockId) return;
    if (!isFocusedBlockOrderedList()) return;

    const v = (t.value || "").trim();
    if (!/^\d+$/.test(v)) return;

    const num = parseInt(v, 10);
    if (!Number.isFinite(num) || num < 1) return;

    orderedStartByBlockId.set(blockId, num);
    requestAnimationFrame(() => applyStartToDomList(blockId, num));
  };

  document.addEventListener("input", inputListener, true);
  document.addEventListener("change", inputListener, true);

  popoverObserver = new MutationObserver(() => {
    requestAnimationFrame(() => applyStartToPopoverIfNeeded());
  });

  popoverObserver.observe(document.body, { childList: true, subtree: true });
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

  const stripDirectNestedLists = (liEl: HTMLElement) => {
    liEl.querySelectorAll(":scope > ul, :scope > ol").forEach((x) => x.remove());
  };

  doc.body.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      blocks.push({ type: "paragraph", data: { text: node.textContent.trim() } });
      return;
    }

    if (!(node instanceof HTMLElement)) return;

    if (node.tagName === "P") {
      blocks.push({ type: "paragraph", data: { text: node.innerHTML } });
      return;
    }

    if (node.tagName === "H2") {
      blocks.push({ type: "header", data: { text: node.innerHTML, level: 2 } });
      return;
    }

    // UL (unordered / checklist)
    if (node.tagName === "UL") {
      const isChecklist =
          node.classList.contains("checklist") || !!node.querySelector('input[type="checkbox"]');

      if (isChecklist) {
        const items = Array.from(node.querySelectorAll(":scope > li")).map((li) => {
          const liEl = li as HTMLElement;

          const checkbox = liEl.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
          const checked = !!checkbox?.checked;
          if (checkbox) checkbox.remove();

          stripDirectNestedLists(liEl);
          const text = liEl.innerHTML.trim();

          return {
            text,
            content: text,
            checked,
            meta: { checked },
            items: [],
          };
        });

        blocks.push({ type: "list", data: { style: "checklist", meta: {}, items } });
      } else {
        // ✅ unordered: objects (list v2 format)
        const items = Array.from(node.querySelectorAll(":scope > li")).map((li) => {
          const liEl = li as HTMLElement;
          stripDirectNestedLists(liEl);
          const content = liEl.innerHTML.trim();
          return { content, text: content, items: [], meta: {} };
        });

        blocks.push({ type: "list", data: { style: "unordered", meta: {}, items } });
      }
      return;
    }

    // OL (ordered + start/type)
    if (node.tagName === "OL") {
      const start = parseInt(node.getAttribute("start") || "1", 10) || 1;
      const typeAttr = (node.getAttribute("type") || "1").trim();
      const counterType = olTypeToCounterType(typeAttr);

      // ✅ ordered: objects (list v2 format)
      const items = Array.from(node.querySelectorAll(":scope > li")).map((li) => {
        const liEl = li as HTMLElement;
        stripDirectNestedLists(liEl);
        const content = liEl.innerHTML.trim();
        return { content, text: content, items: [], meta: {} };
      });

      blocks.push({
        type: "list",
        data: {
          style: "ordered",
          meta: { start, counterType },
          start,
          counterType,
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

        const tableAlignment = (Object.keys(alignmentCounts) as Array<keyof typeof alignmentCounts>).reduce(
            (a, b) => (alignmentCounts[a] > alignmentCounts[b] ? a : b)
        );

        const rows = Array.from(table.querySelectorAll("tr")).map((row) =>
            Array.from(row.querySelectorAll("th, td")).map((cell) => (cell as HTMLElement).innerHTML.trim())
        );

        blocks.push({
          type: "table",
          data: { content: rows },
          tunes: { alignmentTune: { alignment: tableAlignment } },
        });
      }
      return;
    }

    // image-block
    if (node.tagName === "DIV" && node.classList.contains("image-block")) {
      const img = node.querySelector("img");
      if (img) {
        blocks.push({ type: "image", data: { file: { url: (img as HTMLImageElement).src } } });
      }
      return;
    }

    // columns
    if (node.tagName === "DIV" && node.classList.contains("columns")) {
      const columns = Array.from(node.querySelectorAll(".column")).map((column) => {
        const blocksInColumn = parseHtmlToEditorBlocks((column as HTMLElement).innerHTML);
        return { blocks: blocksInColumn };
      });

      blocks.push({ type: "columns", data: { cols: columns } });
      return;
    }

    // gallery
    if (node.tagName === "DIV" && node.classList.contains("gallery")) {
      const images = Array.from(node.querySelectorAll("img")).map((img) => ({
        url: (img as HTMLImageElement).src,
      }));

      blocks.push({ type: "gallery", data: { files: images, style: "slider" } });
      return;
    }
  });

  return blocks;
}

onBeforeUnmount(() => {
  if (popoverObserver) {
    popoverObserver.disconnect();
    popoverObserver = null;
  }
  if (inputListener) {
    document.removeEventListener("input", inputListener, true);
    document.removeEventListener("change", inputListener, true);
    inputListener = null;
  }

  editorInstance?.destroy();
  editorInstance = null;
});
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
