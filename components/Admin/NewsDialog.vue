<script setup>
import { computed, ref, watch, nextTick, onBeforeUnmount } from "vue";
import axios from "axios";
import EditorProd from "~/components/UI/editorProd.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mode: { type: String, default: "create" },
  newsId: { type: [Number, String, null], default: null },
  promos: { type: Array, default: () => [] },
  allProducts: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:modelValue", "saved"]);

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const todayStr = new Date().toISOString().split("T")[0];

const activeTab = ref("Главная");
const isLoading = ref(false);

const errors = ref({
  title: false,
  type: false,
  image: false,
  promo: false,
  pinned: false,
});

const currentId = ref(null);

const title = ref("");
const type = ref(null);
const promoId = ref(null);

const pinnedUntil = ref("");
const video = ref("");
const html = ref("");

const imageFile = ref(null);
const imagePreview = ref(null);
const fileInputRef = ref(null);

const linkedProducts = ref([]);
const productToAdd = ref(null);

const canEditProducts = computed(() => props.mode === "edit" && !!currentId.value);

const destroyPreviewIfBlob = (url) => {
  if (url && typeof url === "string" && url.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(url);
    } catch {}
  }
};

const resetForm = () => {
  activeTab.value = "Главная";
  currentId.value = null;

  title.value = "";
  type.value = null;
  promoId.value = null;

  pinnedUntil.value = "";
  video.value = "";
  html.value = "";

  imageFile.value = null;
  destroyPreviewIfBlob(imagePreview.value);
  imagePreview.value = null;

  if (fileInputRef.value) fileInputRef.value.value = "";

  linkedProducts.value = [];
  productToAdd.value = null;

  errors.value = { title: false, type: false, image: false, promo: false, pinned: false };

  cropperVisible.value = false;
  cropperImageUrl.value = null;
  if (cropperInstance.value) {
    cropperInstance.value.destroy();
    cropperInstance.value = null;
  }
};

const formatFromBackend = (dateStr) => {
  if (!dateStr) return "";
  const [day, month, year] = String(dateStr).split(".");
  if (!day || !month || !year) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const isPinnedValid = () => {
  if (!pinnedUntil.value) return true;
  return pinnedUntil.value >= todayStr;
};

const getLinkedProductIds = () =>
    linkedProducts.value
        .map((p) => (typeof p === "object" && p !== null ? Number(p.id) : Number(p)))
        .filter((n) => Number.isFinite(n));

const cropperVisible = ref(false);
const cropperImageUrl = ref(null);
const cropperImgEl = ref(null);
const cropperInstance = ref(null);
let CropperClass = null;

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

        const { width: containerWidth, height: containerHeight } = cropper.getContainerData();

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

    const file = new File([blob], "news-cover.png", { type: "image/png" });
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

const handleFileChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const isGif = file.type === "image/gif" || /\.gif$/i.test(file.name);
  if (isGif) {
    destroyPreviewIfBlob(imagePreview.value);
    imageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
    return;
  }

  openCropper(file);
};

const loadNews = async (id) => {
  const { data } = await axios.get(`/news/${id}`);
  currentId.value = data.id;

  title.value = data.title || "";
  type.value = data.type || null;
  promoId.value = data.promo_id || null;

  video.value = data.video || "";
  html.value = data.html || "";

  pinnedUntil.value = formatFromBackend(data.pinned_until);

  destroyPreviewIfBlob(imagePreview.value);
  imagePreview.value = data.image || null;
  imageFile.value = null;

  linkedProducts.value = Array.isArray(data.products) ? data.products : [];
};

