<template>
  <client-only>
    <div ref="editorWrapper" class="editor-wrapper">
      <div v-if="activeImageBlockId" ref="imageControlsEl" class="image-controls" :style="imageControlsStyle">
        <div class="image-controls__header">
          <span class="image-controls__mark"></span>
          <span class="image-controls__label">Картинка</span>
        </div>

        <div class="image-controls__body">
          <div class="image-controls__group" aria-label="Положение картинки">
            <button
                type="button"
                class="image-controls__btn"
                :class="{ active: activeImageAlignment === 'left' }"
                title="Слева"
                @click="setActiveImageAlignment('left')"
            >
              Слева
            </button>
            <button
                type="button"
                class="image-controls__btn"
                :class="{ active: activeImageAlignment === 'center' }"
                title="По центру"
                @click="setActiveImageAlignment('center')"
            >
              Центр
            </button>
            <button
                type="button"
                class="image-controls__btn"
                :class="{ active: activeImageAlignment === 'right' }"
                title="Справа"
                @click="setActiveImageAlignment('right')"
            >
              Справа
            </button>
          </div>

          <div class="image-controls__group" aria-label="Размер и обтекание">
            <button
                type="button"
                class="image-controls__btn"
                :class="{ active: activeImageStretched }"
                title="По ширине"
                @click="toggleActiveImageStretched"
            >
              По ширине
            </button>
            <button
                type="button"
                class="image-controls__btn"
                :class="{ active: activeImageWrapped }"
                title="Обтекание"
                @click="toggleActiveImageWrapped"
            >
              Обтекание
            </button>
          </div>

          <button
              type="button"
              class="image-controls__btn image-controls__btn--danger"
              title="Удалить картинку"
              @click="removeActiveImageBlock"
          >
            Удалить
          </button>
        </div>
      </div>

      <div ref="editor" class="editor"></div>

      <div v-if="cropperVisible" class="cropper-overlay" @click.stop>
        <div class="cropper-modal" @click.stop>
          <p class="cropper-modal__title">Обрезка изображения</p>

          <div class="cropper-modal__body">
            <img ref="cropperImgEl" :src="cropperImageUrl || ''" class="cropper-modal__image" alt="Crop preview" />
          </div>

          <div class="cropper-modal__actions">
            <button type="button" class="main_btn" @click="confirmCrop">Обрезать и загрузить</button>
            <button type="button" class="main_btn" @click="cancelCrop">Отмена</button>
          </div>
        </div>
      </div>
    </div>
  </client-only>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, watch, nextTick } from "vue";
import axios from "axios";

const props = defineProps({
  initialHtml: {
    type: String,
    default: "",
  },
});

const editor = ref<HTMLElement | null>(null);
const editorWrapper = ref<HTMLElement | null>(null);
const imageControlsEl = ref<HTMLElement | null>(null);
let editorInstance: any = null;
const emit = defineEmits(["export-html"]);

const cropperVisible = ref(false);
const cropperImageUrl = ref<string | null>(null);
const cropperImgEl = ref<HTMLImageElement | null>(null);
const cropperInstance = ref<any>(null);
let CropperClass: any = null;
let pendingCropResolve: ((file: File | null) => void) | null = null;
let pendingCropFileName = "image";
let pendingCropMime = "image/png";
const activeImageBlockId = ref<string | null>(null);
const activeImageAlignment = ref<"left" | "center" | "right">("left");
const activeImageStretched = ref(false);
const activeImageWrapped = ref(false);
const activeImageBlockEl = ref<HTMLElement | null>(null);
const imageControlsStyle = ref<Record<string, string>>({});
const imageWrappedByBlockId = new Map<string, boolean>();
const imageWrappedByImageUrl = new Map<string, boolean>();
let imageSelectionListener: ((e: Event) => void) | null = null;
let imageControlsLayoutListener: ((e?: Event) => void) | null = null;

const getFileExtByMime = (mime: string) => {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return map[mime] || "png";
};

const getOutputMimeByFile = (file: File) => {
  const type = String(file.type || "").toLowerCase();
  if (type === "image/jpeg" || type === "image/jpg") return "image/jpeg";
  if (type === "image/webp") return "image/webp";
  if (type === "image/png") return "image/png";
  return "image/png";
};

const shouldSkipCrop = (file: File) => {
  const name = String(file.name || "").toLowerCase();
  const type = String(file.type || "").toLowerCase();
  return type === "image/gif" || name.endsWith(".gif") || type === "image/svg+xml" || name.endsWith(".svg");
};

const buildCroppedFileName = (originalFileName: string, mime: string) => {
  const extension = getFileExtByMime(mime);
  const base = (originalFileName || "image").replace(/\.[^/.]+$/, "");
  return `${base}-cropped.${extension}`;
};

const closeCropper = () => {
  cropperVisible.value = false;
  cropperImageUrl.value = null;
};

const loadCropper = async () => {
  if (CropperClass) return CropperClass;
  if (!process.client) return null;
  const module = await import("cropperjs");
  CropperClass = module.default || module;
  return CropperClass;
};

watch(cropperVisible, async (visible) => {
  if (visible) {
    await nextTick();
    const Cropper = await loadCropper();
    if (!Cropper || !cropperImgEl.value) return;

    if (cropperInstance.value) {
      cropperInstance.value.destroy();
      cropperInstance.value = null;
    }

    cropperInstance.value = new Cropper(cropperImgEl.value, {
      viewMode: 1,
      autoCropArea: 0.95,
      responsive: true,
      movable: true,
      zoomable: true,
      scalable: false,
      background: false,
    });
  } else if (cropperInstance.value) {
    cropperInstance.value.destroy();
    cropperInstance.value = null;
  }
});

const openCropperForFile = (file: File): Promise<File | null> => {
  if (pendingCropResolve) {
    pendingCropResolve(null);
    pendingCropResolve = null;
  }

  pendingCropFileName = file.name || "image";
  pendingCropMime = getOutputMimeByFile(file);

  return new Promise((resolve) => {
    pendingCropResolve = resolve;
    const reader = new FileReader();

    reader.onload = (e) => {
      cropperImageUrl.value = String(e.target?.result || "");
      cropperVisible.value = true;
    };

    reader.onerror = () => {
      pendingCropResolve?.(null);
      pendingCropResolve = null;
    };

    reader.readAsDataURL(file);
  });
};

