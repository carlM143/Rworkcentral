<script setup lang="ts">
import {
  Plus,
  Download,
  RotateCcw,
  FileText,
  CheckCircle2,
  Archive,
  FolderKanban,
  Edit2,
  Trash2,
  UploadCloud,
  Paperclip,
  X,
  Check,
  Tag,
} from 'lucide-vue-next'
import StatCard from '~/components/shared/StatCard.vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppSelect from '~/components/ui/AppSelect.vue'
import AppPagination from '~/components/ui/AppPagination.vue'

definePageMeta({
  layout: 'admin',
})

interface EvaluationTemplateItem {
  id: number
  templateCode: string
  title: string
  category: string
  description: string
  originalName: string
  mimeType: string
  fileExtension: string
  size: number
  sizeLabel: string
  status: boolean
  uploadedBy: string
  createdAt: string | null
  updatedAt: string | null
}

interface EvaluationTemplateCategoryItem {
  id: number
  name: string
  templatesCount: number
}

const { $api } = useNuxtApp()
const toast = useToast()

const templates = ref<EvaluationTemplateItem[]>([])
const categories = ref<EvaluationTemplateCategoryItem[]>([])
const stats = ref({
  total: 0,
  active: 0,
  archived: 0,
  categories: 0,
})
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const errorMessage = ref('')

const search = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const perPage = ref(8)

const categoryOptions = computed(() => categories.value.map(c => c.name))
const statusOptions = ['Active', 'Archived']

const load = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const [tplRes, catRes] = await Promise.all([
      $api<{ data: EvaluationTemplateItem[]; stats?: typeof stats.value }>('/admin/evaluation-templates'),
      $api<{ data: EvaluationTemplateCategoryItem[] }>('/admin/evaluation-template-categories'),
    ])
    templates.value = tplRes.data || []
    categories.value = catRes.data || []
    if (tplRes.stats) stats.value = tplRes.stats
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Unable to load evaluation document templates.'
  } finally {
    loading.value = false
  }
}

onMounted(load)

const allCategories = computed(() => {
  const merged = new Set([...categoryOptions.value, ...templates.value.map(t => t.category).filter(Boolean)])
  return Array.from(merged).sort((a, b) => a.localeCompare(b))
})

const filteredTemplates = computed(() => {
  const kw = search.value.trim().toLowerCase()
  return templates.value.filter(t => {
    const matchesSearch =
      !kw ||
      t.title.toLowerCase().includes(kw) ||
      t.templateCode.toLowerCase().includes(kw) ||
      t.originalName.toLowerCase().includes(kw) ||
      t.description.toLowerCase().includes(kw)

    const matchesCategory = !selectedCategory.value || t.category === selectedCategory.value
    const matchesStatus =
      !selectedStatus.value ||
      (selectedStatus.value === 'Active' && t.status) ||
      (selectedStatus.value === 'Archived' && !t.status)

    return matchesSearch && matchesCategory && matchesStatus
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredTemplates.value.length / perPage.value)))
const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredTemplates.value.slice(start, start + perPage.value)
})
const showingFrom = computed(() => (filteredTemplates.value.length ? (currentPage.value - 1) * perPage.value + 1 : 0))
const showingTo = computed(() => Math.min(currentPage.value * perPage.value, filteredTemplates.value.length))

watch([search, selectedCategory, selectedStatus], () => {
  currentPage.value = 1
})
watch(totalPages, pages => {
  currentPage.value = Math.min(currentPage.value, pages)
})

const resetFilters = () => {
  search.value = ''
  selectedCategory.value = ''
  selectedStatus.value = ''
  currentPage.value = 1
}

// Modal state
const isModalOpen = ref(false)
const editingId = ref<number | null>(null)
const formTitle = ref('')
const formCode = ref('')
const formCategory = ref('')
const formDescription = ref('')
const formStatus = ref(true)
const existingFileName = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const templateToDelete = ref<EvaluationTemplateItem | null>(null)

