<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import DepartmentOverrideDialog from './DepartmentOverrideDialog.vue'
import {
  useSupervisorStage,
  type SupervisorRequestType,
  type SupervisorStageStatus,
} from '~/composables/admin/approvals/useSupervisorStage'

const props = withDefaults(defineProps<{
  type: SupervisorRequestType
  id: number
  status?: string | null
  headId?: number | null
  /** The request's own status (Pending, Approved...). */
  requestStatus?: string | null
}>(), {
  status: 'skipped',
  headId: null,
  requestStatus: 'pending',
})

const { loadNames, nameOf } = useSupervisorStage()
const { success } = useToast()
const { can } = useAuth()

const current = ref<SupervisorStageStatus>((props.status as SupervisorStageStatus) || 'skipped')
watch(() => props.status, (v) => { current.value = (v as SupervisorStageStatus) || 'skipped' })

onMounted(loadNames)

const who = computed(() => nameOf(props.headId))
const requestPending = computed(() => String(props.requestStatus ?? '').toLowerCase() === 'pending')

const label = computed(() => {
  switch (current.value) {
    case 'pending': return 'Waiting for department approvers'
    case 'approved': return 'Department approved'
    case 'rejected': return who.value ? `Rejected by ${who.value}` : 'Department rejected'
    case 'overridden': return 'Department approval skipped'
    default: return 'Not required'
  }
})

const dialogOpen = ref(false)
const saved = () => { current.value = 'overridden'; success('Department approval skipped', 'The request is ready for final approval.') }
const finalPermission = computed(() => props.type === 'wfh' ? ['wfh', 'requests.approve'] : ['approvals', `${props.type === 'leave' ? 'leaves' : props.type}.approve`])
</script>

<template>
  <div class="stage">
    <span class="stage-pill" :class="current">{{ label }}</span>
    <button
      v-if="current === 'pending' && requestPending && can('approvals', 'department_override.approve') && can(finalPermission[0]!, finalPermission[1]!)"
      type="button"
      class="stage-skip"
      @click.stop="dialogOpen = true"
    >
      Skip department approval
    </button>
    <DepartmentOverrideDialog :open="dialogOpen" :type="type" :id="id" @close="dialogOpen = false" @saved="saved" />
  </div>
</template>

<style scoped>
.stage { display: grid; justify-items: start; gap: 4px; }
.stage-pill { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 999px; background: var(--bg-card-soft); color: var(--text-muted); font-size: 11px; font-weight: 700; white-space: nowrap; }
.stage-pill.pending { background: var(--orange-soft); color: var(--orange); }
.stage-pill.approved { background: var(--green-soft); color: var(--green); }
.stage-pill.rejected { background: var(--red-soft); color: var(--red); }
.stage-pill.overridden { background: var(--primary-soft); color: var(--primary); }
.stage-skip { padding: 0; border: 0; background: transparent; color: var(--primary); font-family: inherit; font-size: 11px; font-weight: 700; text-decoration: underline; cursor: pointer; }
.stage-skip:disabled { opacity: 0.6; cursor: wait; }
.stage-skip:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
</style>
