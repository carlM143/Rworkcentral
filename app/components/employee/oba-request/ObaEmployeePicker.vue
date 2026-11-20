<script setup lang="ts">
import { Search, UserPlus, X } from 'lucide-vue-next'
import { getObaApiError, useObaRequest } from '~/composables/employee/oba-request/useObaRequest'
import type { ObaAvailableEmployee, ObaDepartment } from '~/types/employee/oba-request/obaRequest'

const props = defineProps<{
  modelValue: ObaAvailableEmployee[]
  /** Employee IDs that must not appear in the list (already on the request). */
  excludeIds?: number[]
  disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: ObaAvailableEmployee[]] }>()

const api = useObaRequest()

const isOpen = ref(false)
const departments = ref<ObaDepartment[]>([])
const departmentId = ref('')
const employees = ref<ObaAvailableEmployee[]>([])
const search = ref('')
const pending = ref<ObaAvailableEmployee[]>([])
const loadingDepartments = ref(false)
const loadingEmployees = ref(false)
const error = ref('')
let token = 0

const available = computed(() => {
  const taken = new Set([...(props.excludeIds ?? []), ...props.modelValue.map(e => e.id)])
  const keyword = search.value.trim().toLowerCase()
  return employees.value.filter(e =>
    !taken.has(e.id) && (!keyword || e.name.toLowerCase().includes(keyword)),
  )
})

const isPicked = (id: number) => pending.value.some(e => e.id === id)
const toggle = (employee: ObaAvailableEmployee) => {
  pending.value = isPicked(employee.id)
    ? pending.value.filter(e => e.id !== employee.id)
    : [...pending.value, employee]
}

const loadDepartments = async () => {
  loadingDepartments.value = true
  error.value = ''
  try {
    const res = await api.departments()
    departments.value = res.data ?? []
  } catch (cause: unknown) {
    departments.value = []
    error.value = getObaApiError(cause, 'Unable to load departments.')
  } finally {
    loadingDepartments.value = false
  }
}

const loadEmployees = async () => {
  const current = ++token
  employees.value = []
  search.value = ''
  error.value = ''
  if (!departmentId.value) return
  loadingEmployees.value = true
  try {
    const res = await api.availableEmployees({ department_id: departmentId.value })
    if (current === token) employees.value = res.data ?? []
  } catch (cause: unknown) {
    if (current === token) error.value = getObaApiError(cause, 'Unable to load employees.')
  } finally {
    if (current === token) loadingEmployees.value = false
  }
}

watch(departmentId, loadEmployees)

const openModal = () => {
  if (props.disabled) return
  pending.value = []
  search.value = ''
  isOpen.value = true
  if (!departments.value.length) void loadDepartments()
}
const closeModal = () => { isOpen.value = false }
const confirm = () => {
  if (pending.value.length) emit('update:modelValue', [...props.modelValue, ...pending.value])
  closeModal()
}
const remove = (id: number) =>
  emit('update:modelValue', props.modelValue.filter(e => e.id !== id))

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) closeModal()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="picker">
    <div v-if="modelValue.length" class="chips">
      <span v-for="emp in modelValue" :key="emp.id" class="chip">
        {{ emp.name }}
        <button type="button" :aria-label="`Remove ${emp.name}`" :disabled="disabled" @click="remove(emp.id)"><X :size="12" /></button>
      </span>
    </div>

    <button type="button" class="open-button" :disabled="disabled" @click="openModal">
      <UserPlus :size="16" /> Add employees
    </button>

    <Teleport to="body">
        <div v-if="isOpen" class="oba-picker-backdrop" @mousedown.self="closeModal">
        <div class="oba-picker-modal" role="dialog" aria-modal="true" aria-label="Add employees">
          <header class="modal-header">
            <h3>Add employees</h3>
            <button type="button" class="icon-button" aria-label="Close" @click="closeModal"><X :size="18" /></button>
          </header>

          <div class="modal-controls">
            <label class="search">
              <Search :size="16" />
              <input
                v-model="search"
                type="search"
                placeholder="Search employee name..."
                autocomplete="off"
                :disabled="!departmentId"
                @keydown.enter.prevent
              >
            </label>
            <select v-model="departmentId" class="select" aria-label="Department" :disabled="loadingDepartments">
              <option value="">{{ loadingDepartments ? 'Loading departments…' : 'Select a department' }}</option>
              <option v-for="dept in departments" :key="dept.id" :value="String(dept.id)">{{ dept.name }}</option>
            </select>
          </div>

          <p v-if="error" class="hint error">{{ error }}</p>

          <div class="modal-body">
            <p v-if="!departmentId" class="hint center">Select a department to see its employees.</p>
            <p v-else-if="loadingEmployees" class="hint center">Loading employees…</p>
            <p v-else-if="!available.length" class="hint center">No employees found.</p>
            <ul v-else class="list">
              <li v-for="emp in available" :key="emp.id">
                <label class="row">
                  <input type="checkbox" :checked="isPicked(emp.id)" @change="toggle(emp)">
                  <span>{{ emp.name }}</span>
                </label>
              </li>
            </ul>
          </div>

          <footer class="modal-footer">
            <span class="count">{{ pending.length }} selected</span>
            <div class="footer-actions">
              <button type="button" class="cancel-button" @click="closeModal">Cancel</button>
              <button type="button" class="confirm-button" :disabled="!pending.length" @click="confirm">
                Add {{ pending.length || '' }} {{ pending.length === 1 ? 'employee' : 'employees' }}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.picker { display: grid; gap: 10px; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 6px 5px 11px; border: 1px solid var(--border); border-radius: 999px; background: var(--bg-card-soft); color: var(--text-primary); font-size: 11px; }
