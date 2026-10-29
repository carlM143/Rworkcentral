<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import WorkScheduleForm from '~/components/admin/employeeSchedule/WorkScheduleForm.vue'
import { useWorkSchedules } from '~/composables/admin/employeeSchedule/useWorkSchedules'
import type { WorkScheduleFormData } from '~/types/workSchedule'

definePageMeta({ layout: 'admin' })

const router = useRouter()
const { success, error: showError } = useToast()
const {
  schedules,
  scheduleTypeNames,
  loading,
  saving,
  loadSchedules,
  createSchedule,
} = useWorkSchedules()

const suggestedCode = computed(() => {
  const highest = schedules.value.reduce((maximum, schedule) => {
    const match = schedule.code.match(/^WS-(\d+)$/i)
    return match ? Math.max(maximum, Number(match[1])) : maximum
  }, 0)
  return `WS-${String(highest + 1).padStart(3, '0')}`
})

const errorMessage = (problem: any) => {
  const data = problem?.data ?? problem?.response?._data ?? {}
  return String(Object.values(data.errors ?? {}).flat()[0] ?? data.message ?? problem?.message ?? 'Could not save work schedule.')
}

const handleSave = async (form: WorkScheduleFormData) => {
  try {
    const response = await createSchedule(form)
    if (!response) return
    success('Work Schedule Added', response.message)
    await router.push('/admin/work-schedules')
  } catch (problem) {
    showError('Work Schedule Error', errorMessage(problem))
  }
}

onMounted(async () => {
  try {
    await loadSchedules()
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

    <PageHeader title="Add Work Schedule" description="Create a reusable schedule with separate working times for every day." />

    <div v-if="loading" class="page-message">Loading schedule information...</div>
    <WorkScheduleForm
      v-else
      mode="create"
      :schedule-types="scheduleTypeNames"
      :suggested-code="suggestedCode"
      :saving="saving"
      @cancel="router.push('/admin/work-schedules')"
      @save="handleSave"
    />
  </section>
</template>

<style scoped>
.schedule-page{width:100%;max-width:1200px;margin:0 auto}.back-button{display:inline-flex;align-items:center;gap:6px;margin-bottom:10px;padding:0;border:0;background:transparent;color:var(--primary);font:inherit;font-size:10px;font-weight:600;cursor:pointer}.page-message{display:grid;min-height:160px;place-items:center;border:1px solid var(--border);border-radius:12px;background:var(--bg-card);color:var(--text-muted);font-size:11px}
</style>