const confirmCrop = async () => {
  if (!cropperInstance.value) return;

  const cropper = cropperInstance.value;
  let canvas: HTMLCanvasElement | null = null;

  if (typeof cropper.getCroppedCanvas === "function") {
    canvas = cropper.getCroppedCanvas();
  } else if (typeof cropper.getCropperSelection === "function") {
    const selection = cropper.getCropperSelection();
    if (selection?.$toCanvas) {
      canvas = await selection.$toCanvas();
    }
  }

  if (!canvas) {
    pendingCropResolve?.(null);
    pendingCropResolve = null;
    closeCropper();
    return;
  }

  canvas.toBlob(
    (blob) => {
      if (!blob) {
        pendingCropResolve?.(null);
        pendingCropResolve = null;
        closeCropper();
        return;
      }

      const fileName = buildCroppedFileName(pendingCropFileName, pendingCropMime);
      const croppedFile = new File([blob], fileName, { type: pendingCropMime });

      pendingCropResolve?.(croppedFile);
      pendingCropResolve = null;
      closeCropper();
    },
    pendingCropMime,
    0.92
  );
};

const cancelCrop = () => {
  pendingCropResolve?.(null);
  pendingCropResolve = null;
  closeCropper();
};

const normalizeImageAlignment = (value: any): "left" | "center" | "right" => {
  const alignment = String(value || "").toLowerCase();
  if (alignment === "left" || alignment === "right") return alignment;
  if (alignment === "center") return "center";
  return "left";
};

const IMAGE_META_HASH_PREFIX = "sgimg:";

const parseImageMetaBool = (value: unknown): boolean | null => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!normalized) return null;
  if (normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on") return true;
  if (normalized === "0" || normalized === "false" || normalized === "no" || normalized === "off") return false;
  return null;
};

const parseImageMetaFromUrl = (rawUrl: string) => {
  const emptyMeta = {
    cleanUrl: String(rawUrl || ""),
    alignment: null as "left" | "center" | "right" | null,
    stretched: null as boolean | null,
    wrapped: null as boolean | null,
  };

  const url = String(rawUrl || "");
  if (!url) return emptyMeta;

  const hashIndex = url.indexOf("#");
  if (hashIndex < 0) return emptyMeta;

  const base = url.slice(0, hashIndex);
  const hash = url.slice(hashIndex + 1);
  if (!hash.startsWith(IMAGE_META_HASH_PREFIX)) return emptyMeta;

  const params = new URLSearchParams(hash.slice(IMAGE_META_HASH_PREFIX.length));
  const rawAlignment = String(params.get("a") || "").toLowerCase();
  const alignment =
    rawAlignment === "left" || rawAlignment === "center" || rawAlignment === "right"
      ? (rawAlignment as "left" | "center" | "right")
      : null;

  return {
    cleanUrl: base,
    alignment,
    stretched: parseImageMetaBool(params.get("s")),
    wrapped: parseImageMetaBool(params.get("w")),
  };
};

const appendImageMetaToUrl = (
  rawUrl: string,
  meta: { alignment: "left" | "center" | "right"; stretched: boolean; wrapped: boolean }
) => {
  const url = String(rawUrl || "");
  if (!url) return "";

  const hashIndex = url.indexOf("#");
  if (hashIndex >= 0) {
    const hash = url.slice(hashIndex + 1);
    if (hash && !hash.startsWith(IMAGE_META_HASH_PREFIX)) {
      return url;
    }
  }

  const base = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  const params = new URLSearchParams();
  params.set("a", meta.alignment);
  params.set("s", meta.stretched ? "1" : "0");
  params.set("w", meta.wrapped ? "1" : "0");
  return `${base}#${IMAGE_META_HASH_PREFIX}${params.toString()}`;
};

const normalizeImageUrlKey = (rawUrl: string) => {
  const parsed = parseImageMetaFromUrl(rawUrl);
  const cleanUrl = String(parsed.cleanUrl || rawUrl || "").trim();
  if (!cleanUrl) return "";

  if (!process.client) return cleanUrl;

  try {
    const url = new URL(cleanUrl, window.location.origin);
    if (url.origin === window.location.origin) {
      return `${url.pathname}${url.search}`;
    }
    return `${url.origin}${url.pathname}${url.search}`;
  } catch {
    return cleanUrl;
  }
};

const setImageWrappedByUrl = (rawUrl: string, wrapped: boolean) => {
  const key = normalizeImageUrlKey(rawUrl);
  if (!key) return;
  imageWrappedByImageUrl.set(key, !!wrapped);
};

const getImageWrappedByUrl = (rawUrl: string): boolean | null => {
  const key = normalizeImageUrlKey(rawUrl);
  if (!key) return null;
  if (!imageWrappedByImageUrl.has(key)) return null;
  return !!imageWrappedByImageUrl.get(key);
};

const readImageMetaFromStyle = (el: HTMLElement) => {
  const meta = {
    alignment: null as "left" | "center" | "right" | null,
    stretched: null as boolean | null,
    wrapped: null as boolean | null,
  };

  const style = String(el.getAttribute("style") || "");
  if (!style) return meta;

  const alignmentMatch = style.match(/--sg-img-align\s*:\s*(left|center|right)/i);
  if (alignmentMatch) {
    meta.alignment = normalizeImageAlignment(alignmentMatch[1]);
  }

  const stretchedMatch = style.match(/--sg-img-stretched\s*:\s*([^;]+)/i);
  if (stretchedMatch) {
    meta.stretched = parseImageMetaBool(stretchedMatch[1]);
  }

  const wrappedMatch = style.match(/--sg-img-wrapped\s*:\s*([^;]+)/i);
  if (wrappedMatch) {
    meta.wrapped = parseImageMetaBool(wrappedMatch[1]);
  }

  if (!meta.alignment) {
    if (/float\s*:\s*left/i.test(style)) meta.alignment = "left";
    else if (/float\s*:\s*right/i.test(style)) meta.alignment = "right";
    else if (/margin-left\s*:\s*auto/i.test(style) && /margin-right\s*:\s*auto/i.test(style)) {
      meta.alignment = "center";
    } else if (/margin-left\s*:\s*auto/i.test(style) && /margin-right\s*:\s*0(?:px)?/i.test(style)) {
      meta.alignment = "right";
    } else if (/margin-left\s*:\s*0(?:px)?/i.test(style) && /margin-right\s*:\s*auto/i.test(style)) {
      meta.alignment = "left";
    }
  }

  if (meta.stretched == null) {
    if (/max-width\s*:\s*100%/i.test(style) && /width\s*:\s*100%/i.test(style)) {
      meta.stretched = true;
    }
  }

  if (meta.wrapped == null) {
    if (/float\s*:\s*(left|right)/i.test(style)) {
      meta.wrapped = true;
    }
  }

  return meta;
};

