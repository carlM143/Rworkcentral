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
      <span class="upload-heading"><ImagePlus :size="17" />Supporting Image <span>{{ props.required ? '(required)' : '(optional)' }}</span></span>
      <input ref="input" type="file" accept="image/jpeg,image/png,image/webp" :required="props.required && !image" @change="selectImage">
      <small>JPG, PNG, or WebP · Maximum 2 MB · Saved in this browser only</small>
    </label>
    <p v-if="loading" role="status">Preparing image…</p>
    <p v-if="error" class="upload-error" role="alert">{{ error }}</p>
    <figure v-if="image">
      <img :src="image.dataUrl" :alt="`Selected attachment: ${image.name}`">
      <figcaption><span>{{ image.name }}</span><button type="button" aria-label="Remove attached image" @click="clear"><X :size="16" />Remove</button></figcaption>
    </figure>
  </div>
</template>

<style scoped>
.image-upload label { display: flex; flex-direction: column; gap: 9px; font-size: 11px; font-weight: 500; }
.upload-heading { display: flex; align-items: center; gap: 7px; }
.upload-heading > span, small { color: var(--text-secondary); font-weight: 400; }
input { width: 100%; border: 1px dashed var(--border); border-radius: 8px; padding: 12px; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; }
input:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
small, p { font-size: 10px; }
.upload-error { color: var(--red); }
figure { margin: 12px 0 0; padding: 10px; border: 1px solid var(--border); border-radius: 8px; }
img { display: block; max-width: 100%; max-height: 180px; object-fit: contain; margin: 0 auto; }
figcaption { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 10px; font-size: 11px; }
figcaption span { overflow-wrap: anywhere; }
button { display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; padding: 5px; border: 0; background: transparent; color: var(--red); font-size: 11px; }
@media(max-width: 850px) { .image-upload { min-width: 0; }.image-upload label, small, p, figcaption { font-size: 13px; }input { max-width: 100%; font-size: 16px; }figcaption { flex-wrap: wrap; }figcaption span { min-width: 0; flex: 1 1 140px; }button { font-size: 13px; } }
</style>
