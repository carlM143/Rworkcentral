import type { EmployeeMilestone } from '~/types/lifecycleErd'

export interface MilestoneQueryParams {
  search?: string
  department?: string
  employmentType?: string
  status?: string
  page?: number
  perPage?: number
}

export interface MilestoneStats {
  total: number
  completed: number
  pending: number
  overdue: number
  dueSoon: number
  probationaryUpcoming: number
}

export interface MilestoneMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export const useLifecycleMilestones = () => {
  const { $api } = useNuxtApp()
  const milestones = ref<EmployeeMilestone[]>([])
  const departments = ref<string[]>([])
  const stats = ref<MilestoneStats>({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    dueSoon: 0,
    probationaryUpcoming: 0,
  })
  const meta = ref<MilestoneMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 6,
    total: 0,
    from: 0,
    to: 0,
  })
  const loading = ref(false)
  const errorMessage = ref('')
  const lastParams = ref<MilestoneQueryParams>({ page: 1, perPage: 6 })

  const buildQuery = (params: MilestoneQueryParams, extra: Record<string, string | number> = {}) => {
    const query: Record<string, string | number> = { ...extra }
    if (params.search?.trim()) query.search = params.search.trim()
    if (params.department) query.department = params.department
    if (params.employmentType) query.employment_type = params.employmentType
    if (params.status) query.status = params.status
    if (params.page) query.page = params.page
    if (params.perPage) query.per_page = params.perPage
    return query
  }

  let requestSeq = 0
  const load = async (params?: MilestoneQueryParams) => {
    if (params) {
      lastParams.value = { ...lastParams.value, ...params }
    }
    const seq = ++requestSeq
    loading.value = true
    errorMessage.value = ''
    try {
      const response = await $api<{
        data: EmployeeMilestone[]
        meta?: MilestoneMeta
        stats?: MilestoneStats
        departments?: string[]
      }>('/admin/lifecycle/milestones', {
        query: buildQuery(lastParams.value),
      })
      if (seq !== requestSeq) return
      const rows = response.data || []
      milestones.value = rows
      if (response.meta) {
        meta.value = response.meta
      } else {
        meta.value = {
          current_page: 1,
          last_page: 1,
          per_page: rows.length || 6,
          total: rows.length,
          from: rows.length ? 1 : 0,
          to: rows.length,
        }
      }
      if (response.stats) {
        stats.value = response.stats
      } else {
        const completed = rows.filter(m => m.status === 'completed').length
        stats.value = {
          total: rows.length,
          completed,
          pending: rows.length - completed,
          overdue: 0,
          dueSoon: 0,
          probationaryUpcoming: rows.filter(m => m.employmentType === 'Probationary' && m.stageCode === 'M6_REGULARIZATION').length,
        }
      }
      if (response.departments) {
        departments.value = response.departments
      } else {
        departments.value = Array.from(new Set(rows.map(m => m.department).filter(Boolean)))
      }
    } catch (err: any) {
      if (seq === requestSeq) {
        errorMessage.value = err?.data?.message || 'Unable to load employee milestones.'
      }
    } finally {
      if (seq === requestSeq) loading.value = false
    }
  }

  const fetchAllForExport = async (params: MilestoneQueryParams) => {
    const response = await $api<{ data: EmployeeMilestone[] }>('/admin/lifecycle/milestones', {
      query: buildQuery({ ...params, page: undefined, perPage: undefined }, { all: 1 }),
    })
    return response.data
  }

  return {
    milestones,
    departments,
    stats,
    meta,
    loading,
    errorMessage,
    load,
    fetchAllForExport,
  }
}
