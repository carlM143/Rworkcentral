
<script setup lang="ts">
import { ArrowLeft, Download, Plus, X, Save } from 'lucide-vue-next'
import LeaveTypeStats from '~/components/admin/leave/types/LeaveTypeStats.vue'
import LeaveTypeFilters from '~/components/admin/leave/types/LeaveTypeFilters.vue'
import LeaveTypeTable from '~/components/admin/leave/types/LeaveTypeTable.vue'
import { useLeaveTypes } from '~/composables/admin/leave/useLeaveTypes'
import { useLeaveTypeApi } from '~/composables/admin/leave/useLeaveTypeApi'
import type { LeaveType, LeaveTypePayload } from '~/types/leaveType'

const router = useRouter()
const { success, info, error: showError } = useToast()
const { createLeaveType, updateLeaveType, deleteLeaveType } = useLeaveTypeApi()

const {
  search,
  status,
  currentPage,
  filteredLeaveTypes,
  paginatedLeaveTypes,
  totalPages,
  showingFrom,
  showingTo,
  stats,
  statusOptions,
  loading,
  loadError,
  resetFilters,
  loadLeaveTypes,
} = useLeaveTypes()

const saving = ref(false)
const formOpen = ref(false)
const editingLeaveType = ref<LeaveType | null>(null)

const form = reactive<LeaveTypePayload>({
  leave_code: '',
  leave_name: '',
  status: 'active',
})

const isEditing = computed(() => editingLeaveType.value !== null)

const getErrorMessage = (problem: any): string => {
  const data = problem?.data ?? problem?.response?._data ?? {}
  const firstError = Object.values(data.errors ?? {}).flat()[0]
  return String(firstError || data.message || problem?.message || 'Request failed.')
}

// LOAD LARAVEL DATA
onMounted(() => {
  void loadLeaveTypes()
})

// BACK
const handleBack = () => router.push('/admin/leave-management')

// FORM
const resetForm = () => {
  form.leave_code = ''
  form.leave_name = ''
  form.status = 'active'
}

const handleAddLeaveType = () => {
  editingLeaveType.value = null
  resetForm()
  formOpen.value = true
}

const handleEdit = (item: LeaveType) => {
  editingLeaveType.value = item
  form.leave_code = item.code
  form.leave_name = item.name
  form.status = item.status === 'inactive' ? 'inactive' : 'active'
  formOpen.value = true
}

const closeForm = () => {
  if (saving.value) return
  formOpen.value = false
  editingLeaveType.value = null
  resetForm()
}

// CREATE / UPDATE
const handleSave = async () => {
  if (saving.value) return

  if (!form.leave_code.trim() || !form.leave_name.trim()) {
    showError('Required Fields', 'Leave Code and Leave Name are required.')
    return
  }

  saving.value = true

  try {
    const payload: LeaveTypePayload = {
      leave_code: form.leave_code.trim().toUpperCase(),
      leave_name: form.leave_name.trim(),
      status: form.status,
    }

    const editing = editingLeaveType.value !== null

    const response = editing
      ? await updateLeaveType(editingLeaveType.value!.id, payload)
      : await createLeaveType(payload)

    if (response.success === false) throw new Error(response.message)

    closeAfterSave()

    success(
      editing ? 'Leave Type Updated' : 'Leave Type Created',
      response.message || 'Leave type saved successfully.',
    )

    await loadLeaveTypes()
  } catch (problem) {
    showError('Unable to Save Leave Type', getErrorMessage(problem))
  } finally {
    saving.value = false
  }
}

const closeAfterSave = () => {
  formOpen.value = false
  editingLeaveType.value = null
  resetForm()
}

// DELETE
const handleDelete = async (item: LeaveType) => {
  if (saving.value) return

  const confirmed = window.confirm(
    `Are you sure you want to delete "${item.name}"?\n\nThis action cannot be undone.`
  )

  if (!confirmed) return

  saving.value = true

  try {
    const response = await deleteLeaveType(item.id)

    if (response.success === false) throw new Error(response.message)

    success('Leave Type Deleted', response.message || 'Leave type deleted successfully.')
    await loadLeaveTypes()
  } catch (problem) {
    showError('Unable to Delete Leave Type', getErrorMessage(problem))
  } finally {
    saving.value = false
  }
}