.chip button { display: grid; place-items: center; width: 18px; height: 18px; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--text-muted); cursor: pointer; }
.chip button:hover { background: var(--red-soft, #ef444414); color: var(--red, #ef4444); }
.open-button { display: inline-flex; align-items: center; gap: 8px; width: fit-content; min-height: 40px; padding: 0 14px; border: 1px dashed var(--primary); border-radius: 9px; background: var(--primary-soft); color: var(--primary); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.open-button:disabled { opacity: .6; cursor: not-allowed; }
</style>

<style>
/* Modal is teleported to <body>, so it uses unscoped styles with hard-coded fallbacks. */
.oba-picker-backdrop { position: fixed; z-index: 1000; inset: 0; display: grid; place-items: center; padding: 16px; background: rgb(0 0 0 / 50%); }
.oba-picker-modal { display: flex; flex-direction: column; width: min(100%, 520px); max-height: min(640px, 90vh); border: 1px solid #e2e8f0; border-radius: 14px; background: #fff; color: #0f172a; box-shadow: 0 24px 60px rgb(0 0 0 / 28%); font-family: inherit; }
.oba-picker-modal .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; border-bottom: 1px solid #eef2f7; }
.oba-picker-modal .modal-header h3 { margin: 0; font-size: 15px; font-weight: 700; }
.oba-picker-modal .icon-button { display: grid; place-items: center; width: 32px; height: 32px; padding: 0; border: 0; border-radius: 8px; background: transparent; color: #64748b; cursor: pointer; }
.oba-picker-modal .icon-button:hover { background: #f1f5f9; color: #0f172a; }
.oba-picker-modal .modal-controls { display: grid; gap: 10px; padding: 14px 18px 0; }
.oba-picker-modal .search { display: flex; align-items: center; gap: 8px; padding: 0 12px; border: 1px solid #e2e8f0; border-radius: 9px; background: #f8fafc; color: #64748b; }
.oba-picker-modal .search:focus-within { border-color: #1f68f2; box-shadow: 0 0 0 3px rgb(31 104 242 / 14%); }
.oba-picker-modal .search input { flex: 1; min-width: 0; min-height: 42px; border: 0; outline: 0; background: transparent; color: #0f172a; font: inherit; font-size: 13px; }
.oba-picker-modal .select { width: 100%; min-height: 42px; padding: 0 12px; border: 1px solid #e2e8f0; border-radius: 9px; background: #f8fafc; color: #0f172a; font: inherit; font-size: 13px; outline: none; }
.oba-picker-modal .select:focus { border-color: #1f68f2; box-shadow: 0 0 0 3px rgb(31 104 242 / 14%); }
.oba-picker-modal .modal-body { flex: 1; min-height: 160px; margin: 12px 18px; overflow-y: auto; border: 1px solid #eef2f7; border-radius: 9px; }
.oba-picker-modal .list { margin: 0; padding: 4px; list-style: none; }
.oba-picker-modal .row { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 6px; font-size: 13px; cursor: pointer; }
.oba-picker-modal .row:hover { background: #eff4ff; }
.oba-picker-modal .row input { width: 16px; height: 16px; accent-color: #1f68f2; }
.oba-picker-modal .hint { margin: 0; padding: 0 18px; color: #64748b; font-size: 12px; }
.oba-picker-modal .hint.center { padding: 36px 12px; text-align: center; }
.oba-picker-modal .hint.error { margin-top: 10px; color: #ef4444; }
.oba-picker-modal .modal-footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 14px 18px; border-top: 1px solid #eef2f7; }
.oba-picker-modal .count { color: #475569; font-size: 12px; }
.oba-picker-modal .footer-actions { display: flex; gap: 8px; }
.oba-picker-modal .footer-actions button { min-height: 40px; padding: 0 16px; border-radius: 8px; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.oba-picker-modal .cancel-button { border: 1px solid #e2e8f0; background: #f8fafc; color: #0f172a; }
.oba-picker-modal .confirm-button { border: 1px solid #1f68f2; background: #1f68f2; color: #fff; }
.oba-picker-modal .confirm-button:disabled { opacity: .5; cursor: not-allowed; }
@media (max-width: 850px) {
  .oba-picker-modal .select, .oba-picker-modal .search input { font-size: 16px; }
  .oba-picker-modal .modal-footer { flex-direction: column-reverse; align-items: stretch; }
  .oba-picker-modal .footer-actions button { flex: 1; }
}
</style>