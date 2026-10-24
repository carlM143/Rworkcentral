
<script setup lang="ts">
import {
  MoreHorizontal, Eye, Pencil, ArrowRightLeft,
  Files, UserX, UserCheck, History,
} from 'lucide-vue-next'
import type { Employee } from '~/types/employee'

const props = withDefaults(defineProps<{
  employee: Employee
  mode?: 'active' | 'inactive'
}>(), { mode: 'active' })

const emit = defineEmits<{
  statusChanged: [payload: { id: number; status: 'Active' | 'Inactive' }]
}>()

const { $api } = useNuxtApp()
const { success, error: showError, info } = useToast()

const open = ref(false)
const loading = ref(false)

const employeeName = computed(() =>
  [props.employee.firstName, props.employee.lastName].filter(Boolean).join(' ')
)

const close = () => { open.value = false }

const getErrorMessage = (problem: any): string => {
  const data = problem?.data ?? problem?.response?._data ?? {}
  const validationError = Object.values(data.errors ?? {}).flat()[0]
  return String(validationError || data.message || problem?.message || 'The employee request failed.')
}

// PATCH /api/admin/employees/{employee}
const updateEmployeeStatus = async (status: boolean) => {
  close()
  if (loading.value) return

  const action = status ? 'reactivate' : 'deactivate'
  const confirmed = window.confirm(`Are you sure you want to ${action} ${employeeName.value}?`)
  if (!confirmed) return

  loading.value = true

  try {
    const response = await $api<{ success: boolean; message?: string }>(
      `/admin/employees/${props.employee.id}`,
      {
        method: 'PATCH',
        body: { status },
      }
    )

    if (response.success === false) {
      throw new Error(response.message || 'Employee status update was rejected.')
    }

    const newStatus = status ? 'Active' : 'Inactive'

    emit('statusChanged', { id: props.employee.id, status: newStatus })

    success(
      status ? 'Employee Reactivated' : 'Employee Deactivated',
      response.message || `${employeeName.value} is now ${newStatus.toLowerCase()}.`
    )
  } catch (problem) {
    showError(
      status ? 'Reactivation Failed' : 'Deactivation Failed',
      getErrorMessage(problem)
    )
  } finally {
    loading.value = false
  }
}

const handleDeactivate = () => updateEmployeeStatus(false)
const handleReactivate = () => updateEmployeeStatus(true)

const handleTransfer = () => {
  close()
  info('Department Transfer', 'Use the Employee Transfer module to change the department assignment.')
}

const handleDocuments = () => {
  close()
  info('Employee Documents', 'Open the employee profile to review documents.')
}

const handleHistory = () => {
  close()
  info('Employment History', 'Employment history will be connected to the employee lifecycle module.')
}
</script>

<template>
  <div class="actions-wrapper">
    <button
      type="button"
      class="actions-trigger"
      :disabled="loading"
      :aria-label="`Actions for ${employeeName}`"
      :aria-expanded="open"
      @click.stop="open = !open"
    >
      <MoreHorizontal :size="18" />
    </button>

    <div v-if="open" class="actions-menu" @mouseleave="close">
      <!-- VIEW PROFILE -->
      <NuxtLink
        :to="`/admin/employees/${employee.id}`"
        class="action-item"
        @click="close"
      >
        <Eye :size="15" />
        View Profile
      </NuxtLink>

      <!-- ACTIVE EMPLOYEE -->
      <template v-if="mode === 'active'">
        <NuxtLink
          :to="{ path: '/admin/employees/edit', query: { id: employee.id } }"
          class="action-item"
          @click="close"
        >
          <Pencil :size="15" />
          Edit Employee
        </NuxtLink>

        <button type="button" class="action-item" @click="handleTransfer">
          <ArrowRightLeft :size="15" />
          Transfer Department
        </button>

        <button type="button" class="action-item" @click="handleDocuments">
          <Files :size="15" />
          View Documents
        </button>

        <div class="action-divider" />

        <button
          type="button"
          class="action-item danger"
          :disabled="loading"
          @click="handleDeactivate"
        >
          <UserX :size="15" />
          Deactivate Employee
        </button>
      </template>

      <!-- INACTIVE EMPLOYEE -->
      <template v-else>
        <button type="button" class="action-item" @click="handleDocuments">
          <Files :size="15" />
          View Documents
        </button>

        <button type="button" class="action-item" @click="handleHistory">
          <History :size="15" />
          Employment History
        </button>

        <div class="action-divider" />

        <button
          type="button"
          class="action-item reactivate"
          :disabled="loading"
          @click="handleReactivate"
        >
          <UserCheck :size="15" />
          Reactivate Employee
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.actions-wrapper{position:relative;display:inline-flex}
.actions-trigger{display:flex;width:32px;height:32px;align-items:center;justify-content:center;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--text-secondary);cursor:pointer}
.actions-trigger:hover{border-color:var(--border);background:var(--bg-card-soft);color:var(--text-primary)}
.actions-trigger:disabled{opacity:.5;cursor:not-allowed}
.actions-menu{position:absolute;top:36px;right:0;z-index:20;width:190px;padding:6px;border:1px solid var(--border);border-radius:9px;background:var(--bg-card);box-shadow:0 12px 35px rgba(15,23,42,.18)}
.action-item{display:flex;width:100%;min-height:36px;align-items:center;gap:9px;padding:0 9px;border:0;border-radius:6px;background:transparent;color:var(--text-secondary);font-size:11px;text-align:left;text-decoration:none;cursor:pointer}
.action-item:hover{background:var(--bg-card-soft);color:var(--text-primary)}
.action-item:disabled{opacity:.5;cursor:not-allowed}
.action-item.danger{color:var(--red)}
.action-item.danger:hover{background:var(--red-soft);color:var(--red)}
.action-item.reactivate{color:var(--green)}
.action-item.reactivate:hover{background:var(--green-soft);color:var(--green)}
.action-divider{height:1px;margin:5px 0;background:var(--border-soft)}
</style>