const readImageMetaFromDataAttrs = (el: HTMLElement) => {
  const meta = {
    alignment: null as "left" | "center" | "right" | null,
    stretched: null as boolean | null,
    wrapped: null as boolean | null,
  };

  const rawAlignment = String(el.getAttribute("data-img-align") || "").toLowerCase();
  if (rawAlignment === "left" || rawAlignment === "center" || rawAlignment === "right") {
    meta.alignment = rawAlignment as "left" | "center" | "right";
  }

  meta.stretched = parseImageMetaBool(el.getAttribute("data-img-stretched"));
  meta.wrapped = parseImageMetaBool(el.getAttribute("data-img-wrapped"));
  return meta;
};

const seedImageWrappedByUrlFromHtml = (html: string) => {
  if (!process.client) return;
  const source = String(html || "");
  if (!source.trim()) return;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(source, "text/html");

    doc.querySelectorAll("div.image-block, div.image-block-group, img").forEach((node) => {
      if (!(node instanceof HTMLElement)) return;

      const imgEl =
        node.tagName === "IMG" ? (node as HTMLImageElement) : (node.querySelector("img") as HTMLImageElement | null);
      if (!imgEl) return;

      const rawUrl = String(imgEl.getAttribute("src") || imgEl.src || "");
      if (!rawUrl) return;

      const classWrapped = node.classList.contains("image-block--wrap") || imgEl.classList.contains("image-block--wrap");
      const dataWrapped =
        parseImageMetaBool(node.getAttribute("data-img-wrapped")) ??
        parseImageMetaBool(imgEl.getAttribute("data-img-wrapped"));

      const styleWrapped = (() => {
        const nodeStyle = String(node.getAttribute("style") || "");
        const imgStyle = String(imgEl.getAttribute("style") || "");
        const nodeVar = nodeStyle.match(/--sg-img-wrapped\s*:\s*([^;]+)/i);
        if (nodeVar) return parseImageMetaBool(nodeVar[1]);
        const imgVar = imgStyle.match(/--sg-img-wrapped\s*:\s*([^;]+)/i);
        if (imgVar) return parseImageMetaBool(imgVar[1]);
        if (/float\s*:\s*(left|right)/i.test(nodeStyle) || /float\s*:\s*(left|right)/i.test(imgStyle)) return true;
        return null;
      })();

      const urlWrapped = parseImageMetaFromUrl(rawUrl).wrapped;
      const wrapped = classWrapped || dataWrapped === true || styleWrapped === true || urlWrapped === true;
      if (wrapped) {
        setImageWrappedByUrl(rawUrl, true);
      } else if (!imageWrappedByImageUrl.has(normalizeImageUrlKey(rawUrl))) {
        setImageWrappedByUrl(rawUrl, false);
      }
    });
  } catch {
  }
};

const pickImageAlignment = (...values: unknown[]): "left" | "center" | "right" => {
  for (const value of values) {
    const alignment = String(value ?? "")
      .trim()
      .toLowerCase();
    if (alignment === "left" || alignment === "center" || alignment === "right") {
      return alignment;
    }
  }
  return "left";
};

const pickImageBoolean = (...values: Array<boolean | null | undefined>) => {
  for (const value of values) {
    if (typeof value === "boolean") return value;
  }
  return false;
};

const findImageBlockById = (blocks: any[], id: string) => {
  let imageBlock: any = null;
  walkBlocks(blocks || [], (b) => {
    if (b?.id === id) imageBlock = b;
  });
  return imageBlock && imageBlock.type === "image" ? imageBlock : null;
};

const getImageBlockSnapshotById = async (id: string) => {
  if (!editorInstance || !id) return null;
  try {
    const saved = await editorInstance.save();
    return findImageBlockById(saved?.blocks || [], id);
  } catch {
    return null;
  }
};

const getWrappedStateForImageBlock = (id: string, imageBlock: any) => {
  const wrappedFromMap = imageWrappedByBlockId.has(id) ? !!imageWrappedByBlockId.get(id) : null;
  const imageUrl = String(imageBlock?.data?.file?.url || "");
  const wrappedFromUrl = getImageWrappedByUrl(imageUrl);
  const wrappedFromData =
    typeof imageBlock?.data?.wrapped === "boolean" ? !!imageBlock.data.wrapped : null;
  const wrapped = wrappedFromMap ?? wrappedFromUrl ?? wrappedFromData ?? false;
  imageWrappedByBlockId.set(id, wrapped);
  setImageWrappedByUrl(imageUrl, wrapped);
  return wrapped;
};

const seedImageWrappedMapsFromBlocks = (blocks: any[]) => {
  walkBlocks(blocks || [], (b) => {
    if (!b || b.type !== "image") return;
    const id = String(b.id || "");
    const imageUrl = String(b?.data?.file?.url || "");
    const wrappedFromMap = id && imageWrappedByBlockId.has(id) ? !!imageWrappedByBlockId.get(id) : null;
    const wrappedFromUrl = getImageWrappedByUrl(imageUrl);
    const wrappedFromData = typeof b?.data?.wrapped === "boolean" ? !!b.data.wrapped : null;
    const wrapped = wrappedFromMap ?? wrappedFromUrl ?? wrappedFromData ?? false;

    if (id) imageWrappedByBlockId.set(id, wrapped);
    setImageWrappedByUrl(imageUrl, wrapped);
    b.data = {
      ...(b.data || {}),
      wrapped,
    };
  });
};

