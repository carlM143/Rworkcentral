<script setup lang="ts">
import { Download, Plus, X, BriefcaseBusiness, FileSpreadsheet, FileText, Table2, Save } from 'lucide-vue-next'
import type { Position, PositionFormData } from '~/types/position'
import { usePositions } from '../../composables/departments/positions/usePositions'
import PositionStats from '../../components/departments/positions/PositionStats.vue'
import PositionFilters from '../../components/departments/positions/PositionFilters.vue'
import PositionTable from '../../components/departments/positions/PositionTable.vue'
import BaseTableFooter from '../../components/shared-table/BaseTableFooter.vue'

const {
  positions, departments, search, department, status, currentPage,
  filteredPositions, paginatedPositions, totalPages, showingFrom, showingTo,
  stats, departmentOptions, statusOptions, loading, saving, errorMessage,
  loadPositions, savePosition, removePosition, resetFilters,
} = usePositions()

const { success, error: showError } = useToast()

const showForm = ref(false)
const showExport = ref(false)
const editingId = ref<number | null>(null)
const exportFormat = ref<'excel' | 'pdf' | 'csv'>('excel')
const error = ref('')

const form = reactive<PositionFormData>({
  departmentId: null,
  name: '',
  description: '',
  status: 'Active',
})

const formats = [
  { value: 'excel' as const, label: 'Excel', icon: FileSpreadsheet, description: 'Best for HR position reports and analysis.' },
  { value: 'pdf' as const, label: 'PDF', icon: FileText, description: 'Printable position directory.' },
  { value: 'csv' as const, label: 'CSV', icon: Table2, description: 'Raw position data for external processing.' },
]

const getErrorMessage = (problem: any): string => {
  const validation = Object.values(problem?.data?.errors ?? {}).flat()[0]
  return String(validation || problem?.data?.message || problem?.message || 'Something went wrong.')
}

const refreshPositions = async () => {
  try {
    await loadPositions()
  } catch (problem) {
    showError('Failed to Load Positions', getErrorMessage(problem))
  }
}

const openAdd = () => {
  editingId.value = null
  error.value = ''
  Object.assign(form, { departmentId: null, name: '', description: '', status: 'Active' })
  showForm.value = true
}

const openEdit = (item: Position) => {
  editingId.value = item.id
  error.value = ''
  Object.assign(form, {
    departmentId: item.departmentId,
    name: item.name,
    description: item.description,
    status: item.status,
  })
  showForm.value = true
}

const closeForm = () => {
  if (saving.value) return
  showForm.value = false
  error.value = ''
}

const submitPosition = async () => {
  if (saving.value) return
  error.value = ''

  try {
    const response = await savePosition({ ...form }, editingId.value ?? undefined)
    showForm.value = false
    editingId.value = null
    success('Position Saved', response.message)
  } catch (problem) {
    error.value = getErrorMessage(problem)
    showError('Unable to Save Position', error.value)
  }
}

const handleDelete = async (item: Position) => {
  if (saving.value || !window.confirm(`Are you sure you want to delete "${item.name}"?`)) return

  try {
    const response = await removePosition(item.id)
    success('Position Deleted', response.message)
  } catch (problem) {
    showError('Unable to Delete Position', getErrorMessage(problem))
  }
}

const onEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeForm()
    showExport.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', onEscape)
  refreshPositions()
})

onBeforeUnmount(() => window.removeEventListener('keydown', onEscape))
</script>

