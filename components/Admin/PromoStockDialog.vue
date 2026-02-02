<script setup>
import { computed, ref, watch, nextTick, onBeforeUnmount } from "vue";
import axios from "axios";

const props = defineProps({
  modelValue: { type: Boolean, default: false }, // v-model visible
  mode: { type: String, default: "create" }, // "create" | "edit"
  promoId: { type: [Number, String, null], default: null }, // для edit
  allProducts: { type: Array, default: () => [] }, // товары для select
  seed: { type: Object, default: null }, // если где-то ещё используешь "seed-дубликат"
});

const emit = defineEmits(["update:modelValue", "saved"]);

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const activeTab = ref("Главная");
const isLoading = ref(false);

const errors = ref({
  title: false,
  description: false,
  image: false,
  start: false,
  end: false,
});

// form state
const currentId = ref(null);
const title = ref("");
const description = ref("");
const start = ref("");
const end = ref("");
const isArchived = ref(false);

const imageFile = ref(null); // File
const imagePreview = ref(null); // url
const fileInputRef = ref(null);

const imageAutoError = ref(false);

// products state
const linkedProducts = ref([]); // [{id,name}]
const productToAdd = ref(null);
const canEditProducts = computed(() => props.mode === "edit" && !!currentId.value);

// ---- utils ----
const destroyPreviewIfBlob = (url) => {
  if (url && typeof url === "string" && url.startsWith("blob:")) {
    try { URL.revokeObjectURL(url); } catch {}
  }
};

const toProxiedStorageUrl = (url) => {
  // если есть прокси на /storage
  try {
    const u = new URL(url);
    if (u.pathname.startsWith("/storage/")) return u.pathname + u.search;
    return url;
  } catch {
    if (typeof url === "string" && url.includes("/storage/")) {
      const idx = url.indexOf("/storage/");
      return url.slice(idx);
    }
    return url;
  }
};

const urlToFile = async (url, filename = "promo-image") => {
  const proxiedUrl = toProxiedStorageUrl(url);
  const resp = await axios.get(proxiedUrl, { responseType: "blob" });
  const blob = resp.data;
  const type = blob.type || resp.headers?.["content-type"] || "image/jpeg";
  const ext = String(type).split("/")?.[1] || "jpg";
  return new File([blob], `${filename}.${ext}`, { type });
};

// ---- reset ----
const resetForm = () => {
  activeTab.value = "Главная";
  currentId.value = null;

  title.value = "";
  description.value = "";
  start.value = "";
  end.value = "";
  isArchived.value = false;

  imageFile.value = null;
  destroyPreviewIfBlob(imagePreview.value);
  imagePreview.value = null;

  if (fileInputRef.value) fileInputRef.value.value = "";

  linkedProducts.value = [];
  productToAdd.value = null;

  imageAutoError.value = false;
  errors.value = { title: false, description: false, image: false, start: false, end: false };

  // cropper cleanup
  cropperVisible.value = false;
  cropperImageUrl.value = null;
  if (cropperInstance.value) {
    cropperInstance.value.destroy();
    cropperInstance.value = null;
  }
};

// ---- cropper (как в NewsDialog) ----
const cropperVisible = ref(false);
const cropperImageUrl = ref(null);
const cropperImgEl = ref(null);
const cropperInstance = ref(null);
let CropperClass = null;

// размеры 1:1 с NewsDialog
const CROP_WIDTH = 1830;
const CROP_HEIGHT = 1704;
const ASPECT_RATIO = CROP_WIDTH / CROP_HEIGHT;

const loadCropper = async () => {
  if (CropperClass) return CropperClass;
  if (typeof window === "undefined") return null;
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
      aspectRatio: ASPECT_RATIO,
      viewMode: 1,
      autoCropArea: 0,
      responsive: true,
      movable: true,
      zoomable: true,
      scalable: false,
      background: false,

      ready() {
        const cropper = this;

        const containerData = cropper.getContainerData();
        const containerWidth = containerData.width;
        const containerHeight = containerData.height;

        let cropBoxWidth = containerWidth;
        let cropBoxHeight = cropBoxWidth / ASPECT_RATIO;

        if (cropBoxHeight > containerHeight) {
          cropBoxHeight = containerHeight;
          cropBoxWidth = cropBoxHeight * ASPECT_RATIO;
        }

        cropper.setCropBoxData({
          width: cropBoxWidth,
          height: cropBoxHeight,
          left: (containerWidth - cropBoxWidth) / 2,
          top: (containerHeight - cropBoxHeight) / 2,
        });

        const imageData = cropper.getImageData();
        const scale = Math.max(cropBoxWidth / imageData.width, cropBoxHeight / imageData.height);
        cropper.zoomTo(scale);
      },
    });
  } else if (cropperInstance.value) {
    cropperInstance.value.destroy();
    cropperInstance.value = null;
  }
});

