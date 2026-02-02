<script setup>
import { onMounted, ref, computed, onBeforeUnmount } from "vue";
import axios from "axios";

const SERVICES_NAME = "Услуги";

onMounted(async () => {
  const token = localStorage.getItem("authToken");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    await fetchCategory();
  }
});

const isLoading = ref(false);

const errors = ref({
  nameCategory: false,
  photoCategory: false,
  servicesExists: false, // ⚠️ "Услуги" уже существует
});

const categories = ref([]);
const categoriesLevel = ref([]);
const allCategories = ref([]);

const parentCategory = ref(null);
const nameCategory = ref("");
const photoCategory = ref(null);
const fileCategory = ref(null);
const previewImageCategory = ref(null);

const isEditingCat = ref(false);
const currentCategoryId = ref(null);

// ---- helpers ----
const normalizeName = (v) => String(v ?? "").trim().toLowerCase();
const isServicesName = (name) => normalizeName(name) === normalizeName(SERVICES_NAME);

const categoryIsServices = (cat) => isServicesName(cat?.name);

const hasServicesCategory = computed(() => {
  // проверяем во всей иерархии
  const walk = (list) => {
    for (const c of list || []) {
      if (categoryIsServices(c)) return true;
      if (c?.children?.length && walk(c.children)) return true;
    }
    return false;
  };
  return walk(categories.value);
});

const editingIsServices = computed(() => {
  if (!isEditingCat.value) return false;
  return isServicesName(nameCategory.value);
});

const destroyPreviewIfBlob = (url) => {
  if (url && typeof url === "string" && url.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(url);
    } catch {}
  }
};

// ---- flatten (оставил как было, вдруг пригодится) ----
const flattenCategories = (categoriesTree) => {
  const result = [];
  const traverse = (categoryList, parentId = null) => {
    (categoryList || []).forEach((category) => {
      result.push({
        id: category.id,
        name: category.name,
        level: category.level,
        parent_id: category.parent_id,
        parentId,
      });

      if (category.children && category.children.length > 0) {
        traverse(category.children, category.id);
      }
    });
  };
  traverse(categoriesTree);
  return result;
};

// ---- API ----
const fetchCategory = async () => {
  try {
    const response = await axios.get("/categories");
    categories.value = response.data;

    allCategories.value = flattenCategories(categories.value);
    categoriesLevel.value = categories.value.filter((category) => category.level === 0);
  } catch (error) {
    console.error("Ошибка:", error.response?.data || error);
  }
};

// ---- ui ----
const handleFileChangeCategory = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    photoCategory.value = file;

    destroyPreviewIfBlob(previewImageCategory.value);
    previewImageCategory.value = URL.createObjectURL(file);

    errors.value.photoCategory = false;
  }
};