<template>
  <section class="positions-page">

    <!-- HEADER -->
    <PageHeader title="Positions & Designations" description="Manage company job positions, department assignments, descriptions and status.">
      <div class="header-actions">
        <AppButton variant="secondary" :icon="Download" @click="exportFormat = 'excel'; showExport = true">Export</AppButton>
        <AppButton :icon="Plus" :disabled="loading || saving" @click="openAdd">Add Position</AppButton>
      </div>
    </PageHeader>

    <!-- LOADING / ERROR -->
    <p v-if="loading" class="pm-note" role="status">Loading positions...</p>

    <div v-if="errorMessage" class="page-error" role="alert">
      <p>{{ errorMessage }}</p>
      <button type="button" @click="refreshPositions">Retry</button>
    </div>

    <!-- STATISTICS -->
    <PositionStats :stats="stats" />

    <!-- FILTERS -->
    <PositionFilters
      v-model:search="search"
      v-model:department="department"
      v-model:status="status"
      :departments="departmentOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <!-- POSITIONS TABLE -->
    <PositionTable :positions="paginatedPositions" @edit="openEdit" @delete="handleDelete" />

    <!-- REUSABLE PAGINATION -->
    <BaseTableFooter
      v-model="currentPage"
      :showing-from="showingFrom"
      :showing-to="showingTo"
      :total-items="filteredPositions.length"
      :total-pages="totalPages"
      item-label="positions"
    />

    <!-- ADD / EDIT MODAL -->
    <Teleport to="body">
      <Transition name="pm-fade">
        <div v-if="showForm" class="pm-overlay" @click.self="closeForm">
          <section class="pm-dialog" role="dialog" aria-modal="true" aria-labelledby="position-form-title">

            <header class="pm-head">
              <div class="pm-title">
                <span class="pm-icon"><BriefcaseBusiness :size="19" /></span>
                <div>
                  <h2 id="position-form-title">{{ editingId === null ? 'Add New Position' : 'Edit Position' }}</h2>
                  <p>{{ editingId === null ? 'Create a new job position.' : 'Update position information.' }}</p>
                </div>
              </div>
              <button class="pm-close" type="button" aria-label="Close" :disabled="saving" @click="closeForm"><X :size="17" /></button>
            </header>

            <form @submit.prevent="submitPosition">
              <div class="pm-body">
                <h3>Position Information</h3>

                <div class="pm-grid">
                  <label>Position Title <span>*</span>
                    <input v-model.trim="form.name" required maxlength="255" placeholder="e.g. Web Developer" />
                  </label>

                  <label>Department <span>*</span>
                    <select v-model.number="form.departmentId" required>
                      <option :value="null" disabled>Select Department</option>
                      <option v-for="item in departments" :key="item.id" :value="item.id">{{ item.name }}</option>
                    </select>
                  </label>

                  <label>Status
                    <select v-model="form.status">
                      <option v-for="item in statusOptions" :key="item" :value="item">{{ item }}</option>
                    </select>
                  </label>

                  <label class="pm-full">Description <span>*</span>
                    <textarea v-model.trim="form.description" rows="4" required placeholder="Responsibilities and scope of this position..." />
                  </label>
                </div>

                <div class="pm-notice">
                  <strong>Position Assignment</strong>
                  <p>Each position belongs to one department. Position details and status will be saved directly to the Laravel database.</p>
                </div>

                <p v-if="!departments.length" class="pm-error">No departments available. Please create a department first.</p>
                <p v-if="error" class="pm-error" role="alert">{{ error }}</p>
              </div>

              <footer class="pm-footer">
                <button type="button" class="pm-btn pm-secondary" :disabled="saving" @click="closeForm">Cancel</button>
                <button type="submit" class="pm-btn pm-primary" :disabled="saving || !departments.length">
                  <Save :size="15" />
                  {{ saving ? 'Saving...' : editingId === null ? 'Save Position' : 'Save Changes' }}
                </button>
              </footer>
            </form>

          </section>
        </div>
      </Transition>
    </Teleport>

    <!-- EXPORT PREVIEW -->
    <Teleport to="body">
      <Transition name="pm-fade">
        <div v-if="showExport" class="pm-overlay" @click.self="showExport = false">
          <section class="pm-dialog" role="dialog" aria-modal="true" aria-labelledby="position-export-title">

            <header class="pm-head">
              <div class="pm-title">
                <span class="pm-icon"><Download :size="19" /></span>
                <div>
                  <h2 id="position-export-title">Export Positions</h2>
                  <p>Export position and department records.</p>
                </div>
              </div>
              <button class="pm-close" type="button" aria-label="Close" @click="showExport = false"><X :size="17" /></button>
            </header>

            <div class="pm-body">
              <div class="pm-stats">
                <div><span>Total</span><strong>{{ stats.totalPositions }}</strong></div>
                <div><span>Active</span><strong>{{ stats.activePositions }}</strong></div>
                <div><span>Inactive</span><strong>{{ stats.inactivePositions }}</strong></div>
                <div><span>Departments Used</span><strong>{{ stats.departmentsUsed }}</strong></div>
              </div>

              <h3>Export Format</h3>

              <div class="pm-formats">
                <button v-for="item in formats" :key="item.value" type="button" class="pm-format" :class="{ selected: exportFormat === item.value }" :aria-pressed="exportFormat === item.value" @click="exportFormat = item.value">
                  <component :is="item.icon" :size="19" />
                  <strong>{{ item.label }}</strong>
                  <span>{{ item.description }}</span>
                </button>
              </div>

              <div class="pm-notice">
                <strong>Included Data</strong>
                <p>Position ID, position title, department, description, status, creation date and last updated date.</p>
              </div>

              <p class="pm-note">UI preview only. No export will be generated yet.</p>
            </div>

            <footer class="pm-footer">
              <button type="button" class="pm-btn pm-secondary" @click="showExport = false">Cancel</button>
              <button type="button" class="pm-btn pm-primary" disabled>
                <Download :size="15" />
                Export {{ exportFormat === 'excel' ? 'Excel' : exportFormat.toUpperCase() }}
              </button>
            </footer>

          </section>
        </div>
      </Transition>
    </Teleport>

  </section>