const openCropper = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    cropperImageUrl.value = e.target?.result;
    cropperVisible.value = true;
  };
  reader.readAsDataURL(file);
};

const confirmCrop = async () => {
  if (!cropperInstance.value) return;
  const cropper = cropperInstance.value;

  let canvas = null;
  if (typeof cropper.getCroppedCanvas === "function") {
    canvas = cropper.getCroppedCanvas({ width: CROP_WIDTH, height: CROP_HEIGHT });
  } else if (typeof cropper.getCropperSelection === "function") {
    const selection = cropper.getCropperSelection();
    if (!selection?.$toCanvas) return;
    canvas = await selection.$toCanvas({ width: CROP_WIDTH, height: CROP_HEIGHT });
  }
  if (!canvas) return;

  canvas.toBlob((blob) => {
    if (!blob) return;

    const file = new File([blob], "promo-cover.png", { type: "image/png" });
    const url = URL.createObjectURL(blob);

    destroyPreviewIfBlob(imagePreview.value);
    imageFile.value = file;
    imagePreview.value = url;

    cropperVisible.value = false;
    cropperImageUrl.value = null;
  }, "image/png");
};

const cancelCrop = () => {
  cropperVisible.value = false;
  cropperImageUrl.value = null;
};

// ---- open lifecycle ----
const applySeed = async (seed) => {
  title.value = seed?.title || "";
  description.value = seed?.description || "";
  imagePreview.value = seed?.image || null;

  // если seed — обычно хотели пустые даты/архив false
  start.value = "";
  end.value = "";
  isArchived.value = false;

  linkedProducts.value = Array.isArray(seed?.products) ? seed.products : [];

  imageFile.value = null;
  imageAutoError.value = false;

  // попробуем подтянуть картинку в File (может упасть из-за CORS)
  if (seed?.image) {
    try {
      imageFile.value = await urlToFile(seed.image, "promo-duplicate");
    } catch {
      imageAutoError.value = true;
      imageFile.value = null;
    }
  }
};

const loadPromo = async (id) => {
  const { data } = await axios.get(`/promos/${id}`);
  currentId.value = data.id;

  title.value = data.title || "";
  description.value = data.description || "";
  start.value = data.start || "";
  end.value = data.end || "";
  isArchived.value = !!data.is_archived;

  imagePreview.value = data.image || null;
  imageFile.value = null;

  linkedProducts.value = Array.isArray(data.products) ? data.products : [];
};

watch(
    () => props.modelValue,
    async (open) => {
      if (!open) return;

      resetForm();

      if (props.mode === "edit" && props.promoId) {
        isLoading.value = true;
        try {
          await loadPromo(props.promoId);
        } finally {
          isLoading.value = false;
        }
        return;
      }

      // create mode
      if (props.seed) {
        isLoading.value = true;
        try {
          await applySeed(props.seed);
        } finally {
          isLoading.value = false;
        }
      }
    }
);

// ---- image handling (с cropper) ----
const handleFileChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // GIF не режем
  const isGif = file.type === "image/gif" || /\.gif$/i.test(file.name);
  if (isGif) {
    destroyPreviewIfBlob(imagePreview.value);
    imageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
    return;
  }

  openCropper(file);
};

// если seed притащил preview, но нет file — попробуем сделать file
const ensureImageFile = async () => {
  if (props.mode !== "create") return;
  if (imageFile.value) return;
  if (!imagePreview.value) return;

  imageAutoError.value = false;
  try {
    imageFile.value = await urlToFile(imagePreview.value, "promo-duplicate");
  } catch {
    imageAutoError.value = true;
    imageFile.value = null;
  }
};

