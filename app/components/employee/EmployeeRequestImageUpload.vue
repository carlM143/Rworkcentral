<script setup lang="ts">
import { ImagePlus, X } from 'lucide-vue-next'
import type { EmployeeRequest } from '~/composables/employee/useEmployeePortal'

const props = withDefaults(defineProps<{ required?: boolean }>(), { required: true })
const image = defineModel<EmployeeRequest['image']>()
const emit = defineEmits<{ busy: [value: boolean] }>()
const input = ref<HTMLInputElement | null>(null)
const error = ref('')
const loading = ref(false)
let reader: FileReader | undefined
let selection = 0

const clear = () => {
  selection++
  reader?.abort()
  image.value = undefined
  error.value = ''
  loading.value = false
  emit('busy', false)
  if (input.value) input.value.value = ''
}

const selectImage = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  clear()
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    error.value = 'Choose a JPG, PNG, or WebP image.'
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    error.value = 'Image must be 2 MB or smaller.'
    return
  }

  const currentSelection = selection
  loading.value = true
  emit('busy', true)
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader = new FileReader()
      reader.onload = () => resolve(String(reader?.result))
      reader.onerror = () => reject(new Error('Read failed'))
      reader.onabort = () => reject(new Error('Read cancelled'))
      reader.readAsDataURL(file)
    })
    const preview = new Image()
    preview.src = dataUrl
    await preview.decode()
    if (currentSelection === selection) image.value = { name: file.name, dataUrl }
  } catch {
    if (currentSelection === selection) error.value = 'This image could not be opened. Please choose another file.'
  } finally {
    if (currentSelection === selection) {
      loading.value = false
      emit('busy', false)
    }
  }
}

onBeforeUnmount(() => { selection++; reader?.abort() })
</script>

<template>
  <div class="image-upload">
    <label>
      <span class="upload-heading"><ImagePlus :size="15" />Supporting Image <span>{{ props.required ? '(required)' : '(optional)' }}</span></span>
      <input ref="input" type="file" accept="image/jpeg,image/png,image/webp" :required="props.required && !image" @change="selectImage">
      <small>JPG, PNG, or WebP · Maximum 2 MB (optional attachment)</small>
    </label>
    <p v-if="loading" role="status">Preparing image…</p>
    <p v-if="error" class="upload-error" role="alert">{{ error }}</p>
    <figure v-if="image">
      <img :src="image.dataUrl" :alt="`Selected attachment: ${image.name}`">
      <figcaption><span>{{ image.name }}</span><button type="button" aria-label="Remove attached image" @click="clear"><X :size="15" />Remove</button></figcaption>
    </figure>
  </div>
</template>

<style scoped>
.image-upload label { display: flex; flex-direction: column; gap: 6px; font-size: 11px; font-weight: 500; }
.upload-heading { display: flex; align-items: center; gap: 7px; color: var(--text-primary); font-size: 11px; font-weight: 500; }
.upload-heading > span, small { color: var(--text-secondary); font-weight: 400; font-size: 10px; }
input[type="file"] {
  width: 100%;
  border: 1px dashed var(--border);
  border-radius: 8px;
  padding: 6px 10px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  box-sizing: border-box;
}
input[type="file"]::file-selector-button {
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-primary);
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  margin-right: 10px;
  transition: background .15s ease, border-color .15s ease;
}
input[type="file"]::file-selector-button:hover {
  background: var(--bg-card-soft);
  border-color: var(--primary);
}
input:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
small, p { font-size: 10px; }
.upload-error { color: var(--red); }
figure { margin: 10px 0 0; padding: 8px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); }
img { display: block; max-width: 100%; max-height: 160px; object-fit: contain; margin: 0 auto; border-radius: 4px; }
figcaption { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 8px; font-size: 11px; }
figcaption span { overflow-wrap: anywhere; color: var(--text-primary); font-size: 11px; }
button { display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; padding: 4px 8px; border: 0; border-radius: 4px; background: #dc262618; color: var(--red); font-size: 11px; font-weight: 500; cursor: pointer; }
button:hover { background: #dc262628; }
@media(max-width: 850px) {
  .image-upload { min-width: 0; }
  .image-upload label { font-size: 11px; gap: 5px; }
  .upload-heading { font-size: 11px; }
  small, p { font-size: 10px; }
  input[type="file"] { max-width: 100%; font-size: 11px; padding: 6px 10px; }
  figcaption { flex-wrap: wrap; gap: 6px; font-size: 11px; }
  figcaption span { min-width: 0; flex: 1 1 120px; font-size: 11px; }
  button { font-size: 11px; min-height: 30px; padding: 4px 10px; }
}
</style>
