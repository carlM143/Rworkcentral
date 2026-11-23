export type SupervisorRequestType = 'leave' | 'overtime' | 'undertime' | 'wfh' | 'oba'
export type SupervisorStageStatus = 'pending' | 'approved' | 'rejected' | 'overridden' | 'skipped'

export const useSupervisorStage = () => {
  const { $api } = useNuxtApp()
  const names = useState<Record<number, string>>('supervisor-approver-names', () => ({}))
  const loaded = useState<boolean>('supervisor-approver-names-loaded', () => false)

  const loadNames = async () => {
    if (loaded.value) return
    loaded.value = true
    try {
      const response = await $api<{ data: Record<number, string> }>('/admin/supervisor-approvals/approvers')
      names.value = response.data ?? {}
    } catch {
      loaded.value = false
    }
  }

  const nameOf = (userId?: number | null) => (userId ? names.value[userId] ?? null : null)

  const override = (type: SupervisorRequestType, id: number) =>
    $api<{ message: string }>(`/admin/supervisor-approvals/${type}/${id}/override`, { method: 'PATCH' })

  return { loadNames, nameOf, override }
}