const syncProducts = async (newsId = currentId.value, ids = getLinkedProductIds()) => {
  const targetId = newsId;
  const arr = Array.isArray(ids) ? ids : [];

  try {
    await axios.post(
        `/news/${targetId}?_method=patch`,
        { products: arr },
        { headers: { "Content-Type": "application/json" } }
    );
    return;
  } catch (e) {
    const fd = new FormData();
    if (arr.length === 0) {
      fd.append("products", "[]");
    } else {
      arr.forEach((id, idx) => fd.append(`products[${idx}]`, id));
    }

    await axios.post(`/news/${targetId}?_method=patch`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
};

watch(
    () => props.modelValue,
    async (open) => {
      if (!open) return;

      resetForm();

      if (props.mode === "edit" && props.newsId) {
        isLoading.value = true;
        try {
          await loadNews(props.newsId);
        } finally {
          isLoading.value = false;
        }
      }
    }
);

watch(
    () => props.newsId,
    async (id) => {
      if (!isOpen.value) return;
      if (props.mode !== "edit") return;
      if (!id) return;

      isLoading.value = true;
      try {
        await loadNews(id);
      } finally {
        isLoading.value = false;
      }
    }
);

watch(type, (v) => {
  if (v !== "Акция") promoId.value = null;
});

const validateMain = () => {
  errors.value.title = !title.value;
  errors.value.type = !type.value;

  errors.value.promo = type.value === "Акция" && !promoId.value;
  errors.value.pinned = !isPinnedValid();

  errors.value.image = props.mode === "create" ? !imageFile.value : false;

  return !(
      errors.value.title ||
      errors.value.type ||
      errors.value.image ||
      errors.value.promo ||
      errors.value.pinned
  );
};

const save = async () => {
  if (!validateMain()) return;

  isLoading.value = true;
  try {
    const formData = new FormData();
    formData.append("title", title.value);
    formData.append("type", type.value);
    formData.append("html", html.value || "");

    if (props.mode === "create") {
      formData.append("date", todayStr);
    }

    if (video.value) formData.append("video", video.value);

    if (type.value === "Акция" && promoId.value) {
      formData.append("promo_id", promoId.value);
    }

    if (pinnedUntil.value) {
      formData.append("pinned_until", pinnedUntil.value);
    }

    if (props.mode === "edit") {
      const ids = getLinkedProductIds();
      ids.forEach((id, idx) => formData.append(`products[${idx}]`, id));
    }

    if (props.mode === "create") {
      formData.append("image", imageFile.value);

      await axios.post(`/news`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      emit("saved");
      isOpen.value = false;
      return;
    }

    if (imageFile.value) formData.append("image", imageFile.value);

    await axios.post(`/news/${currentId.value}?_method=patch`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    emit("saved");
    isOpen.value = false;
  } catch (e) {
    console.error("Ошибка сохранения новости:", e?.response?.data || e);
  } finally {
    isLoading.value = false;
  }
};

const addProduct = async () => {
  if (!canEditProducts.value) return;
  if (!productToAdd.value) return;

  const id = Number(productToAdd.value);
  const currentIds = getLinkedProductIds();
  if (currentIds.includes(id)) {
    productToAdd.value = null;
    return;
  }

  const found = props.allProducts.find((p) => Number(p.id) === id);
  linkedProducts.value.push(found ? { id: found.id, name: found.name } : { id, name: `ID ${id}` });

  isLoading.value = true;
  try {
    await syncProducts(currentId.value);
    await loadNews(currentId.value);
    productToAdd.value = null;
  } catch (e) {
    console.error("Ошибка привязки товара:", e?.response?.data || e);
  } finally {
    isLoading.value = false;
  }
};

const removeProduct = async (productId) => {
  if (!canEditProducts.value) return;

  const id = Number(productId);
  linkedProducts.value = linkedProducts.value.filter((p) => Number(p?.id ?? p) !== id);

  isLoading.value = true;
  try {
    await syncProducts(currentId.value);
    await loadNews(currentId.value);
  } catch (e) {
    console.error("Ошибка отвязки товара:", e?.response?.data || e);
  } finally {
    isLoading.value = false;
  }
};

const close = () => {
  isOpen.value = false;
};

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
            title="Привязка товаров доступна после сохранения"
        >
          Товары
        </p>
      </div>

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
          {{ props.mode === "create" ? "Создание записи" : "Изменение записи" }}
        </h3>

        <form class="admin-panel__content_form-dialog" @submit.prevent="save">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="title"
              placeholder="Введите заголовок"
              :class="{ error: errors.title }"
          />

          <div class="input__wrapper">
            <input
                ref="fileInputRef"
                type="file"
                id="news_file"
                class="input input__file"
                @change="handleFileChange"
                accept="image/*"
            />
            <label for="news_file" class="input__file-button" :class="{ error: errors.image }">
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
              <span class="input__file-button-text">Выберите картинку (jpeg, png, jpg, gif, svg до 10 Мб)</span>
            </label>
          </div>

          Категория
          <select
              v-model="type"
              :class="{ error: errors.type }"
              class="basket__form_input admin-panel__content_select"
          >
            <option value="" disabled>Выберите категорию</option>
            <option value="Новости">Новости</option>
            <option value="Блог">Блог</option>
            <option value="Акция">Акция</option>
          </select>

          <p v-if="type === 'Акция'">Привязка к акции</p>
          <select
              v-if="type === 'Акция'"
              v-model="promoId"
              :class="{ error: errors.promo }"
              class="basket__form_input admin-panel__content_select"
          >
            <option value="" disabled>Выберите акцию</option>
            <option v-for="p in props.promos" :key="p.id" :value="p.id">
              {{ p.title }}
            </option>
          </select>

          Отображение на главной до (необязательный параметр, по умолчанию месяц)
          <input
              type="date"
              class="basket__form_input admin-panel__content_input"
              v-model="pinnedUntil"
              :min="todayStr"
              :class="{ error: errors.pinned }"
          />

          Видео в шапку (необязательный параметр)
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="video"
              placeholder="Введите ссылку на VK video"
          />

          <div class="editor__dialog">
            <EditorProd
                :key="`${props.mode}-${currentId || 'new'}`"
                :initialHtml="html"
                @export-html="(h) => (html = h)"
            />
          </div>

          <button
              class="main_btn"
              type="submit"
              :disabled="isLoading"
              :class="{ loading: isLoading }"
              :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
          >
            <span v-if="isLoading">
              <img src="../../public/loading.gif" alt="Загрузка" width="50" />
            </span>
            <span v-else>
              {{ props.mode === "create" ? "Создать запись" : "Изменить запись" }}
            </span>
          </button>
        </form>
      </div>

      <div class="admin__dialog_content" v-if="activeTab === 'Товары'">
        <h3 class="admin__dialog_title">Привязанные товары</h3>

        <div v-if="!canEditProducts" style="opacity: .7;">
          Привязка товаров доступна после сохранения записи.
        </div>

        <form class="admin-panel__content_form-dialog" @submit.prevent="addProduct" v-else>
          <div class="admin__dialog_grid">
            <select
                v-model="productToAdd"
                class="basket__form_input admin-panel__content_select"
                style="height: 100%"
            >
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
              <span v-if="isLoading">
                <img src="../../public/loading.gif" alt="Загрузка" width="50" />
              </span>
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
          <tr v-for="prod in linkedProducts" :key="(prod.id ?? prod)">
            <td>{{ prod.name ?? `ID ${prod}` }}</td>
            <td>
              <button
                  class="admin-panel__content_btn"
                  @click="removeProduct(prod.id ?? prod)"
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