const openCreateModal = () => {
  editingId.value = null
  formTitle.value = ''
  formCode.value = ''
  formCategory.value = categoryOptions.value[0] || ''
  formDescription.value = ''
  formStatus.value = true
  existingFileName.value = null
  selectedFile.value = null
  isModalOpen.value = true
}

// Category management modal state
const isCategoryModalOpen = ref(false)
const newCategoryName = ref('')
const categorySaving = ref(false)
const editingCategoryId = ref<number | null>(null)
const editingCategoryName = ref('')

const openCategoryModal = () => {
  newCategoryName.value = ''
  editingCategoryId.value = null
  editingCategoryName.value = ''
  isCategoryModalOpen.value = true
}

const handleCreateCategory = async () => {
  const name = newCategoryName.value.trim()
  if (!name || categorySaving.value) return
  categorySaving.value = true
  try {
    const res = await $api<{ data: EvaluationTemplateCategoryItem }>('/admin/evaluation-template-categories', {
      method: 'POST',
      body: { name },
    })
    newCategoryName.value = ''
    await load()
    if (isModalOpen.value && res.data?.name) {
      formCategory.value = res.data.name
    }
    toast.success('Category added', `"${name}" is now available.`)
  } catch (err: any) {
    const msg = Object.values(err?.data?.errors || {}).flat().join(' ') || err?.data?.message || 'Unable to add category.'
    toast.error('Unable to add category', msg)
  } finally {
    categorySaving.value = false
  }
}

const startEditCategory = (cat: EvaluationTemplateCategoryItem) => {
  editingCategoryId.value = cat.id
  editingCategoryName.value = cat.name
}

const cancelEditCategory = () => {
  editingCategoryId.value = null
  editingCategoryName.value = ''
}

const handleUpdateCategory = async (cat: EvaluationTemplateCategoryItem) => {
  const name = editingCategoryName.value.trim()
  if (!name || categorySaving.value) return
  categorySaving.value = true
  try {
    await $api(`/admin/evaluation-template-categories/${cat.id}`, {
      method: 'PUT',
      body: { name },
    })
    if (formCategory.value === cat.name) formCategory.value = name
    if (selectedCategory.value === cat.name) selectedCategory.value = name
    editingCategoryId.value = null
    editingCategoryName.value = ''
    await load()
    toast.success('Category updated', `Renamed to "${name}".`)
  } catch (err: any) {
    const msg = Object.values(err?.data?.errors || {}).flat().join(' ') || err?.data?.message || 'Unable to update category.'
    toast.error('Update failed', msg)
  } finally {
    categorySaving.value = false
  }
}

const handleDeleteCategory = async (cat: EvaluationTemplateCategoryItem) => {
  if (categorySaving.value) return
  categorySaving.value = true
  try {
    await $api(`/admin/evaluation-template-categories/${cat.id}`, { method: 'DELETE' })
    if (selectedCategory.value === cat.name) selectedCategory.value = ''
    await load()
    toast.success('Category deleted', `"${cat.name}" has been removed.`)
  } catch (err: any) {
    toast.error('Cannot delete category', err?.data?.message || 'Unable to delete category.')
  } finally {
    categorySaving.value = false
  }
}

const openEditModal = (tpl: EvaluationTemplateItem) => {
  editingId.value = tpl.id
  formTitle.value = tpl.title
  formCode.value = tpl.templateCode
  formCategory.value = tpl.category
  formDescription.value = tpl.description
  formStatus.value = tpl.status
  existingFileName.value = `${tpl.originalName} (${tpl.sizeLabel})`
  selectedFile.value = null
  isModalOpen.value = true
}

const closeModal = () => {
  if (saving.value) return
  isModalOpen.value = false
  selectedFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 20 * 1024 * 1024) {
    toast.error('File too large', 'Please upload a document up to 20 MB.')
    input.value = ''
    return
  }
  selectedFile.value = file
}

