<script setup lang="ts">
import { Download, Plus, X, BriefcaseBusiness, FileSpreadsheet, FileText, Table2, Save } from 'lucide-vue-next'
import type { Position, PositionLevel, PositionStatus } from '~/types/position'
import PositionStats from '~/components/departments/positions/PositionStats.vue'
import PositionFilters from '~/components/departments/positions/PositionFilters.vue'
import PositionTable from '~/components/departments/positions/PositionTable.vue'

const { positions, search, department, level, status, currentPage, filteredPositions, paginatedPositions, totalPages, showingFrom, showingTo, stats, departmentOptions, levelOptions, statusOptions, resetFilters } = usePositions()
const showForm = ref(false)
const editingId = ref<number | null>(null)
const showExport = ref(false)
const exportFormat = ref<'excel'|'pdf'|'csv'>('excel')
const error = ref('')
const form = reactive({ code: '', name: '', department: '', level: 'Staff' as PositionLevel, description: '', approvedHeadcount: 0, minimumSalary: undefined as number | undefined, maximumSalary: undefined as number | undefined, status: 'Active' as PositionStatus })
const formats = [
  { value: 'excel' as const, label: 'Excel', icon: FileSpreadsheet, description: 'Best for HR position reports and analysis.' },
  { value: 'pdf' as const, label: 'PDF', icon: FileText, description: 'Printable position directory.' },
  { value: 'csv' as const, label: 'CSV', icon: Table2, description: 'Raw position data for external processing.' },
]
const openAdd = () => {
  editingId.value = null
  Object.assign(form, { code:'', name:'', department:'', level:'Staff', description:'', approvedHeadcount:0, minimumSalary:undefined, maximumSalary:undefined, status:'Active' })
  error.value = ''
  showForm.value = true
}
const openEdit = (item: Position) => {
  editingId.value = item.id
  Object.assign(form, { code:item.code, name:item.name, department:item.department, level:item.level, description:item.description, approvedHeadcount:item.approvedHeadcount, minimumSalary:item.minimumSalary, maximumSalary:item.maximumSalary, status:item.status })
  error.value = ''
  showForm.value = true
}
const savePosition = () => {
  error.value = ''
  const code = form.code.trim().toUpperCase()
  const name = form.name.trim()
  if (!code || !name || !form.department) { error.value = 'Position code, title and department are required.'; return }
  if (positions.value.some(item => item.id !== editingId.value && item.code.toUpperCase() === code)) { error.value = 'Position code already exists.'; return }
  if (!Number.isInteger(form.approvedHeadcount) || form.approvedHeadcount < 0) { error.value = 'Approved slots must be a non-negative whole number.'; return }
  if ((form.minimumSalary !== undefined && form.minimumSalary < 0) || (form.maximumSalary !== undefined && form.maximumSalary < 0)) { error.value = 'Salary amounts cannot be negative.'; return }
  if (form.minimumSalary != null && form.maximumSalary != null && form.maximumSalary < form.minimumSalary) { error.value = 'Maximum salary must not be less than minimum salary.'; return }
  const old = positions.value.find(item => item.id === editingId.value)
  if (old && form.approvedHeadcount < old.currentHeadcount) { error.value = `Approved slots cannot be below existing headcount (${old.currentHeadcount}).`; return }
  const now = new Date().toISOString()
  const input = { code, name, department:form.department, level:form.level, description:form.description.trim(), approvedHeadcount:Number(form.approvedHeadcount), minimumSalary:form.minimumSalary, maximumSalary:form.maximumSalary, status:form.status }
  if (old) Object.assign(old, input, { updatedAt:now })
  else positions.value.unshift({ id:Math.max(0,...positions.value.map(item=>item.id))+1, ...input, currentHeadcount:0, createdAt:now, updatedAt:now })
  showForm.value = false
  currentPage.value = 1
}
const onEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') { showForm.value = false; showExport.value = false } }
onMounted(() => window.addEventListener('keydown', onEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', onEscape))
</script>

<template>
  <section class="positions-page">
    <PageHeader title="Positions & Designations" description="Manage company positions, department assignments, position levels, approved headcount and available vacancies.">
      <div class="header-actions">
        <AppButton variant="secondary" :icon="Download" @click="exportFormat = 'excel'; showExport = true">Export</AppButton>
        <AppButton :icon="Plus" @click="openAdd">Add Position</AppButton>
      </div>
    </PageHeader>
    <PositionStats :stats="stats" />
    <PositionFilters v-model:search="search" v-model:department="department" v-model:level="level" v-model:status="status" :departments="departmentOptions" :levels="levelOptions" :statuses="statusOptions" @reset="resetFilters" />
    <PositionTable :positions="paginatedPositions" @edit="openEdit" />
    <div class="table-footer">
      <p>Showing <strong>{{ showingFrom }}–{{ showingTo }}</strong> of <strong>{{ filteredPositions.length }}</strong> positions</p>
      <AppPagination v-model="currentPage" :total-pages="totalPages" />
    </div>

    <Teleport to="body"><Transition name="pm-fade"><div v-if="showForm" class="pm-overlay" @click.self="showForm = false">
      <section class="pm-dialog" role="dialog" aria-modal="true" aria-labelledby="position-form-title">
        <header class="pm-head"><div class="pm-title"><span class="pm-icon"><BriefcaseBusiness :size="19" /></span><div><h2 id="position-form-title">{{ editingId ? 'Edit Position' : 'Add New Position' }}</h2><p>Configure job title, department, headcount and compensation range.</p></div></div><button class="pm-close" type="button" aria-label="Close" @click="showForm = false"><X :size="17" /></button></header>
        <form @submit.prevent="savePosition"><div class="pm-body">
          <h3>Position Information</h3><div class="pm-grid">
            <label>Position Code <span>*</span><input v-model.trim="form.code" required maxlength="30" placeholder="e.g. OPS-DRV" /></label>
            <label>Position Title <span>*</span><input v-model.trim="form.name" required maxlength="100" placeholder="e.g. Driver" /></label>
            <label>Department <span>*</span><select v-model="form.department" required><option value="" disabled>Select Department</option><option v-for="item in departmentOptions" :key="item" :value="item">{{ item }}</option></select></label>
            <label>Position Level <span>*</span><select v-model="form.level"><option v-for="item in levelOptions" :key="item" :value="item">{{ item }}</option></select></label>
            <label class="pm-full">Description<textarea v-model="form.description" rows="3" placeholder="Responsibilities and scope of this position..." /></label>
          </div>
          <h3>Headcount & Compensation</h3><div class="pm-grid">
            <label>Approved Headcount <span>*</span><input v-model.number="form.approvedHeadcount" type="number" required min="0" step="1" /></label>
            <label>Status<select v-model="form.status"><option v-for="item in statusOptions" :key="item" :value="item">{{ item }}</option></select></label>
            <label>Minimum Monthly Salary (₱)<input v-model.number="form.minimumSalary" type="number" min="0" step="0.01" placeholder="Optional" /></label>
            <label>Maximum Monthly Salary (₱)<input v-model.number="form.maximumSalary" type="number" min="0" step="0.01" placeholder="Optional" /></label>
          </div>
          <div class="pm-notice"><strong>Vacancies are calculated automatically</strong><p>Approved headcount minus currently assigned employees. Existing employee headcount is preserved when editing.</p></div>
          <p v-if="error" class="pm-error" role="alert">{{ error }}</p>
        </div><footer class="pm-footer"><button type="button" class="pm-btn pm-secondary" @click="showForm = false">Cancel</button><button type="submit" class="pm-btn pm-primary"><Save :size="15" />{{ editingId ? 'Save Changes' : 'Save Position' }}</button></footer></form>
      </section></div></Transition></Teleport>

    <Teleport to="body"><Transition name="pm-fade"><div v-if="showExport" class="pm-overlay" @click.self="showExport = false">
      <section class="pm-dialog" role="dialog" aria-modal="true" aria-labelledby="position-export-title">
        <header class="pm-head"><div class="pm-title"><span class="pm-icon"><Download :size="19" /></span><div><h2 id="position-export-title">Export Positions</h2><p>Export position records, vacancies and approved headcount.</p></div></div><button class="pm-close" type="button" aria-label="Close" @click="showExport = false"><X :size="17" /></button></header>
        <div class="pm-body"><div class="pm-stats"><div><span>Total</span><strong>{{ stats.totalPositions }}</strong></div><div><span>Active</span><strong>{{ stats.activePositions }}</strong></div><div><span>Headcount</span><strong>{{ stats.totalHeadcount }}</strong></div><div><span>Vacancies</span><strong>{{ stats.vacancies }}</strong></div></div>
          <h3>Export Format</h3><div class="pm-formats"><button v-for="item in formats" :key="item.value" type="button" class="pm-format" :class="{ selected:exportFormat === item.value }" :aria-pressed="exportFormat === item.value" @click="exportFormat = item.value"><component :is="item.icon" :size="19" /><strong>{{ item.label }}</strong><span>{{ item.description }}</span></button></div>
          <div class="pm-notice"><strong>Included Data</strong><p>Position code, title, department, level, description, current headcount, approved slots, vacancies, salary range, status and last updated.</p></div>
          <p class="pm-note">UI preview only. No export will be generated yet.</p>
        </div><footer class="pm-footer"><button type="button" class="pm-btn pm-secondary" @click="showExport = false">Cancel</button><button type="button" class="pm-btn pm-primary" disabled><Download :size="15" />Export {{ exportFormat === 'excel' ? 'Excel' : exportFormat.toUpperCase() }}</button></footer>
      </section></div></Transition></Teleport>
  </section>
</template>

<style scoped>
.positions-page{width:100%;max-width:1660px;margin:0 auto}.header-actions{display:flex;align-items:center;gap:8px}.table-footer{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:14px 3px 0}.table-footer p{margin:0;color:var(--text-muted);font-size:11px}.table-footer strong{color:var(--text-primary);font-weight:650}
.pm-overlay{position:fixed;inset:0;z-index:9999;background:rgba(3,12,29,.78);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:20px}.pm-dialog{width:100%;max-width:600px;max-height:90vh;overflow-y:auto;background:var(--bg-card);border:1px solid var(--border);border-radius:13px;box-shadow:0 25px 65px #0004}.pm-head{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:16px;border-bottom:1px solid var(--border)}.pm-title{display:flex;align-items:center;gap:10px}.pm-icon{display:flex;align-items:center;justify-content:center;width:36px;height:36px;flex-shrink:0;border-radius:8px;background:var(--primary-soft);color:var(--primary)}.pm-head h2{margin:0;font-size:13px;color:var(--text-primary)}.pm-head p{margin:4px 0 0;font-size:9px;color:var(--text-muted)}.pm-close{border:1px solid var(--border);border-radius:7px;width:29px;height:29px;display:flex;align-items:center;justify-content:center;background:transparent;color:var(--text-secondary)}.pm-body{padding:17px}.pm-body h3{font-size:11px;color:var(--text-primary);margin:0 0 12px}.pm-body h3:not(:first-child){margin-top:20px}.pm-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.pm-grid label{display:flex;flex-direction:column;gap:7px;font-size:10px;font-weight:600;color:var(--text-primary)}.pm-grid label span{color:var(--red)}.pm-full{grid-column:1/-1}.pm-grid input,.pm-grid select,.pm-grid textarea{width:100%;min-height:38px;padding:9px 11px;border:1px solid var(--border);border-radius:8px;background:var(--bg-card-soft);color:var(--text-primary);outline:0;font-size:11px;font-family:inherit}.pm-grid textarea{resize:vertical}.pm-grid input:focus,.pm-grid select:focus,.pm-grid textarea:focus{border-color:var(--primary)}.pm-notice{margin-top:15px;padding:12px;background:var(--bg-card-soft);border:1px solid var(--border);border-radius:8px}.pm-notice strong{font-size:9px;color:var(--text-primary)}.pm-notice p{margin:6px 0 0;color:var(--text-muted);font-size:9px;line-height:1.6}.pm-error{color:var(--red);font-size:10px}.pm-footer{display:flex;justify-content:flex-end;gap:8px;padding:13px 16px;border-top:1px solid var(--border)}.pm-btn{border-radius:8px;padding:10px 15px;display:inline-flex;align-items:center;gap:7px;font-size:10px;font-weight:600;cursor:pointer}.pm-secondary{border:1px solid var(--border);background:transparent;color:var(--text-primary)}.pm-primary{border:1px solid var(--primary);background:var(--primary);color:white}.pm-primary:disabled{opacity:.55;cursor:not-allowed}.pm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-bottom:16px}.pm-stats>div{display:flex;flex-direction:column;gap:5px;padding:10px;border:1px solid var(--border);border-radius:7px;background:var(--bg-card-soft)}.pm-stats span{font-size:8px;color:var(--text-muted);text-transform:uppercase}.pm-stats strong{font-size:14px;color:var(--text-primary)}.pm-formats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.pm-format{min-height:94px;display:flex;flex-direction:column;align-items:flex-start;gap:7px;padding:11px;border:1px solid var(--border);border-radius:8px;background:var(--bg-card-soft);color:var(--text-primary);text-align:left}.pm-format.selected{border-color:var(--primary);background:var(--primary-soft)}.pm-format.selected svg{color:var(--primary)}.pm-format strong{font-size:10px}.pm-format span{font-size:8px;color:var(--text-muted)}.pm-note{font-size:9px;color:var(--text-muted)}.pm-fade-enter-active,.pm-fade-leave-active{transition:opacity .2s}.pm-fade-enter-from,.pm-fade-leave-to{opacity:0}@media(max-width:650px){.header-actions,.table-footer{flex-direction:column;align-items:stretch}.pm-grid,.pm-formats{grid-template-columns:1fr}.pm-stats{grid-template-columns:repeat(2,1fr)}}
</style>