// ---- validation/save ----
const validateMain = () => {
  errors.value.title = !title.value;
  errors.value.description = !description.value;
  errors.value.start = !start.value;
  errors.value.end = !end.value;

  if (props.mode === "create") {
    errors.value.image = !imageFile.value;
  } else {
    errors.value.image = false;
  }

  return !(errors.value.title || errors.value.description || errors.value.start || errors.value.end || errors.value.image);
};

const save = async () => {
  await ensureImageFile();
  if (!validateMain()) return;

  isLoading.value = true;
  try {
    const formData = new FormData();
    formData.append("title", title.value);
    formData.append("description", description.value);
    formData.append("start", start.value);
    formData.append("end", end.value);
    formData.append("is_archived", isArchived.value ? 1 : 0);

    if (props.mode === "create") {
      formData.append("image", imageFile.value);

      const resp = await axios.post(`/promos`, formData, {
        headers: {"Content-Type": "multipart/form-data"},
      });

      const newId = resp?.data?.id;

      // если create был через seed — привяжем товары (старое поведение)
      if (newId && linkedProducts.value.length) {
        for (const p of linkedProducts.value) {
          await axios.post(`/promos/${newId}/products/${p.id}`);
        }
      }

      emit("saved");
      isOpen.value = false;
      return;
    }

    // update: image optional
    if (imageFile.value) formData.append("image", imageFile.value);

    await axios.post(`/promos/${currentId.value}?_method=patch`, formData, {
      headers: {"Content-Type": "multipart/form-data"},
    });

    emit("saved");
    isOpen.value = false;
  } catch (e) {
    console.error("Ошибка сохранения акции:", e?.response?.data || e);
  } finally {
    isLoading.value = false;
  }
};

// ---- products actions (edit only) ----
const addProduct = async () => {
  if (!canEditProducts.value) return;
  if (!productToAdd.value) return;

  isLoading.value = true;
  try {
    await axios.post(`/promos/${currentId.value}/products/${productToAdd.value}`);
    await loadPromo(currentId.value);
    productToAdd.value = null;
  } catch (e) {
    console.error("Ошибка добавления товара:", e?.response?.data || e);
  } finally {
    isLoading.value = false;
  }
};

const removeProduct = async (productId) => {
  if (!canEditProducts.value) return;

  isLoading.value = true;
  try {
    await axios.delete(`/promos/${currentId.value}/products/${productId}`);
    await loadPromo(currentId.value);
  } catch (e) {
    console.error("Ошибка удаления товара:", e?.response?.data || e);
  } finally {
    isLoading.value = false;
  }
};

const close = () => {
  isOpen.value = false;
};

// cleanup
onBeforeUnmount(() => {
  destroyPreviewIfBlob(imagePreview.value);
  if (cropperInstance.value) {
    cropperInstance.value.destroy();
    cropperInstance.value = null;
  }
});
</script>