// EXPORT CSV
const handleExport = () => {
  if (!filteredLeaveTypes.value.length) {
    info('No Records', 'No leave types available for export.')
    return
  }

  const rows = [
    ['ID', 'Leave Code', 'Leave Name', 'Status', 'Policies', 'Requests'],
    ...filteredLeaveTypes.value.map(item => [
      item.id,
      item.code,
      item.name,
      item.status,
      item.policiesCount,
      item.requestsCount,
    ]),
  ]

  const escapeCsv = (value: string | number) => {
    const text = String(value)
    const safe = /^\s*[=+\-@]/.test(text) ? `'${text}` : text
    return `"${safe.replace(/"/g, '""')}"`
  }

  const csv = rows.map(row => row.map(escapeCsv).join(',')).join('\r\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'leave-types.csv'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="leave-types-page">

    <!-- BACK -->
    <button type="button" class="back-button" @click="handleBack">
      <ArrowLeft :size="15" />
      Back to Leave Management
    </button>

    <!-- HEADER -->
    <PageHeader
      title="Leave Types"
      description="Manage company leave categories, codes, statuses and associated leave policies."
    >
      <div class="header-actions">
        <AppButton variant="secondary" :icon="Download" @click="handleExport">
          Export
        </AppButton>

        <AppButton :icon="Plus" @click="handleAddLeaveType">
          Add Leave Type
        </AppButton>
      </div>
    </PageHeader>

    <!-- LOADING -->
    <div v-if="loading" class="directory-message">
      Loading leave types...
    </div>

    <!-- API ERROR -->
    <div v-else-if="loadError" class="directory-message error-message" role="alert">
      <div>
        <strong>Leave Types Could Not Be Loaded</strong>
        <p>{{ loadError }}</p>
      </div>

      <AppButton variant="secondary" @click="loadLeaveTypes">
        Retry
      </AppButton>
    </div>

    <template v-else>

      <!-- STATS -->
      <LeaveTypeStats :stats="stats" />

      <!-- FILTERS -->
      <LeaveTypeFilters
        v-model:search="search"
        v-model:status="status"
        :statuses="statusOptions"
        @reset="resetFilters"
      />

      <!-- TABLE -->
      <LeaveTypeTable
        :leave-types="paginatedLeaveTypes"
        :busy="saving"
        @edit="handleEdit"
        @delete="handleDelete"
      />

      <!-- PAGINATION -->
      <div class="table-footer">
        <p>
          Showing
          <strong>{{ showingFrom }}–{{ showingTo }}</strong>
          of
          <strong>{{ filteredLeaveTypes.length }}</strong>
          leave types
        </p>

        <AppPagination v-model="currentPage" :total-pages="totalPages" />
      </div>

    </template>

    <!-- CREATE / EDIT MODAL -->
    <Teleport to="body">
      <div v-if="formOpen" class="modal-overlay" @click.self="closeForm">
        <article
          class="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-type-modal-title"
        >

          <!-- MODAL HEADER -->
          <div class="modal-header">
            <div class="modal-heading">
              <div class="modal-icon">
                <Plus :size="18" />
              </div>

              <div>
                <h3 id="leave-type-modal-title">
                  {{ isEditing ? 'Edit Leave Type' : 'Add Leave Type' }}
                </h3>
                <p>Configure the leave category information.</p>
              </div>
            </div>

            <button
              type="button"
              class="close-button"
              :disabled="saving"
              @click="closeForm"
            >
              <X :size="17" />
            </button>
          </div>

          <!-- FORM -->
          <form @submit.prevent="handleSave">
            
            <div class="modal-body">

              <!-- LEAVE NAME - FULL WIDTH -->
              <div class="form-field">
                <label for="leave-name">
                  Leave Name <span>*</span>
                </label>

                <input
                  id="leave-name"
                  v-model="form.leave_name"
                  type="text"
                  maxlength="255"
                  placeholder="e.g. Sick Leave"
                  :disabled="saving"
                  required
                />
              </div>

              <!-- LEAVE CODE AND STATUS -->
              <div class="field-grid">

                <div class="form-field">
                  <label for="leave-code">
                    Leave Code <span>*</span>
                  </label>

                  <input
                    id="leave-code"
                    v-model="form.leave_code"
                    type="text"
                    maxlength="50"
                    placeholder="e.g. SL"
                    :disabled="saving"
                    required
                  />
                </div>

                <div class="form-field">
                  <label for="leave-status">
                    Status <span>*</span>
                  </label>

                  <select
                    id="leave-status"
                    v-model="form.status"
                    :disabled="saving"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

              </div>

              <!-- INFORMATION -->
              <div class="info-panel">
                Leave credits, eligibility, paid or unpaid status,
                carry-over and approval requirements are configured
                separately in the Leave Policies module.
              </div>

            </div>


            <!-- MODAL FOOTER -->
            <div class="modal-footer">
              <AppButton
                variant="secondary"
                :disabled="saving"
                @click="closeForm"
              >
                Cancel
              </AppButton>

              <button
                type="submit"
                class="save-button"
                :disabled="saving"
              >
                <Save :size="15" />
                {{ saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Leave Type' }}
              </button>
            </div>
          </form>

        </article>
      </div>
    </Teleport>

  </section>
</template>

<style scoped>
.leave-types-page{width:100%;max-width:1660px;margin:0 auto}
.back-button{display:inline-flex;align-items:center;gap:6px;margin-bottom:10px;padding:0;border:0;background:transparent;color:var(--primary);font-size:10px;font-weight:600;cursor:pointer}
.back-button:hover{color:var(--primary-dark)}
.header-actions{display:flex;align-items:center;gap:8px}
.table-footer{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:13px 3px 0}
.table-footer p{margin:0;color:var(--text-muted);font-size:10px}
.table-footer strong{color:var(--text-primary);font-weight:650}

.directory-message{display:flex;align-items:center;justify-content:center;gap:15px;min-height:90px;margin-bottom:14px;padding:15px;border:1px solid var(--border);border-radius:10px;background:var(--bg-card);color:var(--text-secondary);font-size:11px}
.error-message{justify-content:space-between;border-color:var(--red)}
.error-message strong{color:var(--red);font-size:11px}
.error-message p{margin:4px 0 0;color:var(--text-muted);font-size:10px}

.modal-overlay{position:fixed;inset:0;z-index:99990;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(3,8,18,.76);backdrop-filter:blur(4px)}
.modal{width:100%;max-width:620px;max-height:90vh;overflow-y:auto;border:1px solid var(--border);border-radius:12px;background:var(--bg-card);box-shadow:0 24px 70px rgba(0,0,0,.3)}
.modal-header{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:17px 19px;border-bottom:1px solid var(--border-soft)}
.modal-heading{display:flex;align-items:center;gap:10px}
.modal-icon{display:flex;width:38px;height:38px;flex-shrink:0;align-items:center;justify-content:center;border-radius:9px;background:var(--primary-soft);color:var(--primary)}
.modal-header h3{margin:0;color:var(--text-primary);font-size:14px}
.modal-header p{margin:5px 0 0;color:var(--text-muted);font-size:9px}
.close-button{display:flex;width:31px;height:31px;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:7px;background:transparent;color:var(--text-secondary);cursor:pointer}

.modal-body{padding:19px}
.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.form-field{margin-bottom:15px}
.form-field label{display:block;margin-bottom:7px;color:var(--text-primary);font-size:10px;font-weight:600}
.form-field label span{color:var(--red)}
.form-field input,.form-field select{box-sizing:border-box;width:100%;height:40px;padding:0 12px;border:1px solid var(--border);border-radius:8px;outline:0;background:var(--bg-card-soft);color:var(--text-primary);font-family:inherit;font-size:11px}
.form-field input:focus,.form-field select:focus{border-color:var(--primary)}
.form-field input:disabled,.form-field select:disabled{opacity:.6}
.info-panel{padding:12px;border:1px solid var(--border);border-radius:8px;background:var(--primary-soft);color:var(--text-secondary);font-size:10px;line-height:1.6}

.modal-footer{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:14px 19px;border-top:1px solid var(--border-soft)}
.save-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:38px;padding:0 15px;border:1px solid var(--primary);border-radius:7px;background:var(--primary);color:#fff;font-family:inherit;font-size:11px;font-weight:600;cursor:pointer}
.save-button:disabled,.close-button:disabled{opacity:.5;cursor:not-allowed}

@media(max-width:650px){
  .header-actions{width:100%;align-items:stretch;flex-direction:column}
  .table-footer{align-items:flex-start;flex-direction:column}
  .field-grid{grid-template-columns:1fr}
}
</style>
