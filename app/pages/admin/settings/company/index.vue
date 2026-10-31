<script setup lang="ts">
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Globe,
  Landmark,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-vue-next'

import { useCompanyApi, type CompanyPayload, type CompanyRecord } from '~/composables/admin/useCompanyApi'

definePageMeta({ layout: 'admin' })

const router = useRouter()
const { success, error: toastError } = useToast()
const companyApi = useCompanyApi()

// STATE
const companies = ref<CompanyRecord[]>([])
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// SEARCH & FILTER
const search = ref('')
const filterStatus = ref('all')
const page = ref(1)
const perPage = 6

// MODAL STATE
const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const deletingId = ref<number | null>(null)

const form = reactive<CompanyPayload>({
  company_name: '',
  location: '',
  status: true,
})

// DROPDOWN
const openActionId = ref<number | null>(null)
const actionButtonRef = ref<HTMLElement | null>(null)
const actionPosition = ref({ top: 0, left: 0 })

const closeActions = () => {
  openActionId.value = null
  actionButtonRef.value = null
}

const updateActionPosition = () => {
  if (!actionButtonRef.value) return
  const rect = actionButtonRef.value.getBoundingClientRect()
  const menuWidth = 190
  const menuHeight = 90
  const gap = 6

  const left = Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8))
  const showAbove = rect.bottom + menuHeight + gap > window.innerHeight
  const top = showAbove ? rect.top - menuHeight - gap : rect.bottom + gap

  actionPosition.value = { top: Math.max(8, top), left }
}

const toggleActions = async (id: number, event: MouseEvent) => {
  if (openActionId.value === id) {
    closeActions()
    return
  }
  actionButtonRef.value = event.currentTarget as HTMLElement
  openActionId.value = id
  await nextTick()
  updateActionPosition()
}

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null
  if (!target) return
  if (actionButtonRef.value?.contains(target)) return
  if (target.closest('.cw-action-dropdown')) return
  closeActions()
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return
  closeActions()
  modalOpen.value = false
  deletingId.value = null
}

// FETCH
const fetchCompanies = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await companyApi.getCompanies()
    companies.value = res.data ?? []
  } catch (err: unknown) {
    const data = (err as { data?: { message?: string } })?.data
    errorMessage.value = data?.message || 'Unable to load company records.'
  } finally {
    loading.value = false
  }
}

// COMPUTED TABLE DATA
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return companies.value.filter((item) => {
    const matchesSearch =
      !q ||
      item.company_name.toLowerCase().includes(q) ||
      (item.location && item.location.toLowerCase().includes(q))

    const matchesStatus =
      filterStatus.value === 'all' ||
      (filterStatus.value === 'active' ? item.status : !item.status)

    return matchesSearch && matchesStatus
  })
})

const activeCount = computed(() => companies.value.filter((c) => c.status).length)

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))

const visibleRows = computed(() => {
  const start = (page.value - 1) * perPage
  return filtered.value.slice(start, start + perPage)
})

const paginationStart = computed(() => (filtered.value.length === 0 ? 0 : (page.value - 1) * perPage + 1))
const paginationEnd = computed(() => Math.min(page.value * perPage, filtered.value.length))