</template>

<style scoped>
.positions-page{width:100%;max-width:1660px;margin:0 auto}
.header-actions{display:flex;align-items:center;gap:8px}
.page-error{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:14px;padding:12px;border:1px solid var(--red);border-radius:8px;background:var(--bg-card);color:var(--red);font-size:11px}
.page-error p{margin:0}
.page-error button{padding:8px 13px;border:1px solid var(--border);border-radius:7px;background:var(--bg-card-soft);color:var(--text-primary);cursor:pointer}
.pm-overlay{position:fixed;inset:0;z-index:9999;background:rgba(3,12,29,.78);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:20px}
.pm-dialog{width:100%;max-width:600px;max-height:90vh;overflow-y:auto;background:var(--bg-card);border:1px solid var(--border);border-radius:13px;box-shadow:0 25px 65px #0004}
.pm-head{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px;border-bottom:1px solid var(--border)}
.pm-title{display:flex;align-items:center;gap:10px}
.pm-icon{display:flex;align-items:center;justify-content:center;width:36px;height:36px;flex-shrink:0;border-radius:8px;background:var(--primary-soft);color:var(--primary)}
.pm-head h2{margin:0;font-size:13px;color:var(--text-primary)}
.pm-head p{margin:4px 0 0;color:var(--text-muted);font-size:9px}
.pm-close{border:1px solid var(--border);border-radius:7px;width:29px;height:29px;display:flex;align-items:center;justify-content:center;background:transparent;color:var(--text-secondary);cursor:pointer}
.pm-body{padding:17px}
.pm-body h3{font-size:11px;color:var(--text-primary);margin:0 0 12px}
.pm-body h3:not(:first-child){margin-top:20px}
.pm-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}
.pm-grid label{display:flex;flex-direction:column;gap:7px;font-size:10px;font-weight:600;color:var(--text-primary)}
.pm-grid label span{color:var(--red)}
.pm-full{grid-column:1/-1}
.pm-grid input,.pm-grid select,.pm-grid textarea{width:100%;min-height:38px;padding:9px 11px;border:1px solid var(--border);border-radius:8px;background:var(--bg-card-soft);color:var(--text-primary);outline:0;font-size:11px;font-family:inherit}
.pm-grid textarea{resize:vertical}
.pm-grid input:focus,.pm-grid select:focus,.pm-grid textarea:focus{border-color:var(--primary)}
.pm-notice{margin-top:15px;padding:12px;background:var(--bg-card-soft);border:1px solid var(--border);border-radius:8px}
.pm-notice strong{font-size:9px;color:var(--text-primary)}
.pm-notice p{margin:6px 0 0;color:var(--text-muted);font-size:9px;line-height:1.6}
.pm-error{color:var(--red);font-size:10px}
.pm-footer{display:flex;justify-content:flex-end;gap:8px;padding:13px 16px;border-top:1px solid var(--border)}
.pm-btn{border-radius:8px;padding:10px 15px;display:inline-flex;align-items:center;gap:7px;font-size:10px;font-weight:600;cursor:pointer}
.pm-secondary{border:1px solid var(--border);background:transparent;color:var(--text-primary)}
.pm-primary{border:1px solid var(--primary);background:var(--primary);color:white}
.pm-btn:disabled{opacity:.55;cursor:not-allowed}
.pm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-bottom:16px}
.pm-stats>div{display:flex;flex-direction:column;gap:5px;padding:10px;border:1px solid var(--border);border-radius:7px;background:var(--bg-card-soft)}
.pm-stats span{font-size:8px;color:var(--text-muted);text-transform:uppercase}
.pm-stats strong{font-size:14px;color:var(--text-primary)}
.pm-formats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
.pm-format{min-height:94px;display:flex;flex-direction:column;align-items:flex-start;gap:7px;padding:11px;border:1px solid var(--border);border-radius:8px;background:var(--bg-card-soft);color:var(--text-primary);text-align:left;cursor:pointer}
.pm-format.selected{border-color:var(--primary);background:var(--primary-soft)}
.pm-format strong{font-size:10px}
.pm-format span{font-size:8px;color:var(--text-muted)}
.pm-note{font-size:9px;color:var(--text-muted)}
.pm-fade-enter-active,.pm-fade-leave-active{transition:opacity .2s}
.pm-fade-enter-from,.pm-fade-leave-to{opacity:0}
@media(max-width:650px){.header-actions{flex-direction:column;align-items:stretch}.pm-grid,.pm-formats{grid-template-columns:1fr}.pm-stats{grid-template-columns:repeat(2,1fr)}}
</style>