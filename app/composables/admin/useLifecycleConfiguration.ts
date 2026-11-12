import type { LifecyclePolicy, LifecycleStage } from '~/types/lifecycleErd'

export const useLifecycleConfiguration = () => {
  const { $api } = useNuxtApp()
  const toast = useToast()
  const policies = ref<LifecyclePolicy[]>([])
  const stages = ref<LifecycleStage[]>([])
  const employmentTypes = ref<{ id: number, name: string }[]>([])
  const loading = ref(false)
  const errorMessage = ref('')

  const load = async () => {
    loading.value = true
    errorMessage.value = ''
    try {
      const [p, s, t] = await Promise.all([
        $api<any>('/admin/lifecycle/policies'),
        $api<any>('/admin/lifecycle/stages'),
        $api<any>('/admin/employment-types'),
      ])
      employmentTypes.value = t.data
      policies.value = p.data.map((v: any) => ({
        id: v.id, name: v.name, description: v.description || '',
        employmentTypeId: v.employment_type_id, employmentTypeName: v.employment_type?.name || 'All Types',
        userId: v.user_id, creatorName: v.user?.name || '—', status: v.status,
        stagesCount: v.stages_count, createdAt: v.created_at, updatedAt: v.updated_at,
      }))
      stages.value = s.data.map((v: any) => ({
        id: v.id, lifecyclePolicyId: v.lifecycle_policy_id, policyName: v.lifecycle_policy?.name || '—',
        stageName: v.stage_name, stageCode: v.stage_code, monthsAfterHire: v.months_after_hire,
        sortOrder: v.sort_order, status: v.status, milestonesCount: v.milestones_count,
        requiresAttachment: v.requires_attachment ?? true,
      }))
    } catch (err: any) {
      errorMessage.value = err?.data?.message || 'Unable to load lifecycle configuration.'
    } finally {
      loading.value = false
    }
  }

  const request = async (url: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown) => {
    try {
      await $api(url, { method, body } as any)
      await load()
      return true
    } catch (err: any) {
      toast.error('Unable to save lifecycle configuration', err?.data?.message || 'Please try again.')
      return false
    }
  }
  const savePolicy = (p: Partial<LifecyclePolicy>) => request(`/admin/lifecycle/policies${p.id ? `/${p.id}` : ''}`, p.id ? 'PUT' : 'POST', {
    name: p.name, description: p.description, status: p.status,
    employment_type_id: employmentTypes.value.find(t => t.name === p.employmentTypeName)?.id ?? null,
  })
  const saveStage = (s: Partial<LifecycleStage>) => request(`/admin/lifecycle/stages${s.id ? `/${s.id}` : ''}`, s.id ? 'PUT' : 'POST', {
    lifecycle_policy_id: Number(s.lifecyclePolicyId), stage_name: s.stageName, stage_code: s.stageCode,
    months_after_hire: Number(s.monthsAfterHire), sort_order: Number(s.sortOrder), status: s.status,
    requires_attachment: s.requiresAttachment ?? true,
  })
  const togglePolicyStatus = (id: number) => {
    const p = policies.value.find(item => item.id === id)
    if (p) return savePolicy({ ...p, status: !p.status })
  }
  const toggleStageStatus = (id: number) => {
    const s = stages.value.find(item => item.id === id)
    if (s) return saveStage({ ...s, status: !s.status })
  }
  const deletePolicy = (id: number) => {
    if (window.confirm('Delete this policy? Policies with stages must be deactivated instead.')) return request(`/admin/lifecycle/policies/${id}`, 'DELETE')
  }
  const deleteStage = (id: number) => {
    if (window.confirm('Delete this stage? Stages with milestones must be deactivated instead.')) return request(`/admin/lifecycle/stages/${id}`, 'DELETE')
  }

  onMounted(load)
  return { policies, stages, employmentTypes, loading, errorMessage, load, savePolicy, saveStage, togglePolicyStatus, toggleStageStatus, deletePolicy, deleteStage }
}