const pageNumbers = computed(() => {
  const total = totalPages.value
  const maxVisible = 5
  const start = Math.max(1, Math.min(page.value - 2, total - maxVisible + 1))
  const end = Math.min(total, start + maxVisible - 1)
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

// WATCHERS
watch([search, filterStatus], () => {
  page.value = 1
  closeActions()
})

watch(page, () => {
  closeActions()
})

// FORM ACTIONS
const openAddModal = () => {
  closeActions()
  editingId.value = null
  form.company_name = ''
  form.location = ''
  form.status = true
  errorMessage.value = ''
  successMessage.value = ''
  modalOpen.value = true
}

const openEditModal = (record: CompanyRecord) => {
  closeActions()
  editingId.value = record.id
  form.company_name = record.company_name
  form.location = record.location ?? ''
  form.status = record.status ?? true
  errorMessage.value = ''
  successMessage.value = ''
  modalOpen.value = true
}

const editSelectedRecord = () => {
  const record = companies.value.find((c) => c.id === openActionId.value)
  if (!record) {
    closeActions()
    return
  }
  openEditModal(record)
}

const closeModal = () => {
  modalOpen.value = false
  editingId.value = null
  form.company_name = ''
  form.location = ''
}

const handleSave = async () => {
  if (!form.company_name.trim()) {
    errorMessage.value = 'Company name is required.'
    return
  }

  if (!form.location.trim()) {
    errorMessage.value = 'Headquarters location is required.'
    return
  }

  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const payload = {
      company_name: form.company_name.trim(),
      location: form.location.trim(),
      status: form.status,
    }

    if (editingId.value !== null) {
      await companyApi.updateCompany(editingId.value, payload)
      success('Company Updated', 'Company information updated successfully.')
    } else {
      await companyApi.createCompany(payload)
      success('Company Created', 'New company profile added successfully.')
    }

    closeModal()
    await fetchCompanies()
  } catch (err: unknown) {
    const data = (err as { data?: { message?: string; errors?: Record<string, string[]> } })?.data
    if (data?.errors) {
      errorMessage.value = Object.values(data.errors).flat()[0] || 'Validation error.'
    } else {
      errorMessage.value = data?.message || 'Failed to save company information.'
    }
    toastError('Save Failed', errorMessage.value)
  } finally {
    saving.value = false
  }
}

// DELETE
const confirmDelete = () => {
  if (openActionId.value === null) return
  deletingId.value = openActionId.value
  closeActions()
}

const handleDelete = async () => {
  if (deletingId.value === null) return
  const idToDelete = deletingId.value
  errorMessage.value = ''

  try {
    await companyApi.deleteCompany(idToDelete)
    success('Company Deleted', 'Company has been removed.')
    deletingId.value = null
    await fetchCompanies()
  } catch (err: unknown) {
    const data = (err as { data?: { message?: string } })?.data
    errorMessage.value = data?.message || 'Cannot delete this company.'
    toastError('Delete Failed', errorMessage.value)
  } finally {
    deletingId.value = null
    page.value = Math.min(page.value, totalPages.value)
  }
}

onMounted(async () => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleEscape)
  window.addEventListener('scroll', closeActions, true)
  window.addEventListener('resize', closeActions)
  await fetchCompanies()
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('scroll', closeActions, true)
  window.removeEventListener('resize', closeActions)
})
</script>