const mutateImageBlockById = async (
  id: string,
  mutator: (imageBlock: any) => { delete?: boolean } | void
) => {
  if (!editorInstance || !id) return false;

  try {
    const saved = await editorInstance.save();
    const blocks = saved?.blocks || [];
    let found = false;
    let deleted = false;

    const mutateInBlocks = (items: any[]): boolean => {
      for (let i = 0; i < (items || []).length; i++) {
        const block = items[i];
        if (!block) continue;

        if (String(block.id || "") === id && block.type === "image") {
          found = true;
          const action = mutator(block) || {};
          if (action.delete) {
            items.splice(i, 1);
            deleted = true;
          }
          return true;
        }

        if (block.type === "columns" && Array.isArray(block.data?.cols)) {
          for (const col of block.data.cols) {
            if (Array.isArray(col?.blocks) && mutateInBlocks(col.blocks)) {
              return true;
            }
          }
        }
      }
      return false;
    };

    mutateInBlocks(blocks);
    if (!found) return false;

    seedImageWrappedMapsFromBlocks(blocks);
    await editorInstance.blocks.render({ blocks });

    const patched = patchImageWrappedMetaBeforeExport(
      patchOrderedListMetaBeforeExport(saved)
    );
    const html = editorInstance.htmlParser.parse(patched).join("");
    emit("export-html", html);

    if (deleted) {
      imageWrappedByBlockId.delete(id);
      clearActiveImageState();
    } else {
      activeImageBlockId.value = id;
      await syncActiveImageStateById(id);
      nextTick(() => updateImageControlsPosition());
    }

    return true;
  } catch {
    return false;
  }
};

const clearActiveImageState = () => {
  activeImageBlockId.value = null;
  activeImageAlignment.value = "left";
  activeImageStretched.value = false;
  activeImageWrapped.value = false;
  activeImageBlockEl.value = null;
  imageControlsStyle.value = {};
};

