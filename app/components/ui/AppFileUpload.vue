<script setup lang="ts">
import {
  UploadCloud,
  FileText,
  X,
} from 'lucide-vue-next'

const model = defineModel<File | null>({
  default: null,
})

withDefaults(
  defineProps<{
    label?: string
    description?: string
    accept?: string
    required?: boolean
    maxSizeMb?: number
  }>(),
  {
    label: '',
    description: 'Click to upload or drag and drop.',
    accept: '.jpg,.jpeg,.png,.pdf',
    required: false,
    maxSizeMb: 5,
  },
)

const error = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const handleFile = (
  file?: File,
) => {
  error.value = ''

  if (!file) return

//   const props = defineProps

  const maxBytes =
    5 * 1024 * 1024

  if (file.size > maxBytes) {
    error.value =
      'File size must not exceed 5MB.'
    return
  }

  model.value = file
}

const onChange = (
  event: Event,
) => {
  const target =
    event.target as HTMLInputElement

  handleFile(
    target.files?.[0],
  )
}

const onDrop = (
  event: DragEvent,
) => {
  handleFile(
    event.dataTransfer?.files?.[0],
  )
}

const removeFile = () => {
  model.value = null
  error.value = ''

  if (inputRef.value) {
    inputRef.value.value = ''
  }
}

const formatSize = (
  size: number,
) => {
  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(
      size / 1024
    ).toFixed(1)} KB`
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} MB`
}
</script>

<template>
  <div class="upload-wrapper">
    <label
      v-if="label"
      class="field-label"
    >
      {{ label }}

      <span
        v-if="required"
        class="required-mark"
      >
        *
      </span>
    </label>

    <div
      v-if="!model"
      class="upload-zone"
      @click="inputRef?.click()"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      <div class="upload-icon">
        <UploadCloud :size="22" />
      </div>

      <strong>
        Upload file
      </strong>

      <span>
        {{ description }}
      </span>

      <small>
        Max {{ maxSizeMb }}MB
      </small>

      <input
        ref="inputRef"
        type="file"
        hidden
        :accept="accept"
        @change="onChange"
      >
    </div>

    <div
      v-else
      class="uploaded-file"
    >
      <div class="file-icon">
        <FileText :size="18" />
      </div>

      <div class="file-info">
        <strong>
          {{ model.name }}
        </strong>

        <span>
          {{ formatSize(model.size) }}
        </span>
      </div>

      <button
        type="button"
        class="remove-file"
        @click="removeFile"
      >
        <X :size="15" />
      </button>
    </div>

    <span
      v-if="error"
      class="field-error"
    >
      {{ error }}
    </span>
  </div>
</template>

<style scoped>
.upload-wrapper {
  width: 100%;
}

.field-label {
  display: block;

  margin-bottom: 7px;

  color: var(--text-secondary);

  font-size: 10px;
  font-weight: 600;
}

.required-mark {
  color: var(--red);
}

.upload-zone {
  display: flex;
  min-height: 145px;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 20px;

  border: 1px dashed var(--border);
  border-radius: 10px;

  background: var(--bg-card-soft);

  text-align: center;
  cursor: pointer;

  transition:
    border-color 0.18s ease,
    background 0.18s ease;
}

.upload-zone:hover {
  border-color: var(--primary);

  background: var(--primary-soft);
}

.upload-icon {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;

  margin-bottom: 9px;

  border-radius: 10px;

  background: var(--primary-soft);
  color: var(--primary);
}

.upload-zone strong {
  color: var(--text-primary);

  font-size: 11px;
}

.upload-zone span {
  margin-top: 4px;

  color: var(--text-muted);

  font-size: 9px;
}

.upload-zone small {
  margin-top: 5px;

  color: var(--text-muted);

  font-size: 8px;
}

.uploaded-file {
  display: flex;
  align-items: center;
  gap: 10px;

  min-height: 58px;

  padding: 10px 12px;

  border: 1px solid var(--border);
  border-radius: 9px;

  background: var(--bg-card);
}

.file-icon {
  display: flex;
  width: 35px;
  height: 35px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: var(--primary-soft);
  color: var(--primary);
}

.file-info {
  min-width: 0;
  flex: 1;
}

.file-info strong {
  display: block;
  overflow: hidden;

  color: var(--text-primary);

  font-size: 10px;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.file-info span {
  display: block;

  margin-top: 3px;

  color: var(--text-muted);

  font-size: 8px;
}

.remove-file {
  display: flex;
  width: 29px;
  height: 29px;
  align-items: center;
  justify-content: center;

  border: 0;
  border-radius: 6px;

  background: transparent;
  color: var(--text-muted);
}

.remove-file:hover {
  background: var(--red-soft);
  color: var(--red);
}

.field-error {
  display: block;

  margin-top: 5px;

  color: var(--red);

  font-size: 9px;
}
</style>