<template>
  <section class="cw">
    <!-- NOTICES -->
    <div v-if="errorMessage" class="cw-error-banner" role="alert">
      {{ errorMessage }}
    </div>

    <!-- PAGE HEADER -->
    <div class="cw-header">
      <div class="cw-header-info">
        <button
          type="button"
          class="cw-back-btn"
          aria-label="Back to Settings"
          @click="router.push('/admin/settings')"
        >
          <ArrowLeft :size="15" />
          <span>Back to Settings</span>
        </button>

        <div class="cw-eyebrow">
          <Landmark :size="14" />
          <span>ORGANIZATION CONFIGURATION</span>
        </div>

        <h1>Company Information</h1>
        <p>Register, configure, and manage multiple corporate subsidiaries and branch profiles.</p>
      </div>

      <div class="cw-header-actions">
        <button
          type="button"
          class="cw-btn cw-primary"
          @click="openAddModal"
        >
          <Plus :size="16" />
          <span>Add Company</span>
        </button>
      </div>
    </div>

    <!-- SUMMARY STATS CARDS -->
    <div class="cw-stats">
      <div class="cw-stat">
        <span>Total Companies</span>
        <strong>{{ companies.length }}</strong>
        <small>Configured corporate entities</small>
      </div>

      <div class="cw-stat">
        <span>Active Companies</span>
        <strong>{{ activeCount }}</strong>
        <small class="cw-green">
          <CheckCircle2 :size="13" />
          Currently operating
        </small>
      </div>

      <div class="cw-stat">
        <span>Inactive Companies</span>
        <strong>{{ companies.length - activeCount }}</strong>
        <small>Suspended or archived</small>
      </div>
    </div>

    <!-- DIRECTORY PANEL -->
    <div class="cw-panel">
      <div class="cw-panel-head">
        <h2>Company Directory</h2>
        <p>View and manage registered organizations, operational locations, and associated units.</p>
      </div>

      <!-- TOOLBAR -->
      <div class="cw-toolbar">
        <div class="cw-search">
          <Search :size="17" />
          <input
            v-model="search"
            type="text"
            placeholder="Search companies by name or location..."
            aria-label="Search company records"
          />
        </div>

        <div class="cw-filter">
          <Filter :size="15" />
          <select v-model="filterStatus" aria-label="Filter by status">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <!-- TABLE -->
      <div class="cw-overflow">
        <table class="cw-table">
          <thead>
            <tr>
              <th scope="col">Company Name</th>
              <th scope="col">Headquarters / Location</th>
              <th scope="col">Departments</th>
              <th scope="col">Assigned Workforce</th>
              <th scope="col">Payroll Periods</th>
              <th scope="col">Status</th>
              <th scope="col" class="cw-actions-heading">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in visibleRows" :key="item.id">
              <td>
                <div class="company-name-cell">
                  <div class="company-icon-box">
                    <Building2 :size="16" />
                  </div>
                  <div>
                    <strong class="company-name-title">{{ item.company_name }}</strong>
                    <small v-if="item.admin?.name" class="company-admin-sub">Owner: {{ item.admin.name }}</small>
                  </div>
                </div>
              </td>

              <td>
                <div class="location-cell">
                  <MapPin :size="14" class="loc-icon" />
                  <span>{{ item.location || '—' }}</span>
                </div>
              </td>

              <td>
                <span class="count-badge">
                  {{ item.departments_count ?? 0 }} departments
                </span>
              </td>

              <td>
                <div class="workforce-cell">
                  <Users :size="14" class="loc-icon" />
                  <span>{{ item.employees_count ?? 0 }} staff</span>
                </div>
              </td>

              <td>
                <span class="count-badge">
                  {{ item.payroll_periods_count ?? 0 }} cutoffs
                </span>
              </td>

              <td>
                <span
                  class="cw-pill"
                  :class="item.status ? 'cw-active' : 'cw-inactive'"
                >
                  <span class="cw-status-dot" />
                  {{ item.status ? 'Active' : 'Inactive' }}
                </span>
              </td>

              <td class="cw-actions-cell">
                <button
                  type="button"
                  class="cw-more-btn"
                  aria-label="Actions menu"
                  :aria-expanded="openActionId === item.id"
                  @click.stop="toggleActions(item.id, $event)"
                >
                  <MoreHorizontal :size="16" />
                </button>
              </td>
            </tr>

            <tr v-if="filtered.length === 0">
              <td colspan="7" class="cw-empty">
                {{ loading ? 'Loading company records...' : 'No company profiles found.' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- NUMBERED PAGINATION -->
    <div class="cw-pagination">
      <div class="cw-pagination-info">
        Showing
        <strong>{{ paginationStart }}–{{ paginationEnd }}</strong>
        of
        <strong>{{ filtered.length }}</strong>
        company records
      </div>

      <div class="cw-pagination-controls">
        <button
          type="button"
          class="cw-page-arrow"
          aria-label="Previous page"
          :disabled="page === 1"
          @click="page--"
        >
          <ChevronLeft :size="16" />
        </button>

        <button
          v-for="pageNumber in pageNumbers"
          :key="pageNumber"
          type="button"
          class="cw-page-number"
          :class="{ 'cw-page-active': page === pageNumber }"
          :aria-label="`Page ${pageNumber}`"
          :aria-current="page === pageNumber ? 'page' : undefined"
          @click="page = pageNumber"
        >
          {{ pageNumber }}
        </button>

        <button
          type="button"
          class="cw-page-arrow"
          aria-label="Next page"
          :disabled="page === totalPages"
          @click="page++"
        >
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>

    <!-- THREE-DOTS MENU -->
    <Teleport to="body">
      <div
        v-if="openActionId !== null"
        class="cw-action-dropdown"
        role="menu"
        :style="{ top: `${actionPosition.top}px`, left: `${actionPosition.left}px` }"
      >
        <button type="button" role="menuitem" @click="editSelectedRecord">
          <Pencil :size="15" />
          <span>Edit Company</span>
        </button>

        <button type="button" role="menuitem" class="cw-action-delete" @click="confirmDelete">
          <Trash2 :size="15" />
          <span>Delete Company</span>
        </button>
      </div>
    </Teleport>

    <!-- ADD / EDIT MODAL -->
    <Teleport to="body">
      <div v-if="modalOpen" class="cw-backdrop" @click.self="closeModal">
        <div
          class="cw-modal"
          role="dialog"
          aria-modal="true"
          :aria-label="editingId === null ? 'Add Company' : 'Edit Company'"
        >
          <div class="cw-modal-head">
            <div>
              <h2>{{ editingId === null ? 'Add New Company' : 'Edit Company Profile' }}</h2>
              <p>Configure corporate name, headquarters location, and operational status.</p>
            </div>

            <button type="button" class="cw-x" aria-label="Close modal" @click="closeModal">
              <X :size="20" />
            </button>
          </div>

          <form @submit.prevent="handleSave">
            <div class="cw-fields">
              <label class="full-col">
                <span>Company Name <b>*</b></span>
                <input
                  v-model="form.company_name"
                  type="text"
                  required
                  placeholder="e.g. R Work Central Inc."
                  :disabled="saving"
                />
              </label>

              <label class="full-col">
                <span>Headquarters / Location <b>*</b></span>
                <input
                  v-model="form.location"
                  type="text"
                  required
                  placeholder="e.g. Metro Manila, Philippines"
                  :disabled="saving"
                />
              </label>

              <label class="full-col">
                <span>Operational Status <b>*</b></span>
                <select v-model="form.status" :disabled="saving">
                  <option :value="true">Active — Currently Operating</option>
                  <option :value="false">Inactive — Suspended</option>
                </select>
              </label>
            </div>

            <div class="cw-modal-footer">
              <button type="button" class="cw-btn cw-outline" :disabled="saving" @click="closeModal">
                Cancel
              </button>

              <button type="submit" class="cw-btn cw-primary" :disabled="saving">
                {{ saving ? 'Saving...' : editingId === null ? 'Create Company' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- DELETE CONFIRMATION -->
    <Teleport to="body">
      <div v-if="deletingId !== null" class="cw-backdrop" @click.self="deletingId = null">
        <div class="cw-confirm" role="dialog" aria-modal="true" aria-label="Delete confirmation">
          <h2>Delete this company?</h2>
          <p>
            This will permanently remove the company entity from the database. Note that companies with existing departments or employees cannot be deleted.
          </p>

          <div class="cw-modal-footer">
            <button type="button" class="cw-btn cw-outline" @click="deletingId = null">
              Cancel
            </button>
            <button type="button" class="cw-btn cw-delete" @click="handleDelete">
              Delete Company
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.cw-error-banner {
  padding: 12px;
  margin-bottom: 14px;
  border: 1px solid var(--red);
  border-radius: 8px;
  background: color-mix(in srgb, var(--red) 10%, var(--bg-card));
  color: var(--red);
  font-size: 11px;
}

.cw-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 12px;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cw-back-btn:hover {
  background: var(--bg-card-soft);
  color: var(--primary);
  border-color: var(--primary);
}

.cw {
  width: 100%;
  max-width: 1700px;
  margin: 0 auto;
  color: var(--text-primary, #172033);
}

.cw-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 18px;
  margin-bottom: 24px;
}

.cw-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 10px;
  color: var(--primary, #246bfd);
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 1px;
}

.cw h1 {
  margin: 0 0 6px;
  font-size: 27px;
  font-weight: 750;
  line-height: 1.25;
}

.cw h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.cw p {
  margin: 5px 0 0;
  font-size: 12px;
  color: var(--text-secondary, #667085);
}

.cw-header-actions {
  display: flex;
  align-items: center;
  gap: 9px;
}

.cw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 14px;
  border: 1px solid transparent;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
  cursor: pointer;
}

.cw-primary {
  background: #246bfd;
  color: #ffffff;
}

.cw-primary:hover {
  background: #1657dd;
}

.cw-outline {
  border-color: var(--border, #e6eaf0);
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
}

.cw-outline:hover {
  background: var(--bg-card-soft, #f8fafc);
}

/* STATS */
.cw-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.cw-stat {
  padding: 19px 21px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 12px;
  background: var(--bg-card, #ffffff);
  box-shadow: var(--shadow, none);
}

.cw-stat > span {
  display: block;
  color: var(--text-secondary, #667085);
  font-size: 12px;
}

.cw-stat strong {
  display: block;
  margin: 8px 0 2px;
  font-size: 29px;
  line-height: 1.3;
}

.cw-stat small {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-muted, #98a2b3);
  font-size: 11px;
}

.cw-green {
  color: #16a663 !important;
}

/* PANEL */
.cw-panel {
  overflow: hidden;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 12px;
  background: var(--bg-card, #ffffff);
}

.cw-panel-head {
  padding: 19px 20px 14px;
  border-bottom: 1px solid var(--border, #e6eaf0);
}

.cw-panel-head h2 {
  font-size: 14px;
  font-weight: 700;
}

.cw-panel-head p {
  margin-top: 5px;
  font-size: 11px;
}

/* TOOLBAR */
.cw-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px 18px;
}

.cw-search {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 1 340px;
  width: 340px;
  max-width: 100%;
  min-width: 0;
  height: 39px;
  padding: 0 12px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 8px;
  background: var(--bg-card-soft, #f8fafc);
  color: var(--text-secondary, #667085);
  transition: border-color 0.2s ease;
}

.cw-search:focus-within {
  border-color: #246bfd;
}

.cw-search input {
  width: 100%;
  min-width: 0;
  flex: 1;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary, #172033);
  font-size: 12px;
}

.cw-search input::placeholder {
  color: var(--text-muted, #98a2b3);
}

.cw-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 39px;
  padding: 0 12px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 8px;
  background: var(--bg-card-soft, #f8fafc);
  color: var(--text-secondary, #667085);
}

.cw-filter select {
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary, #172033);
  font-size: 12px;
  cursor: pointer;
  color-scheme: light dark;
}

.cw-filter select option {
  background-color: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
}

/* TABLE */
.cw-overflow {
  width: 100%;
  overflow-x: auto;
}

.cw-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  white-space: nowrap;
  text-align: left;
  font-size: 12px;
}

.cw-table thead th {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border, #e6eaf0);
  background: var(--bg-card-soft, #f8fafc);
  color: var(--text-secondary, #667085);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.25px;
  text-transform: uppercase;
}

.cw-table tbody td {
  height: 68px;
  padding: 18px 16px;
  border-bottom: 1px solid var(--border, #e6eaf0);
  color: var(--text-primary, #172033);
  font-size: 12px;
  vertical-align: middle;
}

.cw-table tbody tr {
  transition: background-color 0.2s ease;
}

.cw-table tbody tr:hover td {
  background: var(--bg-card-soft, #f8fafc);
}

.cw-table tbody tr:last-child td {
  border-bottom: none;
}

.company-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.company-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: rgba(36, 107, 253, 0.1);
  color: var(--primary);
  flex-shrink: 0;
}

.company-name-title {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.company-admin-sub {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
}

.location-cell,
.workforce-cell {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--text-primary);
  font-size: 12px;
}

.loc-icon {
  color: var(--primary);
}

.count-badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--bg-card-soft);
  border: 1px solid var(--border);
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}

/* PILL */
.cw-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 6px 11px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
}

.cw-status-dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
  background: currentColor;
}

.cw-active {
  background: rgba(22, 163, 74, 0.14);
  color: #16a34a;
}

.cw-inactive {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

/* ACTIONS */
.cw-actions-heading,
.cw-actions-cell {
  width: 85px;
  text-align: center !important;
}

.cw-more-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 9px;
  background: transparent;
  color: var(--text-secondary, #667085);
  cursor: pointer;
  transition: all 0.2s ease;
}

.cw-more-btn:hover,
.cw-more-btn[aria-expanded='true'] {
  border-color: #246bfd;
  background: rgba(36, 107, 253, 0.08);
  color: #246bfd;
}

.cw-empty {
  padding: 45px 20px !important;
  color: var(--text-secondary, #667085);
  font-size: 12px;
  text-align: center;
}

/* PAGINATION */
.cw-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 2px;
}

.cw-pagination-info {
  color: var(--text-secondary, #667085);
  font-size: 11px;
}

.cw-pagination-info strong {
  color: var(--text-primary, #172033);
  font-weight: 600;
}

.cw-pagination-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cw-page-arrow,
.cw-page-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 8px;
  background: var(--bg-card, #ffffff);
  color: var(--text-secondary, #667085);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cw-page-arrow:hover:not(:disabled),
.cw-page-number:hover:not(.cw-page-active) {
  border-color: #246bfd;
  color: #246bfd;
}

.cw-page-active {
  border-color: #246bfd;
  background: #246bfd;
  color: #ffffff;
  font-weight: 700;
}

.cw-page-arrow:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .cw h1 {
    font-size: 23px;
  }
  .cw-header-actions {
    width: 100%;
  }
  .cw-stats {
    grid-template-columns: 1fr;
  }
}
</style>

<style>
.full-col {
  grid-column: 1 / -1;
}

.cw-action-dropdown {
  position: fixed;
  z-index: 9999;
  min-width: 190px;
  padding: 7px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 12px;
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.2);
}

.cw-action-dropdown button {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-primary, #172033);
  font-size: 12px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
}

.cw-action-dropdown button:hover {
  background: var(--bg-card-soft, #f8fafc);
}

.cw-action-dropdown .cw-action-delete {
  color: #ef4444;
}

.cw-action-dropdown .cw-action-delete:hover {
  background: rgba(239, 68, 68, 0.08);
}

.cw-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(5, 15, 30, 0.55);
}

.cw-modal,
.cw-confirm {
  width: min(580px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 15px;
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
  box-shadow: 0 20px 70px rgba(0, 0, 0, 0.27);
}

.cw-confirm {
  max-width: 420px;
}

.cw-modal h2,
.cw-confirm h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
}

.cw-modal p,
.cw-confirm p {
  margin-top: 7px;
  color: var(--text-secondary, #667085);
  font-size: 12px;
}

.cw-modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 20px;
}

.cw-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 7px;
  background: var(--bg-card, #ffffff);
  color: var(--text-secondary, #667085);
  cursor: pointer;
}

.cw-fields {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.cw-fields label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.cw-fields label > span {
  font-size: 11px;
  font-weight: 650;
}

.cw-fields label b {
  color: #ef4444;
}

.cw-fields input,
.cw-fields select {
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
  padding: 11px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 8px;
  outline: none;
  background: var(--bg-card-soft, #f8fafc);
  color: var(--text-primary, #172033);
  font-size: 12px;
  color-scheme: light dark;
}

.cw-fields select option {
  background-color: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
}

.cw-fields input:focus,
.cw-fields select:focus {
  border-color: #246bfd;
}

.cw-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 24px;
}

.cw-modal-footer .cw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 14px;
  border: 1px solid transparent;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}

.cw-modal-footer .cw-primary {
  background: #246bfd;
  color: #ffffff;
}

.cw-modal-footer .cw-primary:hover {
  background: #1657dd;
}

.cw-modal-footer .cw-outline {
  border-color: var(--border, #e6eaf0);
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
}

.cw-modal-footer .cw-outline:hover {
  background: var(--bg-card-soft, #f8fafc);
}

.cw-modal-footer .cw-delete {
  background: #dc2626;
  color: #ffffff;
}

.cw-modal-footer .cw-delete:hover {
  background: #b91c1c;
}
</style>