<template>
  <div class="admin__dialog" v-if="isOpen" @click="close">
    <div class="admin__dialog_container admin__dialog_container-prod" @click.stop>
      <div class="admin__dialog_tabs">
        <p
            class="admin__dialog_tabs-item"
            :class="{ active: activeTab === 'Главная' }"
            @click="activeTab = 'Главная'"
        >
          Главная
        </p>

        <p
            class="admin__dialog_tabs-item"
            :class="{ active: activeTab === 'Товары', disabled: props.mode === 'create' }"
            @click="props.mode === 'edit' && (activeTab = 'Товары')"
            title="Привязка товаров доступна после создания акции"
        >
          Товары
        </p>
      </div>

      <!-- CROP MODAL (как в NewsDialog) -->
      <div v-if="cropperVisible" class="cropper-overlay" @click.stop>
        <div class="cropper-modal">
          <p class="cropper-modal__title">Обрезка изображения</p>

          <div class="cropper-modal__body">
            <img
                ref="cropperImgEl"
                :src="cropperImageUrl"
                class="cropper-modal__image"
                alt="Crop preview"
            />
          </div>

          <div class="cropper-modal__actions">
            <button type="button" class="main_btn" @click="confirmCrop">
              Обрезать и сохранить
            </button>
            <button type="button" class="main_btn" @click="cancelCrop">
              Отмена
            </button>
          </div>
        </div>
      </div>

      <div class="admin__dialog_content" v-if="activeTab === 'Главная'">
        <h3 class="admin__dialog_title">
          {{ props.mode === "create" ? "Создание акции" : "Изменение акции" }}
        </h3>

        <form class="admin-panel__content_form-dialog" @submit.prevent="save">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="title"
              placeholder="Введите название"
              :class="{ error: errors.title }"
          />

          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="description"
              placeholder="Введите описание"
              :class="{ error: errors.description }"
          />

          <input
              type="date"
              class="basket__form_input admin-panel__content_input"
              v-model="start"
              :class="{ error: errors.start }"
          />

          <input
              type="date"
              class="basket__form_input admin-panel__content_input"
              v-model="end"
              :class="{ error: errors.end }"
          />

          <div style="display:flex; gap:10px; align-items:center;">
            <span>В архив</span>
            <input type="checkbox" v-model="isArchived"/>
          </div>

          <div class="input__wrapper">
            <input
                ref="fileInputRef"
                type="file"
                id="stock_file"
                class="input input__file"
                @change="handleFileChange"
                accept="image/*"
            />
            <label for="stock_file" class="input__file-button" :class="{ error: errors.image }">
              <span class="input__file-icon-wrapper">
                <img
                    v-if="imagePreview"
                    class="input__file-icon"
                    :src="imagePreview"
                    alt="Выбрать файл"
                    width="50"
                    height="50"
                />
              </span>
              <span class="input__file-button-text">Выберите картинку (jpeg, png, jpg, gif до 10 Мб)</span>
            </label>
          </div>

          <p v-if="imageAutoError" style="color:#ff3b3b; margin-top:8px;">
            Не удалось подхватить картинку автоматически (CORS/доступ). Выберите файл вручную.
          </p>

          <!-- если это create от seed и товары есть -->
          <div v-if="props.mode === 'create' && linkedProducts.length" style="margin-top: 10px;">
            <b>Товары (будут привязаны после сохранения):</b>
            <ul style="margin: 6px 0 0 18px;">
              <li v-for="p in linkedProducts" :key="p.id">{{ p.name }}</li>
            </ul>
          </div>

          <button
              class="main_btn"
              type="submit"
              :disabled="isLoading"
              :class="{ loading: isLoading }"
              :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
          >
            <span v-if="isLoading">
              <img src="../../public/loading.gif" alt="Загрузка" width="50"/>
            </span>
            <span v-else>
              {{ props.mode === "create" ? "Создать акцию" : "Изменить акцию" }}
            </span>
          </button>
        </form>
      </div>

      <div class="admin__dialog_content" v-if="activeTab === 'Товары'">
        <h3 class="admin__dialog_title">Привязанные товары</h3>

        <div v-if="!canEditProducts" style="opacity: .7;">
          Привязка товаров доступна после создания акции.
        </div>

        <form class="admin-panel__content_form-dialog" @submit.prevent="addProduct" v-else>
          <div class="admin__dialog_grid">
            <select v-model="productToAdd" class="basket__form_input admin-panel__content_select" style="height: 100%">
              <option value="" disabled>Выберите товар</option>
              <option v-for="prod in props.allProducts" :key="prod.id" :value="prod.id">
                {{ prod.name }}
              </option>
            </select>

            <button
                class="main_btn"
                type="submit"
                :disabled="isLoading || !productToAdd"
                :class="{ loading: isLoading }"
                :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
            >
              <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
              <span v-else>Добавить товар</span>
            </button>
          </div>
        </form>

        <table>
          <thead>
          <tr>
            <th>Название</th>
            <th style="width: 120px">Удалить</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="prod in linkedProducts" :key="prod.id">
            <td>{{ prod.name }}</td>
            <td>
              <button
                  class="admin-panel__content_btn"
                  @click="removeProduct(prod.id)"
                  :disabled="!canEditProducts || isLoading"
              >
                Удалить
              </button>
            </td>
          </tr>
          </tbody>
        </table>

      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.admin__dialog_tabs-item.disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* ✅ стили cropper-overlay 1:1 как в NewsDialog */
.cropper-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, .35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.cropper-modal__body ::v-deep(cropper-canvas) {
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
