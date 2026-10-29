<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import WorkScheduleForm from '~/components/admin/employeeSchedule/WorkScheduleForm.vue'
import { useWorkSchedules } from '~/composables/admin/employeeSchedule/useWorkSchedules'
import type { WorkScheduleFormData } from '~/types/workSchedule'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()
const { success, error: showError } = useToast()
const {
  schedules,
  scheduleTypeNames,
  loading,
  saving,
  loadSchedules,
  updateSchedule,
} = useWorkSchedules()

const scheduleId = computed(() => Number(route.params.id))
const schedule = computed(() => schedules.value.find(item => item.id === scheduleId.value) ?? null)

const errorMessage = (problem: any) => {
  const data = problem?.data ?? problem?.response?._data ?? {}
  return String(Object.values(data.errors ?? {}).flat()[0] ?? data.message ?? problem?.message ?? 'Could not update work schedule.')
}

const handleSave = async (form: WorkScheduleFormData) => {
  if (!schedule.value) return
  try {
    const response = await updateSchedule(schedule.value.id, form)
    if (!response) return
    success('Schedule Updated', response.message)
    await router.push('/admin/work-schedules')
  } catch (problem) {
    showError('Work Schedule Error', errorMessage(problem))
  }
}

onMounted(async () => {
  if (!Number.isInteger(scheduleId.value) || scheduleId.value < 1) {
    showError('Invalid Work Schedule', 'The selected work schedule ID is invalid.')
    await router.push('/admin/work-schedules')
    return
  }

  try {
    await loadSchedules()
    if (!schedule.value) showError('Work Schedule Not Found', 'The selected schedule is no longer available.')
  } catch (problem) {
    showError('Work Schedule Error', errorMessage(problem))
  }
})
</script>

<template>
  <section class="schedule-page">
    <button type="button" class="back-button" @click="router.push('/admin/work-schedules')">
      <ArrowLeft :size="15" /> Back to Work Schedules
    </button>

    <PageHeader title="Edit Work Schedule" description="Update the complete Monday-to-Sunday work schedule." />

    <div v-if="loading" class="page-message">Loading work schedule...</div>
    <div v-else-if="!schedule" class="page-message">Work schedule not found.</div>
    <WorkScheduleForm
      v-else
      mode="edit"
      :schedule="schedule"
      :schedule-types="scheduleTypeNames"
      :saving="saving"
      @cancel="router.push('/admin/work-schedules')"
      @save="handleSave"
    />
  </section>
</template>

<style scoped>
.schedule-page{width:100%;max-width:1200px;margin:0 auto}.back-button{display:inline-flex;align-items:center;gap:6px;margin-bottom:10px;padding:0;border:0;background:transparent;color:var(--primary);font:inherit;font-size:10px;font-weight:600;cursor:pointer}.page-message{display:grid;min-height:160px;place-items:center;border:1px solid var(--border);border-radius:12px;background:var(--bg-card);color:var(--text-muted);font-size:11px}
</style>
