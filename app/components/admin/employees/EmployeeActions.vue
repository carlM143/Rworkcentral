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

const { deactivateEmployee, reactivateEmployee } = useEmployeeApi()
const { success, error: showError, info } = useToast()

const open = ref(false)
const loading = ref(false)

const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

const menuStyle = ref({
  top: '0px',
  left: '0px',
  visibility: 'hidden' as 'hidden' | 'visible',
})

const close = () => {
  open.value = false
}

const toggleMenu = async () => {
  if (loading.value) return

  if (open.value) {
    close()
    return
  }

  menuStyle.value = {
    top: '0px',
    left: '0px',
    visibility: 'hidden',
  }

  open.value = true

  await nextTick()

  const trigger = triggerRef.value
  const menu = menuRef.value

  if (!trigger || !menu) {
    close()
    return
  }

  const rect = trigger.getBoundingClientRect()
  const menuWidth = menu.offsetWidth
  const menuHeight = menu.offsetHeight

  const padding = 8
  const gap = 6

  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  const openAbove =
    spaceBelow < menuHeight + gap + padding &&
    spaceAbove > spaceBelow

  const preferredTop = openAbove
    ? rect.top - menuHeight - gap
    : rect.bottom + gap

  const top = Math.max(
    padding,
    Math.min(
      preferredTop,
      window.innerHeight - menuHeight - padding,
    ),
  )

  const left = Math.max(
    padding,
    Math.min(
      rect.right - menuWidth,
      window.innerWidth - menuWidth - padding,
    ),
  )

  menuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    visibility: 'visible',
  }
}

const handleOutsideClick = (event: PointerEvent) => {
  if (!open.value) return

  const target = event.target

  if (!(target instanceof Node)) return

  if (
    triggerRef.value?.contains(target) ||
    menuRef.value?.contains(target)
  ) {
    return
  }

  close()
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('pointerdown', handleOutsideClick)
  document.addEventListener('keydown', handleEscape)
  window.addEventListener('scroll', close, true)
  window.addEventListener('resize', close)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleOutsideClick)
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('scroll', close, true)
  window.removeEventListener('resize', close)
})

watch(() => props.employee.id, close)

const employeeName = computed(() =>
  [props.employee.firstName, props.employee.lastName].filter(Boolean).join(' '),
)


const getErrorMessage = (problem: any): string => {
  const data = problem?.data ?? problem?.response?._data ?? {}
  const validationError = Object.values(data.errors ?? {}).flat()[0]
  return String(validationError || data.message || problem?.message || 'The employee request failed.')
}

const updateEmployeeStatus = async (activate: boolean) => {
  close()
  if (loading.value) return

  const action = activate ? 'reactivate' : 'deactivate'
  if (!window.confirm(`Are you sure you want to ${action} ${employeeName.value}?`)) return

  loading.value = true
  try {
    // Use the dedicated status endpoints, NOT PATCH /admin/employees/{id}.
    const response = activate
      ? await reactivateEmployee(props.employee.id)
      : await deactivateEmployee(props.employee.id)

    const newStatus = activate ? 'Active' : 'Inactive'
    emit('statusChanged', { id: props.employee.id, status: newStatus })
    success(
      activate ? 'Employee Reactivated' : 'Employee Deactivated',
      response.message || `${employeeName.value} is now ${newStatus.toLowerCase()}.`,
    )
  } catch (problem) {
    showError(
      activate ? 'Reactivation Failed' : 'Deactivation Failed',
      getErrorMessage(problem),
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
      ref="triggerRef"
      type="button"
      class="actions-trigger"
      :disabled="loading"
      :aria-label="`Actions for ${employeeName}`"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click.stop="toggleMenu"
    >
      <MoreHorizontal :size="18" />
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="menuRef"
        class="actions-menu"
        :style="menuStyle"
        role="menu"
      >
        <NuxtLink
          :to="`/admin/employees/${employee.id}`"
          class="action-item"
          @click="close"
        >
          <Eye :size="15" />
          View Profile
        </NuxtLink>

        <template v-if="mode === 'active'">
          <NuxtLink
            :to="{
              path: '/admin/employees/edit',
              query: { id: employee.id }
            }"
            class="action-item"
            @click="close"
          >
            <Pencil :size="15" />
            Edit Employee
          </NuxtLink>

          <button
            type="button"
            class="action-item"
            @click="handleTransfer"
          >
            <ArrowRightLeft :size="15" />
            Transfer Department
          </button>

          <button
            type="button"
            class="action-item"
            @click="handleDocuments"
          >
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

        <template v-else>
          <button
            type="button"
            class="action-item"
            @click="handleDocuments"
          >
            <Files :size="15" />
            View Documents
          </button>

          <button
            type="button"
            class="action-item"
            @click="handleHistory"
          >
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
    </Teleport>
  </div>
</template>

<style scoped>
.actions-wrapper{position:relative;display:inline-flex}
.actions-trigger{display:flex;width:32px;height:32px;align-items:center;justify-content:center;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--text-secondary);cursor:pointer}
.actions-trigger:hover{border-color:var(--border);background:var(--bg-card-soft);color:var(--text-primary)}
.actions-trigger:disabled{opacity:.5;cursor:not-allowed}
.actions-menu {
  position: fixed;
  z-index: 10000;

  width: 210px;
  max-height: calc(100vh - 16px);
  overflow-y: auto;

  padding: 6px;

  border: 1px solid var(--border);
  border-radius: 9px;

  background: var(--bg-card);

  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.25);
}
.action-item{display:flex;width:100%;min-height:36px;align-items:center;gap:9px;padding:0 9px;border:0;border-radius:6px;background:transparent;color:var(--text-secondary);font-size:11px;text-align:left;text-decoration:none;cursor:pointer}
.action-item:hover{background:var(--bg-card-soft);color:var(--text-primary)}
.action-item:disabled{opacity:.5;cursor:not-allowed}
.action-item.danger{color:var(--red)}
.action-item.danger:hover{background:var(--red-soft);color:var(--red)}
.action-item.reactivate{color:var(--green)}
.action-item.reactivate:hover{background:var(--green-soft);color:var(--green)}
.action-divider{height:1px;margin:5px 0;background:var(--border-soft)}
</style>