// ---- create ----
const createCategory = async () => {
  errors.value.nameCategory = false;
  errors.value.photoCategory = false;
  errors.value.servicesExists = false;

  const trimmed = String(nameCategory.value || "").trim();
  errors.value.nameCategory = !trimmed;
  errors.value.photoCategory = !photoCategory.value;

  // ✅ "Услуги" можно создать только один раз
  if (isServicesName(trimmed) && hasServicesCategory.value) {
    errors.value.servicesExists = true;
    errors.value.nameCategory = true;
  }

  if (errors.value.nameCategory || errors.value.photoCategory || errors.value.servicesExists) return;

  isLoading.value = true;
  try {
    const formData = new FormData();
    formData.append("name", trimmed);
    formData.append("photo", photoCategory.value);

    if (parentCategory.value) {
      formData.append("parent_id", parentCategory.value);
    }

    await axios.post(`/categories`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    await fetchCategory();
    resetCategory();
  } catch (error) {
    console.error("Ошибка:", error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};

// ---- update ----
const updateCategory = async () => {
  errors.value.nameCategory = false;
  errors.value.photoCategory = false;
  errors.value.servicesExists = false;

  // ✅ если редактируем "Услуги" — можно менять ТОЛЬКО картинку
  if (editingIsServices.value) {
    // требуем выбрать файл, иначе нечего менять
    errors.value.photoCategory = !photoCategory.value;
    if (errors.value.photoCategory) return;

    isLoading.value = true;
    try {
      const formData = new FormData();

      // на всякий случай отправим текущее имя, но оно не меняется
      formData.append("name", SERVICES_NAME);
      formData.append("photo", photoCategory.value);

      await axios.post(`/categories/${currentCategoryId.value}?_method=PATCH`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchCategory();
      resetCategory();
    } catch (error) {
      console.error("Ошибка:", error.response?.data || error);
    } finally {
      isLoading.value = false;
    }
    return;
  }

  // обычные категории: имя обязательно, фото по желанию
  const trimmed = String(nameCategory.value || "").trim();
  errors.value.nameCategory = !trimmed;
  if (errors.value.nameCategory) return;

  // запрещаем переименовать обычную категорию в "Услуги", если она уже есть
  if (isServicesName(trimmed) && hasServicesCategory.value) {
    errors.value.servicesExists = true;
    errors.value.nameCategory = true;
    return;
  }

  isLoading.value = true;
  try {
    const formData = new FormData();
    formData.append("name", trimmed);

    if (photoCategory.value) {
      formData.append("photo", photoCategory.value);
    }

    if (parentCategory.value) {
      formData.append("parent_id", parentCategory.value);
    }

    await axios.post(`/categories/${currentCategoryId.value}?_method=PATCH`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    await fetchCategory();
    resetCategory();
  } catch (error) {
    console.error("Ошибка:", error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};

const editCategory = (category) => {
  isEditingCat.value = true;
  currentCategoryId.value = category.id;

  nameCategory.value = category.name;
  parentCategory.value = category.parent_id ?? null;

  photoCategory.value = null;
  destroyPreviewIfBlob(previewImageCategory.value);
  previewImageCategory.value = category.photo;

  errors.value.nameCategory = false;
  errors.value.photoCategory = false;
  errors.value.servicesExists = false;
};

const resetCategory = () => {
  isEditingCat.value = false;
  currentCategoryId.value = null;

  nameCategory.value = "";
  parentCategory.value = null;

  photoCategory.value = null;
  if (fileCategory.value) fileCategory.value.value = "";

  destroyPreviewIfBlob(previewImageCategory.value);
  previewImageCategory.value = null;

  errors.value.nameCategory = false;
  errors.value.photoCategory = false;
  errors.value.servicesExists = false;
};

// ---- delete ----
const deleteCategory = async (category) => {
  // category может прийти id или объект — сделаем универсально
  const id = typeof category === "object" ? category?.id : category;
  const name = typeof category === "object" ? category?.name : null;

  // ✅ "Услуги" нельзя удалять
  if (name && isServicesName(name)) return;

  isLoading.value = true;
  try {
    await axios.delete(`/categories/${id}`);
    await fetchCategory();
  } catch (error) {
    console.error("Ошибка:", error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};

onBeforeUnmount(() => {
  destroyPreviewIfBlob(previewImageCategory.value);
});
</script>

<template>
  <div class="admin-panel__content">
    <h2>Управление категориями</h2>

    <!-- CREATE -->
    <form class="admin-panel__content_form" v-if="!isEditingCat" @submit.prevent="createCategory">
      <input
          type="text"
          class="basket__form_input admin-panel__content_input"
          v-model="nameCategory"
          placeholder="Введите имя категории"
          :class="{ error: errors.nameCategory }"
      />

      <p v-if="errors.servicesExists" style="color:#ff3b3b; margin-top:6px;">
        Категория «Услуги» уже создана. Вторую такую создать нельзя.
      </p>

      <select v-model="parentCategory" class="basket__form_input admin-panel__content_select">
        <option value="" disabled>Выберите родительскую категорию</option>
        <option v-for="cat in categoriesLevel" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>

      <div class="input__wrapper">
        <input
            ref="fileCategory"
            type="file"
            id="category_file_create"
            class="input input__file"
            @change="handleFileChangeCategory"
            accept="image/*"
        />
        <label for="category_file_create" class="input__file-button" :class="{ error: errors.photoCategory }">
          <span class="input__file-icon-wrapper">
            <img
                v-if="previewImageCategory"
                class="input__file-icon"
                :src="previewImageCategory"
                alt="Выбрать файл"
                width="50"
                height="50px"
            />
          </span>
          <span class="input__file-button-text">Выберите картинку</span>
        </label>
      </div>

      <button
          class="main_btn"
          type="submit"
          :disabled="isLoading"
          :class="{ loading: isLoading }"
          :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
      >
        <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
        <span v-else>Создать категорию</span>
      </button>
    </form>

    <!-- EDIT -->
    <form class="admin-panel__content_form" v-if="isEditingCat" @submit.prevent="updateCategory">
      <input
          type="text"
          class="basket__form_input admin-panel__content_input"
          v-model="nameCategory"
          placeholder="Введите новое имя категории"
          :disabled="editingIsServices"
          :class="{ error: errors.nameCategory }"
      />

      <p v-if="editingIsServices" style="opacity:.8; margin-top:6px;">
        Для категории «Услуги» можно изменить только картинку. Переименование и удаление запрещены.
      </p>

      <p v-if="errors.servicesExists" style="color:#ff3b3b; margin-top:6px;">
        Нельзя назвать категорию «Услуги», потому что она уже существует.
      </p>

      <div class="input__wrapper">
        <input
            ref="fileCategory"
            type="file"
            id="category_file_edit"
            class="input input__file"
            @change="handleFileChangeCategory"
            accept="image/*"
        />
        <label for="category_file_edit" class="input__file-button" :class="{ error: errors.photoCategory }">
          <span class="input__file-icon-wrapper">
            <img
                v-if="previewImageCategory"
                class="input__file-icon"
                :src="previewImageCategory"
                alt="Выбрать файл"
                width="50"
                height="50px"
            />
          </span>
          <span class="input__file-button-text">Выберите картинку</span>
        </label>
      </div>

      <button
          class="main_btn"
          type="submit"
          :disabled="isLoading"
          :class="{ loading: isLoading }"
          :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
      >
        <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
        <span v-else>Изменить категорию</span>
      </button>

      <button class="main_btn" type="button" @click="resetCategory" v-if="!isLoading">
        Отмена
      </button>
    </form>

    <!-- TABLE -->
    <table v-for="category in categories" :key="category.id">
      <thead>
      <tr>
        <th style="width: 50%">Название</th>
        <th>Фото</th>
        <th>Дочерние элементы</th>
        <th style="width: 100px">Изменить</th>
        <th style="width: 100px">Удалить</th>
      </tr>
      </thead>

      <tbody>
      <tr>
        <td>{{ category.name }}</td>
        <td>
          <img v-if="category.photo" :src="category.photo" alt="Фото" width="50"/>
        </td>
        <td>
            <span v-if="category.children.length > 0">
              {{ category.children.length }} дочерних элемента(ов)
            </span>
          <span v-else>Нет</span>
        </td>
        <td>
          <button @click="editCategory(category)" class="admin-panel__content_btn">
            Изменить
          </button>
        </td>
        <td>
          <button
              @click="deleteCategory(category)"
              class="admin-panel__content_btn"
              :disabled="categoryIsServices(category) || isLoading"
              :title="categoryIsServices(category) ? 'Категорию «Услуги» нельзя удалить' : ''"
          >
            Удалить
          </button>
        </td>
      </tr>

      <tr v-for="cat in category.children" :key="cat.id">
        <td>{{ cat.name }}</td>
        <td><img :src="cat.photo" alt="Фото" width="50"/></td>
        <td>Дочерняя</td>
        <td>
          <button @click="editCategory(cat)" class="admin-panel__content_btn">
            Изменить
          </button>
        </td>
        <td>
          <button
              @click="deleteCategory(cat)"
              class="admin-panel__content_btn"
              :disabled="categoryIsServices(cat) || isLoading"
              :title="categoryIsServices(cat) ? 'Категорию «Услуги» нельзя удалить' : ''"
          >
            Удалить
          </button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">

</style>