const updateImageControlsPosition = () => {
  if (!activeImageBlockId.value) return;
  if (!editorWrapper.value || !activeImageBlockEl.value) return;

  const wrapperRect = editorWrapper.value.getBoundingClientRect();
  const blockRect = activeImageBlockEl.value.getBoundingClientRect();
  const controlsWidth = imageControlsEl.value?.offsetWidth || 340;
  const controlsHeight = imageControlsEl.value?.offsetHeight || 40;

  let top = blockRect.top - wrapperRect.top - controlsHeight - 8;
  if (top < 4) {
    top = blockRect.bottom - wrapperRect.top + 8;
  }

  let left = blockRect.left - wrapperRect.left;
  left = Math.max(6, Math.min(left, wrapperRect.width - controlsWidth - 6));

  imageControlsStyle.value = {
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`,
  };
};

const syncActiveImageStateById = async (id: string) => {
  if (!editorInstance || !id) {
    clearActiveImageState();
    return;
  }

  try {
    const imageBlock = await getImageBlockSnapshotById(id);

    if (!imageBlock || imageBlock.type !== "image") {
      clearActiveImageState();
      return;
    }

    activeImageBlockId.value = id;
    if (editor.value) {
      const blockEl = editor.value.querySelector(`.ce-block[data-id="${id}"]`) as HTMLElement | null;
      if (blockEl) activeImageBlockEl.value = blockEl;
    }
    const alignment = normalizeImageAlignment(imageBlock?.tunes?.alignmentTune?.alignment);
    const stretched = !!imageBlock?.data?.stretched;
    const wrapped = getWrappedStateForImageBlock(id, imageBlock);

    activeImageAlignment.value = alignment;
    activeImageStretched.value = stretched;
    activeImageWrapped.value = wrapped;
    nextTick(() => updateImageControlsPosition());
  } catch {
    clearActiveImageState();
  }
};

const setActiveImageAlignment = async (alignment: "left" | "center" | "right") => {
  const id = activeImageBlockId.value;
  if (!id || !editorInstance) return;

  await mutateImageBlockById(id, (imageBlock) => {
    const currentWrapped = getWrappedStateForImageBlock(id, imageBlock);
    imageBlock.data = {
      ...(imageBlock?.data || {}),
      stretched: !!imageBlock?.data?.stretched,
      wrapped: currentWrapped,
    };
    imageBlock.tunes = {
      ...(imageBlock?.tunes || {}),
      alignmentTune: { ...(imageBlock?.tunes?.alignmentTune || {}), alignment },
    };
    imageWrappedByBlockId.set(id, currentWrapped);
    setImageWrappedByUrl(String(imageBlock?.data?.file?.url || ""), currentWrapped);
  });
};

const toggleActiveImageStretched = async () => {
  const id = activeImageBlockId.value;
  if (!id || !editorInstance) return;

  await mutateImageBlockById(id, (imageBlock) => {
    const currentWrapped = getWrappedStateForImageBlock(id, imageBlock);
    const currentStretched = !!imageBlock?.data?.stretched;
    const nextStretched = !currentStretched;
    const currentAlignment = normalizeImageAlignment(
      imageBlock?.tunes?.alignmentTune?.alignment || activeImageAlignment.value
    );

    imageBlock.data = {
      ...(imageBlock?.data || {}),
      stretched: nextStretched,
      wrapped: currentWrapped,
    };
    imageBlock.tunes = {
      ...(imageBlock?.tunes || {}),
      alignmentTune: { ...(imageBlock?.tunes?.alignmentTune || {}), alignment: currentAlignment },
    };

    imageWrappedByBlockId.set(id, currentWrapped);
    setImageWrappedByUrl(String(imageBlock?.data?.file?.url || ""), currentWrapped);
  });
};

const toggleActiveImageWrapped = async () => {
  const id = activeImageBlockId.value;
  if (!id || !editorInstance) return;

  await mutateImageBlockById(id, (imageBlock) => {
    const currentWrapped = getWrappedStateForImageBlock(id, imageBlock);
    const nextWrapped = !currentWrapped;
    const currentAlignment = normalizeImageAlignment(
      imageBlock?.tunes?.alignmentTune?.alignment || activeImageAlignment.value
    );

    imageBlock.data = {
      ...(imageBlock?.data || {}),
      stretched: !!imageBlock?.data?.stretched,
      wrapped: nextWrapped,
    };
    imageBlock.tunes = {
      ...(imageBlock?.tunes || {}),
      alignmentTune: { ...(imageBlock?.tunes?.alignmentTune || {}), alignment: currentAlignment },
    };

    imageWrappedByBlockId.set(id, nextWrapped);
    setImageWrappedByUrl(String(imageBlock?.data?.file?.url || ""), nextWrapped);
  });
};

const removeActiveImageBlock = async () => {
  const id = activeImageBlockId.value;
  if (!id || !editorInstance) return;
  await mutateImageBlockById(id, () => ({ delete: true }));
};

const handleImageSelection = (e: Event) => {
  const target = e.target as HTMLElement | null;
  if (!target || !editor.value || !editorInstance) return;
  if (!editor.value.contains(target)) return;

  const blockEl = target.closest(".ce-block") as HTMLElement | null;
  if (!blockEl) {
    clearActiveImageState();
    return;
  }

  const domId = String(blockEl.getAttribute("data-id") || "");
  const apiId = String(editorInstance.blocks?.getBlockByElement?.(blockEl)?.id || "");
  const id = domId || apiId;
  if (!id) {
    clearActiveImageState();
    return;
  }

  if (activeImageBlockId.value !== id) {
    activeImageBlockId.value = id;
  }
  activeImageBlockEl.value = blockEl;
  syncActiveImageStateById(id);
};

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

const getOrderedListDomEl = (blockEl: HTMLElement): HTMLElement | null => {
  const cdx = blockEl.querySelector(".cdx-list--ordered") as HTMLElement | null;
  if (cdx) return cdx;

  const ol = blockEl.querySelector("ol") as HTMLElement | null;
  if (ol) return ol;

  return null;
};

const applyStartToDomList = (blockId: string, start: number) => {
  const root = editor.value;
  if (!root) return;

  const blockEl = root.querySelector(`.ce-block[data-id="${blockId}"]`) as HTMLElement | null;
  if (!blockEl) return;

  const listEl = getOrderedListDomEl(blockEl);
  if (!listEl) return;

  const desiredStart = Number.isFinite(start) ? start : 1;
  const resetValue = Math.max(0, desiredStart - 1);

  if (listEl.tagName === "OL") {
    const ol = listEl as HTMLOListElement;
    if (desiredStart > 1) ol.setAttribute("start", String(desiredStart));
    else ol.removeAttribute("start");
  }

  const computed = window.getComputedStyle(listEl);
  const cr = (computed.counterReset || "").trim();
  const first = cr && cr !== "none" ? cr.split(",")[0].trim() : "";
  const counterName = first ? first.split(/\s+/)[0] : "item";

  listEl.style.counterReset = `${counterName} ${resetValue}`;
};

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

const patchImageWrappedMetaBeforeExport = (data: any) => {
  if (!data?.blocks?.length) return data;

  walkBlocks(data.blocks, (b) => {
    if (!b || b.type !== "image") return;
    const id = String(b.id || "");
    if (!id) return;

    const wrappedFromMap = imageWrappedByBlockId.has(id) ? !!imageWrappedByBlockId.get(id) : null;
    const imageUrl = String(b?.data?.file?.url || "");
    const wrappedFromUrl = getImageWrappedByUrl(imageUrl);
    const wrappedFromData = typeof b?.data?.wrapped === "boolean" ? !!b.data.wrapped : null;
    const wrapped = wrappedFromMap ?? wrappedFromUrl ?? wrappedFromData ?? false;
    imageWrappedByBlockId.set(id, wrapped);
    setImageWrappedByUrl(imageUrl, wrapped);

    b.data = {
      ...(b.data || {}),
      wrapped,
    };
  });

  return data;
};

onMounted(async () => {
  const token = localStorage.getItem("authToken");
  if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  if (!process.client) return;

  const { default: EditorJS } = await import("@editorjs/editorjs");
  const { default: Paragraph } = await import("@editorjs/paragraph");
  const { default: Header } = await import("@editorjs/header");
  const { default: List } = await import("@editorjs/list");
  const { default: Table } = await import("@editorjs/table");
  const { default: ImageTool } = await import("@editorjs/image");
  const { default: Columns } = await import("@calumk/editorjs-columns");
  const { default: ImageGallery } = await import("@kiberpro/editorjs-gallery");
  const { default: AlignmentTune } = await import("editor-js-alignment-tune");
  const { default: EditorJSHTML } = await import("editorjs-html");

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
  const normalizeAlignment = (value: any, fallback = "left") => {
    const alignment = String(value || "").toLowerCase();
    return ["left", "center", "right", "justify"].includes(alignment) ? alignment : fallback;
  };
  const getBlockAlignment = (block: any, fallback = "left") =>
      normalizeAlignment(block?.tunes?.alignmentTune?.alignment, fallback);

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

  const htmlParser = EditorJSHTML({
    paragraph: (block: any) => {
      const alignment = getBlockAlignment(block, "left");
      const text = block?.data?.text || "";
      return `<p class="align-${alignment}">${text}</p>`;
    },

    header: (block: any) => {
      const alignment = getBlockAlignment(block, "left");
      const levelRaw = Number(block?.data?.level || 2);
      const level = Number.isFinite(levelRaw) ? Math.min(6, Math.max(1, levelRaw)) : 2;
      const text = block?.data?.text || "";
      return `<h${level} class="align-${alignment}">${text}</h${level}>`;
    },

    list: (block: any) => {
      const style = block?.data?.style || "unordered";
      const items = block?.data?.items || [];
      const meta = block?.data?.meta || {};
      const alignment = getBlockAlignment(block, "left");

      if (style !== "ordered") {
        const classes = [`align-${alignment}`];
        if (style === "checklist") classes.push("checklist");
        return `<ul class="${classes.join(" ")}">${renderListItems(items, style)}</ul>`;
      }

      const startRaw = meta.start ?? block?.data?.start ?? 1;
      const start = Number.isFinite(Number(startRaw)) ? Number(startRaw) : 1;

      const counterTypeRaw = meta.counterType ?? block?.data?.counterType ?? "numeric";
      const counterType = String(counterTypeRaw || "numeric");
      const typeAttr = counterTypeToOlType(counterType);

      const startAttr = start !== 1 ? ` start="${start}"` : "";
      const type = typeAttr && typeAttr !== "1" ? ` type="${typeAttr}"` : "";
      const cls = ` class="align-${alignment}"`;

      return `<ol${startAttr}${type}${cls}>${renderListItems(items, "ordered")}</ol>`;
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

    image: (block: any) => {
      const blockId = String(block?.id || "");
      const alignment = getBlockAlignment(block, "left");
      const stretched = !!block?.data?.stretched;
      const wrappedFromMap = blockId && imageWrappedByBlockId.has(blockId) ? !!imageWrappedByBlockId.get(blockId) : null;
      const rawUrl = String(block?.data?.file?.url || "");
      const wrappedFromUrl = getImageWrappedByUrl(rawUrl);
      const wrappedFromData = typeof block?.data?.wrapped === "boolean" ? !!block.data.wrapped : null;
      const wrapped = wrappedFromMap ?? wrappedFromUrl ?? wrappedFromData ?? false;
      if (blockId) imageWrappedByBlockId.set(blockId, wrapped);
      const classNames = ["image-block", `image-block--align-${alignment}`];
      if (stretched) classNames.push("image-block--stretched");
      if (wrapped && !stretched) {
        classNames.push("image-block--wrap");
      }
      const dataAttrs = `data-img-align="${alignment}" data-img-stretched="${stretched ? "1" : "0"}" data-img-wrapped="${wrapped ? "1" : "0"}"`;
      const styleParts = [
        `--sg-img-align:${alignment}`,
        `--sg-img-stretched:${stretched ? 1 : 0}`,
        `--sg-img-wrapped:${wrapped ? 1 : 0}`,
      ];

      if (wrapped && !stretched && (alignment === "left" || alignment === "right")) {
        styleParts.push("width:min(470px,48%)");
        styleParts.push("max-width:min(470px,48%)");
        if (alignment === "left") {
          styleParts.push("float:left");
          styleParts.push("margin:var(--editor-block-gap,15px) 18px 12px 0");
        } else {
          styleParts.push("float:right");
          styleParts.push("margin:var(--editor-block-gap,15px) 0 12px 18px");
        }
      } else {
        styleParts.push("float:none");
        if (stretched) {
          styleParts.push("width:100%");
          styleParts.push("max-width:100%");
        } else {
          styleParts.push("width:100%");
          styleParts.push("max-width:470px");
          if (alignment === "left") {
            styleParts.push("margin-left:0");
            styleParts.push("margin-right:auto");
          } else if (alignment === "right") {
            styleParts.push("margin-left:auto");
            styleParts.push("margin-right:0");
          } else {
            styleParts.push("margin-left:auto");
            styleParts.push("margin-right:auto");
          }
        }
      }

      const metaStyle = `${styleParts.join(";")};`;
      setImageWrappedByUrl(rawUrl, wrapped);
      const imageUrl = appendImageMetaToUrl(rawUrl, { alignment, stretched, wrapped });
      return `<div class="${classNames.join(" ")}" ${dataAttrs} style="${metaStyle}"><img src="${imageUrl}" alt="" ${dataAttrs} /></div>`;
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

      const columnsClass = block.data.cols.length === 2 ? "columns columns--two" : "columns";
      return `<div class="${columnsClass}">${columnsHtml}</div>`;
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

  const getUploadImageUrl = () => {
    const base = axios.defaults.baseURL;
    if (base) return `${String(base).replace(/\/$/, "")}/upload-image`;
    return "/api/upload-image";
  };

  const uploadImageUrl = getUploadImageUrl();

  const uploadImage = async (file: File) => {
    let fileToUpload = file;
    if (!shouldSkipCrop(file)) {
      const croppedFile = await openCropperForFile(file);
      if (!croppedFile) return { success: 0 };
      fileToUpload = croppedFile;
    }

    const token = localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("image", fileToUpload);

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
    paragraph: { class: Paragraph, inlineToolbar: true, tunes: ["alignmentTune"] },
    header: { class: Header, inlineToolbar: ["bold", "italic"], tunes: ["alignmentTune"] },
    list: { class: List, inlineToolbar: true, tunes: ["alignmentTune"] },
    image: {
      class: ImageTool,
      tunes: ["alignmentTune"],
      config: {
        endpoints: { byFile: uploadImageUrl },
        uploader: { uploadByFile: uploadImage },
        captionPlaceholder: "",
        caption: false,
      },
    },
    alignmentTune: {
      class: AlignmentTune,
      config: {
        default: "left",
        blocks: {
          image: { default: "left", availableAlignments: ["left", "center", "right"] },
        },
      },
    },
  };

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

  const collectImageWrappedSeeds = (blocks: any[]) => {
    const seeds: boolean[] = [];
    walkBlocks(blocks, (b) => {
      if (b?.type !== "image") return;
      seeds.push(!!b?.data?.wrapped);
    });
    return seeds;
  };

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

        requestAnimationFrame(() => applyStartToDomList(b.id, seed));
      });
    } catch {
    }
  };

  const applyImageWrappedSeedsToRealBlockIds = async (seeds: boolean[]) => {
    if (!seeds.length) return;

    try {
      const saved = await editorInstance.save();

      let i = 0;
      walkBlocks(saved.blocks || [], (b) => {
        if (b?.type !== "image") return;
        const seed = seeds[i++];
        if (seed == null) return;
        const blockId = String(b.id || "");
        const wrapped = !!seed;
        imageWrappedByBlockId.set(blockId, wrapped);
        setImageWrappedByUrl(String(b?.data?.file?.url || ""), wrapped);
      });
    } catch {
    }
  };

  editorInstance = new EditorJS({
    holder: editor.value!,
    tools: {
      paragraph: { class: Paragraph, inlineToolbar: true, tunes: ["alignmentTune"] },
      header: { class: Header, inlineToolbar: ["bold", "italic"], tunes: ["alignmentTune"] },
      list: { class: List, inlineToolbar: true, tunes: ["alignmentTune"] },

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
            paragraph: { default: "left", availableAlignments: ["left", "center", "right", "justify"] },
            header: { default: "left", availableAlignments: ["left", "center", "right"] },
            list: { default: "left", availableAlignments: ["left", "center", "right"] },
            table: { default: "left", availableAlignments: ["left", "center", "right"] },
            image: { default: "left", availableAlignments: ["left", "center", "right"] },
          },
        },
      },

      image: {
        class: ImageTool,
        tunes: ["alignmentTune"],
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
      imageWrappedByBlockId.clear();
      imageWrappedByImageUrl.clear();
      if (!props.initialHtml) return;
      seedImageWrappedByUrlFromHtml(props.initialHtml);

      let blocks: any[] | null = null;
      try {
        blocks = parseHtmlToEditorBlocks(props.initialHtml);
      } catch {
        blocks = null;
      }

      const orderedSeeds = blocks ? collectOrderedSeeds(blocks) : [];
      const imageWrappedSeeds = blocks ? collectImageWrappedSeeds(blocks) : [];

      try {
        if (blocks) {
          await editorInstance.blocks.render({ blocks });
        } else {
          editorInstance.blocks.renderFromHTML(props.initialHtml);
        }
      } finally {
        setTimeout(async () => {
          await applyOrderedSeedsToRealBlockIds(orderedSeeds);
          await applyImageWrappedSeedsToRealBlockIds(imageWrappedSeeds);
        }, 0);
      }
    },

    onChange: async () => {
      const data = await editorInstance.save();

      const patched = patchImageWrappedMetaBeforeExport(
        patchOrderedListMetaBeforeExport(data)
      );

      const html = editorInstance.htmlParser.parse(patched).join("");
      emit("export-html", html);

      if (activeImageBlockId.value) {
        await syncActiveImageStateById(activeImageBlockId.value);
        nextTick(() => updateImageControlsPosition());
      }
    },
  });

  editorInstance.htmlParser = htmlParser;

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

  imageSelectionListener = handleImageSelection;
  document.addEventListener("click", imageSelectionListener, true);
  document.addEventListener("keyup", imageSelectionListener, true);

  imageControlsLayoutListener = () => {
    updateImageControlsPosition();
  };
  window.addEventListener("resize", imageControlsLayoutListener, { passive: true });
  window.addEventListener("scroll", imageControlsLayoutListener, true);

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

  const getAlignmentFromElement = (el: HTMLElement, fallback = "left") => {
    if (
        el.classList.contains("align-center") ||
        el.classList.contains("image-block--align-center") ||
        el.classList.contains("cdx-alignment-tune--center")
    ) {
      return "center";
    }
    if (
        el.classList.contains("align-right") ||
        el.classList.contains("image-block--align-right") ||
        el.classList.contains("cdx-alignment-tune--right")
    ) {
      return "right";
    }
    if (
        el.classList.contains("align-justify") ||
        el.classList.contains("image-block--align-justify") ||
        el.classList.contains("cdx-alignment-tune--justify")
    ) {
      return "justify";
    }
    return fallback;
  };

  const getAlignmentTuneForElement = (el: HTMLElement, fallback = "left") => ({
    alignmentTune: { alignment: getAlignmentFromElement(el, fallback) },
  });

  const buildImageBlock = (containerEl: HTMLElement, imgEl: HTMLImageElement) => {
    const srcAttr = imgEl.getAttribute("src") || imgEl.src || "";
    const urlMeta = parseImageMetaFromUrl(srcAttr);
    const hasMetaInSrc = urlMeta.cleanUrl !== srcAttr;
    const imageUrl = hasMetaInSrc ? urlMeta.cleanUrl || imgEl.src || srcAttr || "" : imgEl.src || srcAttr || "";
    const wrapperDataMeta = readImageMetaFromDataAttrs(containerEl);
    const wrapperStyleMeta = readImageMetaFromStyle(containerEl);
    const imageDataMeta = readImageMetaFromDataAttrs(imgEl);
    const imageStyleMeta = readImageMetaFromStyle(imgEl);

    const alignment = pickImageAlignment(
      getAlignmentFromElement(containerEl, ""),
      wrapperDataMeta.alignment,
      wrapperStyleMeta.alignment,
      imageDataMeta.alignment,
      imageStyleMeta.alignment,
      urlMeta.alignment,
      "left"
    );

    const stretched = pickImageBoolean(
      containerEl.classList.contains("image-block--stretched") ? true : null,
      wrapperDataMeta.stretched,
      wrapperStyleMeta.stretched,
      imageDataMeta.stretched,
      imageStyleMeta.stretched,
      urlMeta.stretched,
      false
    );

    const wrapped = pickImageBoolean(
      containerEl.classList.contains("image-block--wrap") ? true : null,
      wrapperDataMeta.wrapped,
      wrapperStyleMeta.wrapped,
      imageDataMeta.wrapped,
      imageStyleMeta.wrapped,
      urlMeta.wrapped,
      false
    );
    setImageWrappedByUrl(imageUrl, wrapped);

    return {
      type: "image",
      data: {
        file: { url: imageUrl },
        stretched,
        wrapped,
      },
      tunes: { alignmentTune: { alignment } },
    };
  };

  doc.body.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      blocks.push({ type: "paragraph", data: { text: node.textContent.trim() } });
      return;
    }

    if (!(node instanceof HTMLElement)) return;

    if (node.tagName === "P") {
      blocks.push({
        type: "paragraph",
        data: { text: node.innerHTML },
        tunes: getAlignmentTuneForElement(node),
      });
      return;
    }

    if (/^H[1-6]$/.test(node.tagName)) {
      const level = parseInt(node.tagName.slice(1), 10) || 2;
      blocks.push({
        type: "header",
        data: { text: node.innerHTML, level },
        tunes: getAlignmentTuneForElement(node),
      });
      return;
    }

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

        blocks.push({
          type: "list",
          data: { style: "checklist", meta: {}, items },
          tunes: getAlignmentTuneForElement(node),
        });
      } else {
        const items = Array.from(node.querySelectorAll(":scope > li")).map((li) => {
          const liEl = li as HTMLElement;
          stripDirectNestedLists(liEl);
          const content = liEl.innerHTML.trim();
          return { content, text: content, items: [], meta: {} };
        });

        blocks.push({
          type: "list",
          data: { style: "unordered", meta: {}, items },
          tunes: getAlignmentTuneForElement(node),
        });
      }
      return;
    }

    if (node.tagName === "OL") {
      const start = parseInt(node.getAttribute("start") || "1", 10) || 1;
      const typeAttr = (node.getAttribute("type") || "1").trim();
      const counterType = olTypeToCounterType(typeAttr);

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
        tunes: getAlignmentTuneForElement(node),
      });

      return;
    }

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

    if (
        node.tagName === "DIV" &&
        (node.classList.contains("image-block") || node.classList.contains("image-block-group"))
    ) {
      const img = node.querySelector("img");
      if (img) {
        blocks.push(buildImageBlock(node, img as HTMLImageElement));
      }
      return;
    }

    if (
        node.tagName === "DIV" &&
        node.children.length === 1 &&
        node.firstElementChild?.tagName === "IMG"
    ) {
      blocks.push(buildImageBlock(node, node.firstElementChild as HTMLImageElement));
      return;
    }

    if (node.tagName === "IMG") {
      blocks.push(buildImageBlock(node, node as HTMLImageElement));
      return;
    }

    if (node.tagName === "DIV" && node.classList.contains("columns")) {
      const columns = Array.from(node.querySelectorAll(":scope > .column")).map((column) => {
        const blocksInColumn = parseHtmlToEditorBlocks((column as HTMLElement).innerHTML);
        return { blocks: blocksInColumn };
      });

      blocks.push({ type: "columns", data: { cols: columns } });
      return;
    }

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
  if (pendingCropResolve) {
    pendingCropResolve(null);
    pendingCropResolve = null;
  }
  if (cropperInstance.value) {
    cropperInstance.value.destroy();
    cropperInstance.value = null;
  }
  cropperVisible.value = false;
  cropperImageUrl.value = null;

  if (popoverObserver) {
    popoverObserver.disconnect();
    popoverObserver = null;
  }
  if (inputListener) {
    document.removeEventListener("input", inputListener, true);
    document.removeEventListener("change", inputListener, true);
    inputListener = null;
  }
  if (imageSelectionListener) {
    document.removeEventListener("click", imageSelectionListener, true);
    document.removeEventListener("keyup", imageSelectionListener, true);
    imageSelectionListener = null;
  }
  if (imageControlsLayoutListener) {
    window.removeEventListener("resize", imageControlsLayoutListener);
    window.removeEventListener("scroll", imageControlsLayoutListener, true);
    imageControlsLayoutListener = null;
  }
  imageWrappedByBlockId.clear();
  imageWrappedByImageUrl.clear();

  editorInstance?.destroy();
  editorInstance = null;
});
</script>

<style scoped lang="scss">
.editor-wrapper {
  position: relative;
}

.image-controls {
  position: absolute;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;
  padding: 10px;
  border: 1px solid rgba(239, 127, 26, 0.38);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255, 247, 239, 0.96), rgba(255, 255, 255, 0.98));
  box-shadow: 0 12px 28px rgba(34, 34, 34, 0.12), 0 2px 0 rgba(239, 127, 26, 0.08);
  max-width: min(620px, calc(100% - 12px));
  color: #222;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 7px;
    min-height: 18px;
  }

  &__mark {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #ef7f1a;
    box-shadow: 0 0 0 4px rgba(239, 127, 26, 0.14);
    flex: 0 0 auto;
  }

  &__label {
    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    letter-spacing: 0;
    text-transform: uppercase;
    color: #4b4b4b;
  }

  &__body {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  &__group {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 3px;
    border: 1px solid rgba(239, 127, 26, 0.18);
    border-radius: 7px;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  }

  &__btn {
    position: relative;
    border: 1px solid transparent;
    border-radius: 5px;
    background: transparent;
    padding: 7px 11px;
    font-size: 13px;
    line-height: 1.1;
    font-weight: 500;
    color: #353535;
    cursor: pointer;
    transition: background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease, box-shadow 0.16s ease;

    &:hover {
      border-color: rgba(239, 127, 26, 0.24);
      background: #fff8f1;
      color: #1f1f1f;
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px rgba(239, 127, 26, 0.2);
    }

    &.active {
      border-color: #ef7f1a;
      color: #fff;
      background: #ef7f1a;
      box-shadow: 0 5px 12px rgba(239, 127, 26, 0.24);
    }

    &--danger {
      border-color: rgba(202, 58, 58, 0.22);
      color: #b32626;
      background: #fff7f5;

      &:hover {
        border-color: rgba(202, 58, 58, 0.38);
        color: #931b1b;
        background: #fff0ec;
      }
    }
  }

  @media screen and (max-width: 575.98px) {
    width: calc(100% - 12px);

    &__body,
    &__group {
      width: 100%;
    }

    &__group {
      justify-content: stretch;
    }

    &__btn {
      flex: 1 1 auto;
      padding-right: 8px;
      padding-left: 8px;
    }
  }
}

.editor {
  border: 1px solid #ddd;
  padding: 10px;
  min-height: 150px;
  border-radius: 8px;
  background-color: #fff;
  overflow: visible;
}

.cropper-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.cropper-modal__body :deep(cropper-canvas) {
  display: block;
  width: 100%;
  height: 100%;
}

.cropper-modal {
  width: min(900px, 100%);
  background: #f5f5f5;
  border-radius: 12px;
  padding: 16px;

  &__title {
    font-size: 18px;
    margin-bottom: 10px;
  }

  &__body {
    height: min(70vh, 420px);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #fff;
    border-radius: 10px;
  }

  &__image {
    max-width: 100%;
    display: block;
  }

  &__actions {
    margin-top: 16px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
}
</style>
