<script setup>
import { ref } from 'vue'
import Toastify from 'toastify-js'

const props = defineProps({
  // v-model:files
  files: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:files'])

const isDragOver = ref(false)
const fileInput = ref(null)

const MAX_SIZE = 50 * 1024 * 1024 // 50 МБ
const ALLOWED_EXT = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'zip']

const showError = (text) => {
  Toastify({
    text,
    duration: 3000,
    gravity: 'top',
    position: 'right',
    backgroundColor: '#ff4545',
    stopOnFocus: true
  }).showToast()
}

const validateAndAddFiles = (fileList) => {
  if (!fileList || !fileList.length) return

  const newFiles = [...props.files]

  Array.from(fileList).forEach((file) => {
    const extension = file.name.split('.').pop().toLowerCase()

    if (!ALLOWED_EXT.includes(extension)) {
      showError(`Файл "${file.name}" имеет недопустимый формат`)
      return
    }

    if (file.size > MAX_SIZE) {
      showError(`Файл "${file.name}" превышает 50 МБ`)
      return
    }

    newFiles.push(file)
  })

  emit('update:files', newFiles)
}

const onInputChange = (event) => {
  const files = event.target.files
  validateAndAddFiles(files)
  // чтобы можно было выбрать тот же файл ещё раз
  event.target.value = ''
}

const onDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  const files = event.dataTransfer?.files
  validateAndAddFiles(files)
}

const onDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

const onDragLeave = (event) => {
  event.preventDefault()
  isDragOver.value = false
}

const openFileDialog = () => {
  fileInput.value?.click()
}

const removeFile = (index) => {
  const updated = [...props.files]
  updated.splice(index, 1)
  emit('update:files', updated)
}
</script>

<template>
  <div class="file-upload">
    <input
        ref="fileInput"
        type="file"
        class="file-upload__input"
        multiple
        @change="onInputChange"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
    />

    <div
        class="file-upload__dropzone"
        :class="{ 'file-upload__dropzone--dragover': isDragOver }"
        @click="openFileDialog"
        @dragenter.prevent="onDragOver"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop="onDrop"
    >
      <p class="file-upload__text">
        Загрузите или перетащите файл с планом этажа, планом кровли, разрезы и
        сечения или прочие файлы
        <br />
        (допустимые форматы: pdf, doc, docx, png, jpg, jpeg, zip до 50 МБ)
      </p>
    </div>

    <ul v-if="files && files.length" class="file-upload__list">
      <li
          v-for="(file, index) in files"
          :key="index"
          class="file-upload__item"
      >
        <span class="file-upload__name">{{ file.name }}</span>
        <button
            type="button"
            class="file-upload__remove"
            @click.stop="removeFile(index)"
        >
          Удалить
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.file-upload {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-upload__input {
  display: none;
}

.file-upload__dropzone {
  background: #f7f7f7;
  border-radius: 8px;
  min-height: 140px;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
  cursor: pointer;
  transition: border 0.2s ease, background-color 0.2s ease;
}

.file-upload__dropzone--dragover {
  border: 2px dashed #ef7f1a;
  background: #fff7ef;
}

.file-upload__text {
  font-size: 14px;
  color: #9B9B9B;
}

.file-upload__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.file-upload__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  padding: 6px 8px;
  border-radius: 6px;
  background: #f7f7f7;
  & + & {
    margin-top: 6px;
  }
}

.file-upload__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 80%;
}

.file-upload__remove {
  border: none;
  background: transparent;
  font-size: 13px;
  cursor: pointer;
  color: #ef7f1a;
}
</style>
