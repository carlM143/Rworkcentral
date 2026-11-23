<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
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

const { loadNames, nameOf, override } = useSupervisorStage()
const { success, error: toastError } = useToast()

const current = ref<SupervisorStageStatus>((props.status as SupervisorStageStatus) || 'skipped')
watch(() => props.status, (v) => { current.value = (v as SupervisorStageStatus) || 'skipped' })

onMounted(loadNames)

const who = computed(() => nameOf(props.headId))
const requestPending = computed(() => String(props.requestStatus ?? '').toLowerCase() === 'pending')

const label = computed(() => {
  switch (current.value) {
    case 'pending': return who.value ? `Waiting for ${who.value}` : 'Waiting for supervisor'
    case 'approved': return who.value ? `Approved by ${who.value}` : 'Approved by supervisor'
    case 'rejected': return who.value ? `Rejected by ${who.value}` : 'Rejected by supervisor'
    case 'overridden': return 'Skipped by HR'
    default: return 'Not required'
  }
})

const busy = ref(false)

const approveAnyway = async () => {
  const name = who.value ?? 'the supervisor'
  if (!window.confirm(`Skip ${name}'s approval? You can then approve this request yourself. This is recorded as "Skipped by HR".`)) return
  busy.value = true
  try {
    const response = await override(props.type, props.id)
    current.value = 'overridden'
    success('Supervisor step skipped', response.message)
  } catch (err) {
    const e = err as { data?: { message?: string, errors?: Record<string, string[]> } }
    toastError('Unable to skip', Object.values(e?.data?.errors ?? {})[0]?.[0] ?? e?.data?.message ?? 'Please try again.')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="stage">
    <span class="stage-pill" :class="current">{{ label }}</span>
    <button
      v-if="current === 'pending' && requestPending"
      type="button"
      class="stage-skip"
      :disabled="busy"
      @click.stop="approveAnyway"
    >
      {{ busy ? 'Skipping...' : 'Approve anyway' }}
    </button>
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