const handleSave = async () => {
  if (saving.value) return
  if (!formTitle.value.trim()) {
    toast.error('Title required', 'Please enter a template title.')
    return
  }
  if (!editingId.value && !selectedFile.value) {
    toast.error('Document required', 'Please attach a document file to store as a template.')
    return
  }

  saving.value = true
  try {
    const body = new FormData()
    body.append('title', formTitle.value.trim())
    body.append('template_code', formCode.value.trim())
    body.append('category', formCategory.value)
    body.append('description', formDescription.value.trim())
    body.append('status', formStatus.value ? '1' : '0')
    if (selectedFile.value) {
      body.append('document', selectedFile.value)
    }

    if (editingId.value) {
      body.append('_method', 'PUT')
      await $api(`/admin/evaluation-templates/${editingId.value}`, { method: 'POST', body })
      toast.success('Template updated', 'Document template has been updated.')
    } else {
      await $api('/admin/evaluation-templates', { method: 'POST', body })
      toast.success('Template uploaded', 'Document template is now stored and ready to download.')
    }

    await load()
    saving.value = false
    closeModal()
  } catch (err: any) {
    const msg = Object.values(err?.data?.errors || {}).flat().join(' ') || err?.data?.message || 'Unable to save document template.'
    toast.error('Save failed', msg)
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (tpl: EvaluationTemplateItem) => {
  try {
    const body = new FormData()
    body.append('_method', 'PUT')
    body.append('title', tpl.title)
    body.append('template_code', tpl.templateCode)
    body.append('category', tpl.category)
    body.append('description', tpl.description || '')
    body.append('status', tpl.status ? '0' : '1')
    await $api(`/admin/evaluation-templates/${tpl.id}`, { method: 'POST', body })
    await load()
    toast.success('Status updated', `${tpl.title} is now ${tpl.status ? 'Archived' : 'Active'}.`)
  } catch (err: any) {
    toast.error('Unable to update status', err?.data?.message || 'Please try again.')
  }
}

const downloadTemplate = async (tpl: EvaluationTemplateItem) => {
  try {
    const blob = await $api<Blob>(`/admin/evaluation-templates/${tpl.id}/download`, { responseType: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = tpl.originalName
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch {
    toast.error('Download failed', 'Unable to download this document template.')
  }
}

const confirmDelete = async () => {
  if (!templateToDelete.value || deleting.value) return
  deleting.value = true
  try {
    await $api(`/admin/evaluation-templates/${templateToDelete.value.id}`, { method: 'DELETE' })
    toast.success('Template deleted', `${templateToDelete.value.title} has been removed.`)
    templateToDelete.value = null
    await load()
  } catch (err: any) {
    toast.error('Delete failed', err?.data?.message || 'Unable to delete document template.')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <section class="templates-page">
    <PageHeader
      title="Evaluation Templates"
      description="Store, organize, and download official evaluation document templates (PDF, Word, Excel) for HR reviews."
    >
      <div class="header-actions">
        <AppButton variant="secondary" :icon="Tag" @click="openCategoryModal">
          Manage Categories
        </AppButton>
        <AppButton :icon="Plus" @click="openCreateModal">
          Upload Template
        </AppButton>
      </div>
    </PageHeader>

    <p v-if="loading" class="status-banner" role="status">Loading document templates…</p>
    <p v-else-if="errorMessage" class="error-banner" role="alert">
      {{ errorMessage }}
      <button type="button" class="retry-btn" @click="load">Retry</button>
    </p>

    <!-- STATS GRID -->
    <div class="stats-grid">
      <StatCard
        label="Total Templates"
        :value="stats.total"
        description="Stored evaluation documents"
        :icon="FileText"
        tone="blue"
      />
      <StatCard
        label="Active Templates"
        :value="stats.active"
        description="Available for HR use"
        :icon="CheckCircle2"
        tone="green"
      />
      <StatCard
        label="Archived"
        :value="stats.archived"
        description="Older or inactive versions"
        :icon="Archive"
        tone="orange"
      />
      <StatCard
        label="Categories"
        :value="stats.categories"
        description="Distinct template categories"
        :icon="FolderKanban"
        tone="purple"
      />
    </div>

    <!-- FILTERS -->
    <div class="filters-card">
      <div class="filters-grid">
        <AppInput
          v-model="search"
          searchable
          placeholder="Search template title, code, or filename..."
        />
        <AppSelect
          v-model="selectedCategory"
          :options="allCategories"
          placeholder="All Categories"
        />
        <AppSelect
          v-model="selectedStatus"
          :options="statusOptions"
          placeholder="All Status"
        />
        <AppButton variant="secondary" :icon="RotateCcw" @click="resetFilters">
          Reset
        </AppButton>
      </div>
    </div>

    <!-- TABLE CARD -->
    <article class="table-card">
      <div class="table-heading">
        <div>
          <h3>Document Template Repository</h3>
          <p>Download ready-to-use forms or upload updated revisions.</p>
        </div>
        <span class="record-count">
          {{ filteredTemplates.length }}
          {{ filteredTemplates.length === 1 ? 'Template' : 'Templates' }}
        </span>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Template</th>
              <th>Category</th>
              <th>Document File</th>
              <th>Status</th>
              <th>Updated</th>
              <th class="actions-heading">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedTemplates.length === 0">
              <td colspan="6">
                <div class="empty-state">
                  <div class="empty-icon">
                    <FileText :size="24" />
                  </div>
                  <strong>No document templates found</strong>
                  <span>Click "Upload Template" to store your first evaluation document.</span>
                </div>
              </td>
            </tr>
            <tr v-for="tpl in paginatedTemplates" :key="tpl.id">
              <td>
                <div class="tpl-info">
                  <div class="tpl-title-row">
                    <strong class="tpl-title">{{ tpl.title }}</strong>
                    <span class="code-pill">{{ tpl.templateCode }}</span>
                  </div>
                  <p v-if="tpl.description" class="tpl-desc">{{ tpl.description }}</p>
                </div>
              </td>
              <td>
                <span class="category-pill">{{ tpl.category }}</span>
              </td>
              <td>
                <div class="file-cell">
                  <span class="ext-badge">{{ tpl.fileExtension }}</span>
                  <div class="file-meta">
                    <strong class="file-name" :title="tpl.originalName">{{ tpl.originalName }}</strong>
                    <span class="file-size">{{ tpl.sizeLabel }}</span>
                  </div>
                </div>
              </td>
              <td>
                <button
                  type="button"
                  class="status-badge cursor-pointer"
                  :class="tpl.status ? 'completed' : 'on-hold'"
                  title="Click to toggle Active / Archived"
                  @click="toggleStatus(tpl)"
                >
                  <span class="status-dot" />
                  {{ tpl.status ? 'Active' : 'Archived' }}
                </button>
              </td>
              <td>
                <span class="meta-date">{{ tpl.updatedAt || tpl.createdAt || '—' }}</span>
                <span class="meta-author">{{ tpl.uploadedBy }}</span>
              </td>
              <td class="actions-cell">
                <div class="actions-group">
                  <button
                    type="button"
                    class="action-btn"
                    title="Download Document Template"
                    @click="downloadTemplate(tpl)"
                  >
                    <Download :size="14" />
                    <span>Download</span>
                  </button>
                  <button
                    type="button"
                    class="action-icon-btn edit"
                    title="Edit Template"
                    @click="openEditModal(tpl)"
                  >
                    <Edit2 :size="15" />
                  </button>
                  <button
                    type="button"
                    class="action-icon-btn delete"
                    title="Delete Template"
                    @click="templateToDelete = tpl"
                  >
                    <Trash2 :size="15" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <p>
          Showing
          <strong>{{ showingFrom }}–{{ showingTo }}</strong>
          of
          <strong>{{ filteredTemplates.length }}</strong>
          templates
        </p>
        <AppPagination v-model="currentPage" :total-pages="totalPages" />
      </div>
    </article>

    <!-- UPLOAD / EDIT MODAL -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
        <section class="modal-dialog" role="dialog" aria-modal="true">
          <header class="dialog-header">
            <div class="dialog-header-left">
              <span class="header-icon">
                <FileText :size="20" />
              </span>
              <div>
                <h2>{{ editingId ? 'Edit Document Template' : 'Upload Document Template' }}</h2>
                <p>Store official evaluation forms for HR and managers.</p>
              </div>
            </div>
            <button type="button" class="close-icon" aria-label="Close" :disabled="saving" @click="closeModal">
              <X :size="19" />
            </button>
          </header>

          <div class="dialog-body">
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Template Title *</label>
                <input
                  v-model="formTitle"
                  type="text"
                  class="form-input"
                  placeholder="e.g. 6th Month Regularization Evaluation Form"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Template Code (optional)</label>
                <input
                  v-model="formCode"
                  type="text"
                  class="form-input"
                  placeholder="Auto-generated if blank"
                />
              </div>
            </div>

            <div class="form-group">
              <div class="label-with-action">
                <label class="form-label">Category *</label>
                <button type="button" class="inline-manage-btn" @click="openCategoryModal">
                  + Add / Edit Categories
                </button>
              </div>
              <select v-model="formCategory" class="form-input">
                <option value="" disabled>Select a category</option>
                <option v-for="cat in allCategories" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Description / Usage Notes</label>
              <textarea
                v-model="formDescription"
                rows="3"
                class="form-textarea"
                placeholder="Describe when HR should use this document template..."
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                {{ editingId ? 'Replace Document File (optional)' : 'Document File (PDF, Word, Excel, Image up to 20 MB) *' }}
              </label>
              <input
                ref="fileInputRef"
                type="file"
                class="hidden-file-input"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                @change="handleFileSelect"
              />
              <button type="button" class="upload-dropzone" @click="fileInputRef?.click()">
                <UploadCloud :size="22" class="text-primary" />
                <span v-if="selectedFile">
                  Selected: <strong>{{ selectedFile.name }}</strong>
                </span>
                <span v-else-if="existingFileName">
                  Current file: <strong>{{ existingFileName }}</strong> · Click to replace
                </span>
                <span v-else>
                  Click to choose a document template (.pdf, .docx, .xlsx, .png, .jpg)
                </span>
              </button>
            </div>

            <div class="form-group-checkbox">
              <label class="checkbox-label">
                <input v-model="formStatus" type="checkbox" class="styled-checkbox" />
                <span>Active Template (available for download)</span>
              </label>
            </div>
          </div>

          <footer class="dialog-footer">
            <AppButton variant="secondary" :disabled="saving" @click="closeModal">Cancel</AppButton>
            <AppButton variant="primary" :disabled="saving" @click="handleSave">
              {{ saving ? 'Saving…' : editingId ? 'Update Template' : 'Upload & Save' }}
            </AppButton>
          </footer>
        </section>
      </div>
    </Teleport>

    <!-- DELETE CONFIRMATION MODAL -->
    <Teleport to="body">
      <div v-if="templateToDelete" class="modal-overlay" @click.self="!deleting && (templateToDelete = null)">
        <section class="modal-dialog modal-dialog-sm" role="dialog" aria-modal="true">
          <header class="dialog-header">
            <div class="dialog-header-left">
              <span class="header-icon danger">
                <Trash2 :size="20" />
              </span>
              <div>
                <h2>Delete Document Template</h2>
                <p>{{ templateToDelete.title }}</p>
              </div>
            </div>
            <button type="button" class="close-icon" aria-label="Close" :disabled="deleting" @click="templateToDelete = null">
              <X :size="19" />
            </button>
          </header>
          <div class="dialog-body">
            <p class="confirm-text">
              Are you sure you want to permanently delete <strong>{{ templateToDelete.title }}</strong> ({{ templateToDelete.originalName }})?
            </p>
          </div>
          <footer class="dialog-footer">
            <AppButton variant="secondary" :disabled="deleting" @click="templateToDelete = null">Cancel</AppButton>
            <AppButton variant="danger" :disabled="deleting" @click="confirmDelete">
              {{ deleting ? 'Deleting…' : 'Delete Template' }}
            </AppButton>
          </footer>
        </section>
      </div>
    </Teleport>

    <!-- MANAGE CATEGORIES MODAL -->
    <Teleport to="body">
      <div v-if="isCategoryModalOpen" class="modal-overlay" @click.self="!categorySaving && (isCategoryModalOpen = false)">
        <section class="modal-dialog modal-dialog-md" role="dialog" aria-modal="true">
          <header class="dialog-header">
            <div class="dialog-header-left">
              <span class="header-icon">
                <Tag :size="20" />
              </span>
              <div>
                <h2>Manage Template Categories</h2>
                <p>Add, rename, or remove categories used by evaluation templates.</p>
              </div>
            </div>
            <button
              type="button"
              class="close-icon"
              aria-label="Close"
              :disabled="categorySaving"
              @click="isCategoryModalOpen = false"
            >
              <X :size="19" />
            </button>
          </header>

          <div class="dialog-body">
            <form class="add-category-row" @submit.prevent="handleCreateCategory">
              <input
                v-model="newCategoryName"
                type="text"
                class="form-input"
                placeholder="New category name (e.g. 90-Day Review)..."
                maxlength="100"
              />
              <AppButton type="submit" :icon="Plus" :disabled="categorySaving || !newCategoryName.trim()">
                Add
              </AppButton>
            </form>

            <div class="category-list">
              <p v-if="!categories.length" class="empty-categories">No categories yet. Add one above.</p>
              <div v-for="cat in categories" :key="cat.id" class="category-row">
                <template v-if="editingCategoryId === cat.id">
                  <input
                    v-model="editingCategoryName"
                    type="text"
                    class="form-input category-edit-input"
                    maxlength="100"
                    @keyup.enter="handleUpdateCategory(cat)"
                    @keyup.escape="cancelEditCategory"
                  />
                  <div class="category-row-actions">
                    <button
                      type="button"
                      class="action-icon-btn save"
                      title="Save"
                      :disabled="categorySaving || !editingCategoryName.trim()"
                      @click="handleUpdateCategory(cat)"
                    >
                      <Check :size="15" />
                    </button>
                    <button
                      type="button"
                      class="action-icon-btn"
                      title="Cancel"
                      :disabled="categorySaving"
                      @click="cancelEditCategory"
                    >
                      <X :size="15" />
                    </button>
                  </div>
                </template>
                <template v-else>
                  <div class="category-row-info">
                    <strong>{{ cat.name }}</strong>
                    <span class="cat-count">{{ cat.templatesCount }} {{ cat.templatesCount === 1 ? 'template' : 'templates' }}</span>
                  </div>
                  <div class="category-row-actions">
                    <button
                      type="button"
                      class="action-icon-btn edit"
                      title="Rename Category"
                      :disabled="categorySaving"
                      @click="startEditCategory(cat)"
                    >
                      <Edit2 :size="14" />
                    </button>
                    <button
                      type="button"
                      class="action-icon-btn delete"
                      :title="cat.templatesCount > 0 ? 'Reassign templates before deleting' : 'Delete Category'"
                      :disabled="categorySaving || cat.templatesCount > 0"
                      @click="handleDeleteCategory(cat)"
                    >
                      <Trash2 :size="14" />
                    </button>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <footer class="dialog-footer">
            <AppButton variant="secondary" :disabled="categorySaving" @click="isCategoryModalOpen = false">
              Done
            </AppButton>
          </footer>
        </section>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.templates-page {
  width: 100%;
  max-width: 1680px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label-with-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.inline-manage-btn {
  border: 0;
  background: transparent;
  padding: 0;
  color: var(--primary);
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
}

.inline-manage-btn:hover {
  text-decoration: underline;
}

.modal-dialog-md {
  max-width: 520px;
}

.add-category-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.empty-categories {
  margin: 0;
  padding: 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 12px;
}

.category-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
}

.category-row-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.category-row-info strong {
  font-size: 12.5px;
  color: var(--text-primary);
}

.cat-count {
  font-size: 10.5px;
  color: var(--text-muted);
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--bg-card);
  border: 1px solid var(--border);
}

.category-row-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.category-edit-input {
  flex: 1;
}

.action-icon-btn.save:hover {
  border-color: #22c55e;
  color: #4ade80;
}

.action-icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.status-banner,
.error-banner {
  margin: 0 0 14px;
  padding: 10px 14px;
  border-radius: 9px;
  font-size: 12.5px;
}

.status-banner {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.error-banner {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #f87171;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.retry-btn {
  border: 1px solid currentColor;
  background: transparent;
  color: inherit;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.filters-card {
  margin-bottom: 14px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.filters-grid {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) 210px 160px auto;
  gap: 9px;
}

@media (max-width: 980px) {
  .filters-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.table-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.table-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 700;
}

.table-heading p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 11.5px;
}

.record-count {
  flex-shrink: 0;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 10.5px;
  font-weight: 650;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  padding: 12px 14px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

td {
  padding: 12px 14px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 12px;
  vertical-align: middle;
}

tbody tr:hover {
  background: var(--bg-card-soft);
}

.tpl-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tpl-title {
  color: var(--text-primary);
  font-size: 12.5px;
  font-weight: 700;
}

.code-pill {
  padding: 2px 7px;
  border-radius: 5px;
  background: var(--bg-card-soft);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 700;
}

.tpl-desc {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 11px;
  max-width: 360px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-pill {
  display: inline-block;
  padding: 4px 9px;
  border-radius: 6px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
}

.file-cell {
  display: flex;
  align-items: center;
  gap: 9px;
}

.ext-badge {
  padding: 4px 7px;
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.14);
  color: #60a5fa;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.file-meta {
  min-width: 0;
}

.file-name {
  display: block;
  max-width: 210px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
  font-size: 11.5px;
}

.file-size {
  display: block;
  color: var(--text-muted);
  font-size: 10.5px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 11px;
  font-weight: 700;
}

.status-badge.completed {
  background: rgba(34, 197, 94, 0.14);
  border-color: rgba(34, 197, 94, 0.35);
  color: #4ade80;
}

.status-badge.on-hold {
  background: rgba(245, 158, 11, 0.14);
  border-color: rgba(245, 158, 11, 0.35);
  color: #fbbf24;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.meta-date {
  display: block;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 11.5px;
}

.meta-author {
  display: block;
  color: var(--text-muted);
  font-size: 10.5px;
}

.actions-heading {
  text-align: right;
}

.actions-cell {
  text-align: right;
}

.actions-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
}

.action-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.action-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  cursor: pointer;
}

.action-icon-btn.edit:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.action-icon-btn.delete:hover {
  border-color: #ef4444;
  color: #f87171;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 36px 16px;
  color: var(--text-muted);
}

.empty-icon {
  display: flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--bg-card-soft);
  color: var(--primary);
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-top: 1px solid var(--border-soft);
  font-size: 12px;
  color: var(--text-muted);
}

.table-footer p {
  margin: 0;
}

/* MODALS */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(4px);
}

.modal-dialog {
  width: 100%;
  max-width: 580px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.modal-dialog-sm {
  max-width: 460px;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-soft);
}

.dialog-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  display: flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--primary-soft);
  color: var(--primary);
}

.header-icon.danger {
  background: rgba(239, 68, 68, 0.14);
  color: #f87171;
}

.dialog-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.dialog-header p {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--text-muted);
}

.close-icon {
  border: 0;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.dialog-body {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-input,
.form-textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 9px 11px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font: inherit;
  font-size: 12.5px;
}

.hidden-file-input {
  display: none;
}

.upload-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 18px 14px;
  border: 1.5px dashed var(--border);
  border-radius: 10px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
}

.upload-dropzone:hover {
  border-color: var(--primary);
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--text-secondary);
  cursor: pointer;
}

.confirm-text {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--border-soft);
}
</style>
