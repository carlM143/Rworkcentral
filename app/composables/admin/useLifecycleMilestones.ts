import type { EmployeeMilestone } from '~/types/lifecycleErd'

export const useLifecycleMilestones = () => {
  const { $api } = useNuxtApp()
  const milestones = ref<EmployeeMilestone[]>([])
  const loading = ref(false)
  const errorMessage = ref('')
  const load = async () => {
    loading.value = true
    errorMessage.value = ''
    try {
      const response = await $api<{ data: EmployeeMilestone[] }>('/admin/lifecycle/milestones')
      milestones.value = response.data
    } catch (err: any) {
      errorMessage.value = err?.data?.message || 'Unable to load employee milestones.'
    } finally {
      loading.value = false
    }
  }
  onMounted(load)
  return { milestones, loading, errorMessage, load }
}
