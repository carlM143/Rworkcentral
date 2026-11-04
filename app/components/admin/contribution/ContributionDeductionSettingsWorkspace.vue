<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Landmark,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-vue-next'

import { useCompanyApi, type CompanyRecord } from '~/composables/admin/useCompanyApi'
import { useDepartmentApi, type DepartmentApiRecord } from '~/composables/admin/departments/useDepartmentApi'

interface SalaryTypeRecord {
  id: number
  type_name: string
}

// =====================================================
// TYPES
// =====================================================

type Row = Record<string, string | number | boolean | null>

type Field = {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'select'
  options?: string[]
  optionLabels?: Record<string, string>
  required?: boolean
}

type Column = {
  key: string
  label: string
  format?: 'money' | 'percent' | 'status' | 'schedule'
}

// =====================================================
// SECTION CONFIG
// =====================================================

const title = 'Contribution Settings'
const subtitle = 'Configure how employee statutory contributions (SSS, Pag-IBIG, PhilHealth) are deducted per department and salary type across monthly cutoffs.'
const addLabel = 'Add Deduction Setting'

const { $api } = useNuxtApp()
const { contributionTypes, loadContributionTypes } = useContributionTypes()
const {
  deductionSettings,
  errorMessage,
  loadDeductionSettings,
  createDeductionSetting,
  updateDeductionSetting,
  deleteDeductionSetting,
} = useContributionDeductionSettings()

const companyApi = useCompanyApi()
const departmentApi = useDepartmentApi()

const companies = ref<CompanyRecord[]>([])
const departments = ref<DepartmentApiRecord[]>([])
const salaryTypes = ref<SalaryTypeRecord[]>([])
const localError = ref('')

const companyOptions = computed(() =>
  companies.value.map(c => String(c.id)),
)

const companyLabels = computed<Record<string, string>>(() =>
  Object.fromEntries(
    companies.value.map(c => [String(c.id), c.company_name]),
  ),
)

const departmentOptions = computed(() => [
  'all',
  ...departments.value.map(d => String(d.id)),
])

const departmentLabels = computed<Record<string, string>>(() => ({
  all: 'All Departments',
  ...Object.fromEntries(
    departments.value.map(d => [
      String(d.id),
      `${d.department_name} (${d.department_code})`,
    ]),
  ),
}))

const salaryTypeOptions = computed(() =>
  salaryTypes.value.map(s => String(s.id)),
)

const salaryTypeLabels = computed<Record<string, string>>(() =>
  Object.fromEntries(
    salaryTypes.value.map(s => [String(s.id), s.type_name]),
  ),
)

const typeOptions = computed(() =>
  contributionTypes.value.map(t => String(t.id)),
)

const typeLabels = computed<Record<string, string>>(() =>
  Object.fromEntries(
    contributionTypes.value.map(t => [
      String(t.id),
      `${t.contribution_code} — ${t.contribution_name}`,
    ]),
  ),
)

const deductionScheduleLabels: Record<string, string> = {
  first_deduction: '1st Deduction in Month (100% / 0%)',
  second_deduction: '2nd Deduction in Month (0% / 100%)',
  split_50_50: 'Split Evenly (50% / 50%)',
  monthly_full: 'Monthly Full Deduction (100%)',
  custom_split: 'Custom Cutoff Split',
  weekly_2nd_saturday: '2nd Saturday of Month (100% on 2nd Sat)',
  weekly_4th_saturday: '4th Saturday of Month (100% on 4th Sat)',
  weekly_every_saturday_25: 'Every Saturday — 4 Weeks Split (25% × 4 Saturdays)',
  weekly_1st_saturday: '1st Saturday of Month (100% on 1st Sat)',
  weekly_3rd_saturday: '3rd Saturday of Month (100% on 3rd Sat)',
  weekly_custom: 'Custom Weekly Saturday Split',
}

const isMonthlySalaryType = (salaryTypeName?: string | null) => {
  return String(salaryTypeName ?? '').toLowerCase() === 'monthly'
}

const isWeeklySalaryType = (salaryTypeName?: string | null) => {
  const lower = String(salaryTypeName ?? '').toLowerCase()
  return lower.includes('weekly') || lower === 'daily'
}

const isModalMonthly = computed(() => {
  const salName = salaryTypeLabels.value[String(form.value.salary_type_id ?? '')] ?? ''
  return isMonthlySalaryType(salName) || form.value.deduction_schedule === 'monthly_full'
})

const isModalWeekly = computed(() => {
  const salName = salaryTypeLabels.value[String(form.value.salary_type_id ?? '')] ?? ''
  return isWeeklySalaryType(salName) || String(form.value.deduction_schedule ?? '').startsWith('weekly_')
})

const formatScheduleBadge = (
  scheduleKey: string | null | undefined,
  firstPct: string | number | null | undefined,
  secondPct: string | number | null | undefined,
  salaryTypeName?: string | null,
  w1?: string | number | null,
  w2?: string | number | null,
  w3?: string | number | null,
  w4?: string | number | null,
) => {
  const f = Number(firstPct ?? 0)
  const s = Number(secondPct ?? 0)

  if (isMonthlySalaryType(salaryTypeName) || scheduleKey === 'monthly_full') {
    return 'Monthly Full Deduction (100%)'
  }

  if (isWeeklySalaryType(salaryTypeName) || String(scheduleKey ?? '').startsWith('weekly_')) {
    if (scheduleKey === 'weekly_2nd_saturday') return '2nd Saturday of Month (100%)'
    if (scheduleKey === 'weekly_4th_saturday') return '4th Saturday of Month (100%)'
    if (scheduleKey === 'weekly_1st_saturday') return '1st Saturday of Month (100%)'
    if (scheduleKey === 'weekly_3rd_saturday') return '3rd Saturday of Month (100%)'
    if (scheduleKey === 'weekly_every_saturday_25') return 'Every Saturday (25% × 4 Wks)'
    const n1 = Number(w1 ?? 0)
    const n2 = Number(w2 ?? 0)
    const n3 = Number(w3 ?? 0)
    const n4 = Number(w4 ?? 0)
    if (n1 + n2 + n3 + n4 > 0) {
      return `Sat: ${n1}% / ${n2}% / ${n3}% / ${n4}%`
    }
  }

  if (scheduleKey === 'first_deduction' || (Math.abs(f - 100) < 0.01 && Math.abs(s) < 0.01)) {
    return '1st Deduction (First Cutoff)'
  }

  if (scheduleKey === 'second_deduction' || (Math.abs(f) < 0.01 && Math.abs(s - 100) < 0.01)) {
    return '2nd Deduction (Second Cutoff)'
  }

  if (scheduleKey === 'split_50_50' || (Math.abs(f - 50) < 0.01 && Math.abs(s - 50) < 0.01)) {
    return 'Split Cutoffs (50% / 50%)'
  }

  return `${f.toFixed(0)}% 1st / ${s.toFixed(0)}% 2nd`
}

const formatBreakdownText = (
  firstPct: string | number | null | undefined,
  secondPct: string | number | null | undefined,
  salaryTypeName?: string | null,
  w1?: string | number | null,
  w2?: string | number | null,
  w3?: string | number | null,
  w4?: string | number | null,
  scheduleKey?: string | null,
) => {
  if (isMonthlySalaryType(salaryTypeName) || scheduleKey === 'monthly_full') {
    return 'Once a Month: 100% (Full Monthly Payout)'
  }
  if (isWeeklySalaryType(salaryTypeName) && (w1 !== null && w1 !== undefined)) {
    return `Sat 1: ${Number(w1 ?? 0)}% · Sat 2: ${Number(w2 ?? 0)}% · Sat 3: ${Number(w3 ?? 0)}% · Sat 4: ${Number(w4 ?? 0)}%`
  }
  return `1st: ${Number(firstPct ?? 0).toFixed(0)}% · 2nd: ${Number(secondPct ?? 0).toFixed(0)}%`
}

const columns: Column[] = [
  { key: 'department_name', label: 'Department' },
  { key: 'salary_type_name', label: 'Salary Type' },
  { key: 'type_name', label: 'Contribution Type' },
  { key: 'deduction_schedule_label', label: 'Deduction Timing', format: 'schedule' },
  { key: 'breakdown_label', label: 'Cutoff / Saturday Breakdown' },
  { key: 'first_cutoff_percent', label: '1st Half', format: 'percent' },
  { key: 'second_cutoff_percent', label: '2nd Half', format: 'percent' },
  { key: 'effective_from', label: 'Effective From' },
  { key: 'status', label: 'Status', format: 'status' },
]

const fields = computed<Field[]>(() => {
  const baseFields: Field[] = [
    {
      key: 'company_id',
      label: 'Company',
      type: 'select',
      options: companyOptions.value,
      optionLabels: companyLabels.value,
      required: true,
    },
    {
      key: 'department_id',
      label: 'Department',
      type: 'select',
      options: departmentOptions.value,
      optionLabels: departmentLabels.value,
      required: true,
    },
    {
      key: 'salary_type_id',
      label: 'Salary Type',
      type: 'select',
      options: salaryTypeOptions.value,
      optionLabels: salaryTypeLabels.value,
      required: true,
    },
    {
      key: 'contribution_type_id',
      label: 'Contribution Type',
      type: 'select',
      options: typeOptions.value,
      optionLabels: typeLabels.value,
      required: true,
    },
    {
      key: 'deduction_schedule',
      label: isModalMonthly.value
        ? 'Monthly Deduction Schedule'
        : isModalWeekly.value
          ? 'Weekly Saturday Schedule'
          : 'Deduction Schedule in Month',
      type: 'select',
      options: isModalMonthly.value
        ? ['monthly_full']
        : isModalWeekly.value
          ? [
              'weekly_2nd_saturday',
              'weekly_4th_saturday',
              'weekly_every_saturday_25',
              'weekly_1st_saturday',
              'weekly_3rd_saturday',
              'weekly_custom',
            ]
          : ['first_deduction', 'second_deduction', 'split_50_50', 'custom_split'],
      optionLabels: deductionScheduleLabels,
      required: true,
    },
  ]

  if (isModalMonthly.value) {
    baseFields.push(
      { key: 'first_cutoff_percent', label: 'Monthly Full Deduction (%)', type: 'number', required: true },
    )
  } else if (isModalWeekly.value) {
    baseFields.push(
      { key: 'week_1_percent', label: '1st Saturday Deduction (%)', type: 'number', required: true },
      { key: 'week_2_percent', label: '2nd Saturday Deduction (%)', type: 'number', required: true },
      { key: 'week_3_percent', label: '3rd Saturday Deduction (%)', type: 'number', required: true },
      { key: 'week_4_percent', label: '4th Saturday Deduction (%)', type: 'number', required: true },
    )
  } else {
    baseFields.push(
      { key: 'first_cutoff_percent', label: '1st Deduction / First Cutoff (%)', type: 'number', required: true },
      { key: 'second_cutoff_percent', label: '2nd Deduction / Second Cutoff (%)', type: 'number', required: true },
    )
  }

  baseFields.push(
    { key: 'effective_from', label: 'Effective From', type: 'date', required: true },
    { key: 'effective_to', label: 'Effective To', type: 'date' },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: ['Active', 'Inactive'],
      required: true,
    },
  )

  return baseFields
})

const numberOrNull = (value: Row[string]) => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

const initialRows = computed<Row[]>(() =>
  deductionSettings.value.map((item) => {
    const deptName = item.department
      ? item.department.department_name
      : (item.department_id ? (departmentLabels.value[String(item.department_id)] ?? `Dept #${item.department_id}`) : 'All Departments')

    const salName = item.salary_type
      ? item.salary_type.type_name
      : (item.salary_type_id ? (salaryTypeLabels.value[String(item.salary_type_id)] ?? `Salary Type #${item.salary_type_id}`) : 'Semi-Monthly')

    const resolvedSchedule = (() => {
      if (item.deduction_schedule) return item.deduction_schedule
      const f = Number(item.first_cutoff_percent ?? 0)
      const s = Number(item.second_cutoff_percent ?? 0)
      if (Math.abs(f - 100) < 0.01 && Math.abs(s) < 0.01) return 'first_deduction'
      if (Math.abs(f) < 0.01 && Math.abs(s - 100) < 0.01) return 'second_deduction'
      if (Math.abs(f - 50) < 0.01 && Math.abs(s - 50) < 0.01) return 'split_50_50'
      return 'custom_split'
    })()

    return {
      id: item.id,
      company_id: String(item.company_id),
      company_name: item.company?.company_name
        ?? companyLabels.value[String(item.company_id)]
        ?? `Company #${item.company_id}`,
      department_id: item.department_id ? String(item.department_id) : 'all',
      department_name: deptName,
      salary_type_id: item.salary_type_id ? String(item.salary_type_id) : '',
      salary_type_name: salName,
      contribution_type_id: String(item.contribution_type_id),
      type_name: item.contribution_type
        ? `${item.contribution_type.contribution_code} — ${item.contribution_type.contribution_name}`
        : (typeLabels.value[String(item.contribution_type_id)] ?? `Type #${item.contribution_type_id}`),
      deduction_schedule: resolvedSchedule,
      deduction_schedule_label: formatScheduleBadge(
        resolvedSchedule,
        item.first_cutoff_percent,
        item.second_cutoff_percent,
        salName,
        item.week_1_percent,
        item.week_2_percent,
        item.week_3_percent,
        item.week_4_percent,
      ),
      breakdown_label: formatBreakdownText(
        item.first_cutoff_percent,
        item.second_cutoff_percent,
        salName,
        item.week_1_percent,
        item.week_2_percent,
        item.week_3_percent,
        item.week_4_percent,
        resolvedSchedule,
      ),
      first_cutoff_percent: item.first_cutoff_percent,
      second_cutoff_percent: item.second_cutoff_percent,
      week_1_percent: item.week_1_percent ?? 0,
      week_2_percent: item.week_2_percent ?? 0,
      week_3_percent: item.week_3_percent ?? 0,
      week_4_percent: item.week_4_percent ?? 0,
      effective_from: item.effective_from ? String(item.effective_from).slice(0, 10) : '',
      effective_to: item.effective_to ? String(item.effective_to).slice(0, 10) : null,
      status: item.is_status ? 'Active' : 'Inactive',
    }
  }),
)

// =====================================================
// TABLE STATE
// =====================================================

const records = ref<Row[]>([])
const search = ref('')
const filterSalaryType = ref('all')
const filterStatus = ref('all')
const page = ref(1)
const perPage = 10

// =====================================================
// MODAL STATE
// =====================================================

const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const deletingId = ref<number | null>(null)
const form = ref<Row>({})

// =====================================================
// THREE-DOTS DROPDOWN
// =====================================================

const openActionId = ref<number | null>(null)
const actionButtonRef = ref<HTMLElement | null>(null)

const actionPosition = ref({
  top: 0,
  left: 0,
})

const closeActions = () => {
  openActionId.value = null
  actionButtonRef.value = null
}

const updateActionPosition = () => {
  if (!actionButtonRef.value) return

  const rect = actionButtonRef.value.getBoundingClientRect()
  const menuWidth = 230
  const menuHeight = 112
  const gap = 6

  const left = Math.max(
    8,
    Math.min(
      rect.right - menuWidth,
      window.innerWidth - menuWidth - 8,
    ),
  )

  const showAbove = rect.bottom + menuHeight + gap > window.innerHeight
  const top = showAbove
    ? rect.top - menuHeight - gap
    : rect.bottom + gap

  actionPosition.value = {
    top: Math.max(8, top),
    left,
  }
}

const toggleActions = async (
  id: number,
  event: MouseEvent,
) => {
  if (openActionId.value === id) {
    closeActions()
    return
  }

  actionButtonRef.value = event.currentTarget as HTMLElement
  openActionId.value = id

  await nextTick()
  updateActionPosition()
}

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null

  if (!target) return
  if (actionButtonRef.value?.contains(target)) return
  if (target.closest('.cw-action-dropdown')) return

  closeActions()
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return
  closeActions()
  modalOpen.value = false
  deletingId.value = null
}

const loadCompanies = async () => {
  try {
    const res = await companyApi.getCompanies()
    companies.value = res.data ?? []
  } catch {
    // silently fallback
  }
}

const loadDepartments = async () => {
  try {
    const res = await departmentApi.getDepartments()
    departments.value = res.data ?? []
  } catch {
    // silently fallback
  }
}

const loadSalaryTypes = async () => {
  try {
    const res = await $api<{ success: boolean; data: SalaryTypeRecord[] }>('/admin/salary-types')
    salaryTypes.value = res.data ?? []
  } catch {
    // silently fallback
  }
}

onMounted(async () => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleEscape)
  window.addEventListener('scroll', closeActions, true)
  window.addEventListener('resize', closeActions)

  await Promise.all([
    loadCompanies(),
    loadDepartments(),
    loadSalaryTypes(),
    loadContributionTypes(),
    loadDeductionSettings(),
  ])
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('scroll', closeActions, true)
  window.removeEventListener('resize', closeActions)
})

// =====================================================
// COMPUTED TABLE DATA
// =====================================================

const filtered = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return records.value.filter((row) => {
    const matchesSearch = Object.values(row).some((value) =>
      String(value ?? '').toLowerCase().includes(keyword),
    )

    const matchesSalaryType =
      filterSalaryType.value === 'all' ||
      String(row.salary_type_name ?? '').toLowerCase() === filterSalaryType.value.toLowerCase()

    const matchesStatus =
      filterStatus.value === 'all' ||
      (
        filterStatus.value === 'active'
          ? row.status === 'Active'
          : row.status === 'Inactive'
      )

    return matchesSearch && matchesSalaryType && matchesStatus
  })
})

const activeCount = computed(() =>
  records.value.filter((row) => row.status === 'Active').length,
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / perPage)),
)

const visibleRows = computed(() => {
  const start = (page.value - 1) * perPage
  return filtered.value.slice(start, start + perPage)
})

const paginationStart = computed(() => {
  if (filtered.value.length === 0) return 0
  return (page.value - 1) * perPage + 1
})

const paginationEnd = computed(() =>
  Math.min(page.value * perPage, filtered.value.length),
)

const pageNumbers = computed(() => {
  const total = totalPages.value
  const maxVisible = 5

  const start = Math.max(
    1,
    Math.min(page.value - 2, total - maxVisible + 1),
  )

  const end = Math.min(total, start + maxVisible - 1)

  return Array.from(
    { length: end - start + 1 },
    (_, index) => start + index,
  )
})

// =====================================================
// WATCHERS
// =====================================================

watch([search, filterSalaryType, filterStatus], () => {
  page.value = 1
  closeActions()
})

watch(page, () => {
  closeActions()
})

watch(
  initialRows,
  (rows) => {
    records.value = rows.map((row) => ({ ...row }))
    page.value = 1
    closeActions()
  },
  { immediate: true },
)

// =====================================================
// FORM ACTIONS
// =====================================================

const defaultDepartmentId = computed(() => {
  const rws = departments.value.find(
    d => d.department_code === 'RWS' || d.department_name.toLowerCase().includes('r web'),
  )
  return rws ? String(rws.id) : (departments.value[0] ? String(departments.value[0].id) : 'all')
})

const defaultSalaryTypeId = computed(() => {
  const semi = salaryTypes.value.find(
    s => s.type_name.toLowerCase().includes('semi'),
  )
  return semi ? String(semi.id) : (salaryTypes.value[0] ? String(salaryTypes.value[0].id) : '')
})

const startForm = (record?: Row) => {
  closeActions()
  localError.value = ''

  editingId.value = record
    ? Number(record.id)
    : null

  const firstTypeId = typeOptions.value[0] ?? ''
  const selectedType = contributionTypes.value.find(t => String(t.id) === firstTypeId)
  const isSss = selectedType?.contribution_code?.toUpperCase() === 'SSS'

  form.value = record
    ? { ...record }
    : {
        company_id: companyOptions.value[0] ?? '',
        department_id: defaultDepartmentId.value,
        salary_type_id: defaultSalaryTypeId.value,
        contribution_type_id: firstTypeId,
        deduction_schedule: isSss ? 'first_deduction' : 'second_deduction',
        first_cutoff_percent: isSss ? 100 : 0,
        second_cutoff_percent: isSss ? 0 : 100,
        week_1_percent: 0,
        week_2_percent: isSss ? 100 : 0,
        week_3_percent: 0,
        week_4_percent: isSss ? 0 : 100,
        effective_from: '2026-01-01',
        status: 'Active',
      }

  modalOpen.value = true
}

let updatingCutoff = false

const applyCutoffPreset = (first: number, second: number, scheduleKey?: string) => {
  updatingCutoff = true
  form.value.first_cutoff_percent = first
  form.value.second_cutoff_percent = second
  if (scheduleKey) {
    form.value.deduction_schedule = scheduleKey
  } else if (first === 100 && second === 0) {
    form.value.deduction_schedule = 'first_deduction'
  } else if (first === 0 && second === 100) {
    form.value.deduction_schedule = 'second_deduction'
  } else if (first === 50 && second === 50) {
    form.value.deduction_schedule = 'split_50_50'
  }
  nextTick(() => {
    updatingCutoff = false
  })
}

const applyWeeklyPreset = (
  w1: number,
  w2: number,
  w3: number,
  w4: number,
  scheduleKey: string,
) => {
  updatingCutoff = true
  form.value.week_1_percent = w1
  form.value.week_2_percent = w2
  form.value.week_3_percent = w3
  form.value.week_4_percent = w4
  form.value.first_cutoff_percent = Number((w1 + w2).toFixed(2))
  form.value.second_cutoff_percent = Number((w3 + w4).toFixed(2))
  form.value.deduction_schedule = scheduleKey
  nextTick(() => {
    updatingCutoff = false
  })
}

watch(
  () => form.value.deduction_schedule,
  (val) => {
    if (!modalOpen.value || updatingCutoff) return
    if (val === 'first_deduction') {
      applyCutoffPreset(100, 0, 'first_deduction')
    } else if (val === 'second_deduction') {
      applyCutoffPreset(0, 100, 'second_deduction')
    } else if (val === 'split_50_50') {
      applyCutoffPreset(50, 50, 'split_50_50')
    } else if (val === 'weekly_1st_saturday') {
      applyWeeklyPreset(100, 0, 0, 0, 'weekly_1st_saturday')
    } else if (val === 'weekly_2nd_saturday') {
      applyWeeklyPreset(0, 100, 0, 0, 'weekly_2nd_saturday')
    } else if (val === 'weekly_3rd_saturday') {
      applyWeeklyPreset(0, 0, 100, 0, 'weekly_3rd_saturday')
    } else if (val === 'weekly_4th_saturday') {
      applyWeeklyPreset(0, 0, 0, 100, 'weekly_4th_saturday')
    } else if (val === 'weekly_every_saturday_25') {
      applyWeeklyPreset(25, 25, 25, 25, 'weekly_every_saturday_25')
    }
  },
)

watch(
  [() => form.value.contribution_type_id, () => form.value.salary_type_id],
  ([typeId, salTypeId]) => {
    if (!modalOpen.value || editingId.value !== null || updatingCutoff) return
    const salName = salaryTypeLabels.value[String(salTypeId)]?.toLowerCase() ?? ''
    if (salName === 'monthly') {
      applyCutoffPreset(100, 0, 'monthly_full')
      return
    }
    const cType = contributionTypes.value.find(t => String(t.id) === String(typeId))
    const code = cType?.contribution_code?.toUpperCase() ?? ''
    if (isWeeklySalaryType(salName)) {
      if (code === 'SSS') {
        applyWeeklyPreset(0, 100, 0, 0, 'weekly_2nd_saturday')
      } else {
        applyWeeklyPreset(0, 0, 0, 100, 'weekly_4th_saturday')
      }
      return
    }
    if (code === 'SSS') {
      applyCutoffPreset(100, 0, 'first_deduction')
    } else if (code === 'HDMF' || code === 'PHIC') {
      applyCutoffPreset(0, 100, 'second_deduction')
    }
  },
)

watch(
  [
    () => form.value.week_1_percent,
    () => form.value.week_2_percent,
    () => form.value.week_3_percent,
    () => form.value.week_4_percent,
  ],
  ([w1, w2, w3, w4]) => {
    if (!modalOpen.value || !isModalWeekly.value || updatingCutoff) return
    const n1 = Number(w1 ?? 0)
    const n2 = Number(w2 ?? 0)
    const n3 = Number(w3 ?? 0)
    const n4 = Number(w4 ?? 0)
    updatingCutoff = true
    form.value.first_cutoff_percent = Number((n1 + n2).toFixed(2))
    form.value.second_cutoff_percent = Number((n3 + n4).toFixed(2))
    if (n1 === 0 && n2 === 100 && n3 === 0 && n4 === 0) form.value.deduction_schedule = 'weekly_2nd_saturday'
    else if (n1 === 0 && n2 === 0 && n3 === 0 && n4 === 100) form.value.deduction_schedule = 'weekly_4th_saturday'
    else if (n1 === 25 && n2 === 25 && n3 === 25 && n4 === 25) form.value.deduction_schedule = 'weekly_every_saturday_25'
    else if (n1 === 100 && n2 === 0 && n3 === 0 && n4 === 0) form.value.deduction_schedule = 'weekly_1st_saturday'
    else if (n1 === 0 && n2 === 0 && n3 === 100 && n4 === 0) form.value.deduction_schedule = 'weekly_3rd_saturday'
    else form.value.deduction_schedule = 'weekly_custom'
    nextTick(() => {
      updatingCutoff = false
    })
  },
)

watch(
  () => form.value.first_cutoff_percent,
  (val) => {
    if (!modalOpen.value || isModalWeekly.value || updatingCutoff) return
    if (val === '' || val === null || val === undefined) return
    const num = Number(val)
    if (!Number.isNaN(num) && num >= 0 && num <= 100) {
      updatingCutoff = true
      const second = Number((100 - num).toFixed(2))
      form.value.second_cutoff_percent = second
      if (num === 100 && second === 0) form.value.deduction_schedule = 'first_deduction'
      else if (num === 0 && second === 100) form.value.deduction_schedule = 'second_deduction'
      else if (num === 50 && second === 50) form.value.deduction_schedule = 'split_50_50'
      else form.value.deduction_schedule = 'custom_split'
      nextTick(() => {
        updatingCutoff = false
      })
    }
  },
)

watch(
  () => form.value.second_cutoff_percent,
  (val) => {
    if (!modalOpen.value || isModalWeekly.value || updatingCutoff) return
    if (val === '' || val === null || val === undefined) return
    const num = Number(val)
    if (!Number.isNaN(num) && num >= 0 && num <= 100) {
      updatingCutoff = true
      const first = Number((100 - num).toFixed(2))
      form.value.first_cutoff_percent = first
      if (first === 100 && num === 0) form.value.deduction_schedule = 'first_deduction'
      else if (first === 0 && num === 100) form.value.deduction_schedule = 'second_deduction'
      else if (first === 50 && num === 50) form.value.deduction_schedule = 'split_50_50'
      else form.value.deduction_schedule = 'custom_split'
      nextTick(() => {
        updatingCutoff = false
      })
    }
  },
)

const closeForm = () => {
  modalOpen.value = false
  editingId.value = null
  localError.value = ''
  form.value = {}
}

const editSelectedRecord = () => {
  const record = records.value.find(
    (row) => Number(row.id) === openActionId.value,
  )

  if (!record) {
    closeActions()
    return
  }

  startForm(record)
}

const persistRecord = async (row: Row) => {
  const companyId = Number(row.company_id)
  const deptId = row.department_id && row.department_id !== 'all' ? Number(row.department_id) : null
  const salaryTypeId = row.salary_type_id ? Number(row.salary_type_id) : null
  const typeId = Number(row.contribution_type_id)

  const salName = salaryTypeLabels.value[String(row.salary_type_id ?? '')] ?? ''
  const monthlyMode = isMonthlySalaryType(salName) || row.deduction_schedule === 'monthly_full'
  const weeklyMode = !monthlyMode && (isWeeklySalaryType(salName) || String(row.deduction_schedule ?? '').startsWith('weekly_'))

  const w1 = weeklyMode ? (numberOrNull(row.week_1_percent) ?? 0) : null
  const w2 = weeklyMode ? (numberOrNull(row.week_2_percent) ?? 0) : null
  const w3 = weeklyMode ? (numberOrNull(row.week_3_percent) ?? 0) : null
  const w4 = weeklyMode ? (numberOrNull(row.week_4_percent) ?? 0) : null

  const firstCutoff = monthlyMode
    ? 100
    : weeklyMode
      ? Number(((w1 ?? 0) + (w2 ?? 0)).toFixed(2))
      : numberOrNull(row.first_cutoff_percent)
  const secondCutoff = monthlyMode
    ? 0
    : weeklyMode
      ? Number(((w3 ?? 0) + (w4 ?? 0)).toFixed(2))
      : numberOrNull(row.second_cutoff_percent)

  if (!companyId) {
    localError.value = 'Please select a company.'
    return
  }

  if (!typeId) {
    localError.value = 'Please select a contribution type.'
    return
  }

  if (weeklyMode) {
    const weeklySum = (w1 ?? 0) + (w2 ?? 0) + (w3 ?? 0) + (w4 ?? 0)
    if (Math.abs(weeklySum - 100) > 0.01) {
      localError.value = 'The 4 Saturday deduction percentages (1st + 2nd + 3rd + 4th Saturday) must total 100%.'
      return
    }
  }

  if (firstCutoff === null || firstCutoff < 0 || firstCutoff > 100) {
    localError.value = 'First cutoff percentage must be between 0% and 100%.'
    return
  }

  if (secondCutoff === null || secondCutoff < 0 || secondCutoff > 100) {
    localError.value = 'Second cutoff percentage must be between 0% and 100%.'
    return
  }

  if (Math.abs((firstCutoff + secondCutoff) - 100) > 0.01) {
    localError.value = 'First cutoff and second cutoff percentages must total 100%.'
    return
  }

  if (!row.effective_from) {
    localError.value = 'Effective From date is required.'
    return
  }

  if (row.effective_to && String(row.effective_to) < String(row.effective_from)) {
    localError.value = 'Effective To date cannot be before Effective From date.'
    return
  }

  const payload = {
    company_id: companyId,
    department_id: deptId,
    salary_type_id: salaryTypeId,
    contribution_type_id: typeId,
    deduction_schedule: row.deduction_schedule ? String(row.deduction_schedule) : null,
    first_cutoff_percent: firstCutoff,
    second_cutoff_percent: secondCutoff,
    week_1_percent: w1,
    week_2_percent: w2,
    week_3_percent: w3,
    week_4_percent: w4,
    effective_from: String(row.effective_from),
    effective_to: row.effective_to ? String(row.effective_to) : null,
    is_status: row.status === 'Active',
  }

  try {
    if (row.id) {
      await updateDeductionSetting(Number(row.id), payload)
    } else {
      await createDeductionSetting(payload)
    }
    closeForm()
  } catch {
    // errorMessage is handled by composable
  }
}

const save = async () => {
  localError.value = ''

  if (editingId.value !== null) {
    const payload: Row = { ...form.value, id: editingId.value }
    await persistRecord(payload)
  } else {
    const payload: Row = { ...form.value }
    await persistRecord(payload)
  }
}

// =====================================================
// DELETE ACTIONS
// =====================================================

const confirmDelete = () => {
  if (openActionId.value === null) return
  deletingId.value = openActionId.value
  closeActions()
}

const remove = async () => {
  if (deletingId.value === null) return
  const deletedId = deletingId.value

  try {
    await deleteDeductionSetting(deletedId)
  } catch {
    // errorMessage handled by composable
  } finally {
    deletingId.value = null
    page.value = Math.min(page.value, totalPages.value)
  }
}

// =====================================================
// FORMATTERS
// =====================================================

const fmt = (
  value: Row[string],
  format?: Column['format'],
) => {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '—'
  }

  if (format === 'percent') {
    return `${Number(value).toFixed(2)}%`
  }

  return String(value)
}

// =====================================================
// CSV EXPORT
// =====================================================

const csvValue = (value: unknown) =>
  `"${String(value ?? '').replace(/"/g, '""')}"`

const exportCsv = () => {
  const header = columns
    .map((column) => csvValue(column.label))
    .join(',')

  const rows = filtered.value.map((row) =>
    columns
      .map((column) => csvValue(row[column.key]))
      .join(','),
  )

  const csv = [header, ...rows].join('\r\n')

  const blob = new Blob(
    ['\ufeff' + csv],
    { type: 'text/csv;charset=utf-8;' },
  )

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download =
    title.toLowerCase().replace(/\W+/g, '-') + '.csv'

  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="cw">
    <div v-if="errorMessage || localError" class="cw-error-banner" role="alert">
      {{ localError || errorMessage }}
    </div>

    <!-- =================================================
         PAGE HEADER
    ================================================== -->

    <div class="cw-header">
      <div class="cw-header-info">
        <div class="cw-eyebrow">
          <Landmark :size="14" />
          <span>PAYROLL CONFIGURATION / CONTRIBUTIONS</span>
        </div>

        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
      </div>

      <div class="cw-header-actions">
        <button
          type="button"
          class="cw-btn cw-outline"
          @click="exportCsv"
        >
          <Download :size="16" />
          <span>Export CSV</span>
        </button>

        <button
          type="button"
          class="cw-btn cw-primary"
          @click="startForm()"
        >
          <Plus :size="16" />
          <span>{{ addLabel }}</span>
        </button>
      </div>
    </div>

    <!-- =================================================
         SUMMARY CARDS
    ================================================== -->

    <div class="cw-stats">
      <div class="cw-stat">
        <span>Total Records</span>
        <strong>{{ records.length }}</strong>
        <small>Configured records</small>
      </div>

      <div class="cw-stat">
        <span>Active Records</span>
        <strong>{{ activeCount }}</strong>

        <small class="cw-green">
          <CheckCircle2 :size="13" />
          Currently enabled
        </small>
      </div>

      <div class="cw-stat">
        <span>Inactive Records</span>
        <strong>{{ records.length - activeCount }}</strong>
        <small>Currently disabled</small>
      </div>
    </div>

    <!-- =================================================
         DIRECTORY PANEL
    ================================================== -->

    <div class="cw-panel">
      <!-- PANEL HEADER -->

      <div class="cw-panel-head">
        <h2>{{ title }} Directory</h2>
        <p>
          <strong>Monthly:</strong> 100% Once a Month (SSS, Pag-IBIG &amp; PhilHealth)
          &nbsp;|&nbsp;
          <strong>Semi-Monthly (R Web Solutions):</strong> 1st Cutoff = <strong>SSS</strong> · 2nd Cutoff = <strong>Pag-IBIG &amp; PhilHealth</strong>
          &nbsp;|&nbsp;
          <strong>Weekly Every Saturday (Technicians):</strong> 2nd Saturday = <strong>SSS</strong> · 4th Saturday = <strong>Pag-IBIG &amp; PhilHealth</strong>
        </p>
      </div>

      <!-- SEARCH AND FILTER -->

      <div class="cw-toolbar">
        <div class="cw-search">
          <Search :size="17" />

          <input
            v-model="search"
            type="text"
            placeholder="Search records..."
            aria-label="Search contribution records"
          />
        </div>

        <div class="cw-filter">
          <Filter :size="15" />

          <select
            v-model="filterSalaryType"
            aria-label="Filter by salary type"
          >
            <option value="all">All Salary Types</option>
            <option value="Monthly">Monthly</option>
            <option value="Semi-Monthly">Semi-Monthly</option>
            <option value="Weekly">Weekly (Every Saturday)</option>
            <option value="Daily">Daily</option>
            <option value="Hourly">Hourly</option>
          </select>
        </div>

        <div class="cw-filter">
          <Filter :size="15" />

          <select
            v-model="filterStatus"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <!-- TABLE -->

      <div class="cw-overflow">
        <table class="cw-table">
          <thead>
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                scope="col"
              >
                {{ column.label }}
              </th>

              <th
                scope="col"
                class="cw-actions-heading"
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="row in visibleRows"
              :key="String(row.id)"
            >
              <td
                v-for="column in columns"
                :key="column.key"
              >
                <!-- STATUS BADGE -->
                <span
                  v-if="column.format === 'status'"
                  class="cw-pill"
                  :class="
                    row[column.key] === 'Active'
                      ? 'cw-active'
                      : 'cw-inactive'
                  "
                >
                  <span class="cw-status-dot"></span>
                  {{ row[column.key] }}
                </span>

                <!-- DEDUCTION TIMING BADGE -->
                <span
                  v-else-if="column.format === 'schedule'"
                  class="cw-pill"
                  :class="
                    row.deduction_schedule === 'first_deduction' || row.deduction_schedule === 'weekly_2nd_saturday' || row.deduction_schedule === 'weekly_1st_saturday'
                      ? 'cw-sched-first'
                      : row.deduction_schedule === 'second_deduction' || row.deduction_schedule === 'weekly_4th_saturday' || row.deduction_schedule === 'weekly_3rd_saturday'
                        ? 'cw-sched-second'
                        : 'cw-sched-split'
                  "
                >
                  {{ row[column.key] }}
                </span>

                <!-- NORMAL CELL -->
                <span
                  v-else
                  class="cw-cell-value"
                  :class="{
                    'cw-money': column.format === 'money',
                  }"
                >
                  {{ fmt(row[column.key], column.format) }}
                </span>
              </td>

              <!-- THREE DOTS ACTIONS -->
              <td class="cw-actions-cell">
                <button
                  type="button"
                  class="cw-more-btn"
                  aria-label="Actions menu"
                  :aria-expanded="openActionId === Number(row.id)"
                  @click.stop="toggleActions(Number(row.id), $event)"
                >
                  <MoreHorizontal :size="16" />
                </button>
              </td>
            </tr>

            <tr v-if="filtered.length === 0">
              <td
                :colspan="columns.length + 1"
                class="cw-empty"
              >
                No contribution settings found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- =================================================
         NUMBERED PAGINATION
    ================================================== -->

    <div class="cw-pagination">
      <div class="cw-pagination-info">
        Showing
        <strong>{{ paginationStart }}–{{ paginationEnd }}</strong>
        of
        <strong>{{ filtered.length }}</strong>
        contribution records
      </div>

      <div class="cw-pagination-controls">
        <button
          type="button"
          class="cw-page-arrow"
          aria-label="Previous page"
          :disabled="page === 1"
          @click="page--"
        >
          <ChevronLeft :size="16" />
        </button>

        <button
          v-for="pageNumber in pageNumbers"
          :key="pageNumber"
          type="button"
          class="cw-page-number"
          :class="{
            'cw-page-active': page === pageNumber,
          }"
          :aria-label="`Page ${pageNumber}`"
          :aria-current="
            page === pageNumber ? 'page' : undefined
          "
          @click="page = pageNumber"
        >
          {{ pageNumber }}
        </button>

        <button
          type="button"
          class="cw-page-arrow"
          aria-label="Next page"
          :disabled="page === totalPages"
          @click="page++"
        >
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>

    <!-- =================================================
         THREE DOTS DROPDOWN
    ================================================== -->

    <Teleport to="body">
      <div
        v-if="openActionId !== null"
        class="cw-action-dropdown"
        role="menu"
        :style="{
          top: `${actionPosition.top}px`,
          left: `${actionPosition.left}px`,
        }"
      >
        <button
          type="button"
          role="menuitem"
          @click="editSelectedRecord"
        >
          <Pencil :size="15" />
          <span>Edit Record</span>
        </button>

        <button
          type="button"
          role="menuitem"
          class="cw-action-delete"
          @click="confirmDelete"
        >
          <Trash2 :size="15" />
          <span>Delete Record</span>
        </button>
      </div>
    </Teleport>

    <!-- =================================================
         ADD / EDIT MODAL
    ================================================== -->

    <Teleport to="body">
      <div
        v-if="modalOpen"
        class="cw-backdrop"
        @click.self="closeForm"
      >
        <div
          class="cw-modal"
          role="dialog"
          aria-modal="true"
          :aria-label="
            editingId === null ? addLabel : 'Edit Record'
          "
        >
          <div class="cw-modal-head">
            <div>
              <h2>
                {{
                  editingId === null
                    ? addLabel
                    : 'Edit Record'
                }}
              </h2>

              <p>Configure cutoff deduction split percentages for this contribution.</p>
            </div>

            <button
              type="button"
              class="cw-x"
              aria-label="Close modal"
              @click="closeForm"
            >
              <X :size="20" />
            </button>
          </div>

          <form @submit.prevent="save">
            <div v-if="isModalMonthly" class="cw-cutoff-presets">
              <span class="cw-preset-label">Monthly Salary Policy:</span>
              <button type="button" class="cw-preset-btn" @click="applyCutoffPreset(100, 0, 'monthly_full')">
                Monthly Full Deduction (100% Once a Month · SSS, Pag-IBIG &amp; PhilHealth)
              </button>
            </div>
            <div v-else-if="isModalWeekly" class="cw-cutoff-presets">
              <span class="cw-preset-label">Weekly (Every Saturday) Presets:</span>
              <button type="button" class="cw-preset-btn" @click="applyWeeklyPreset(0, 100, 0, 0, 'weekly_2nd_saturday')">
                2nd Saturday (SSS · 100%)
              </button>
              <button type="button" class="cw-preset-btn" @click="applyWeeklyPreset(0, 0, 0, 100, 'weekly_4th_saturday')">
                4th Saturday (Pag-IBIG &amp; PhilHealth · 100%)
              </button>
              <button type="button" class="cw-preset-btn" @click="applyWeeklyPreset(25, 25, 25, 25, 'weekly_every_saturday_25')">
                Every Saturday (25% × 4 Wks)
              </button>
            </div>
            <div v-else class="cw-cutoff-presets">
              <span class="cw-preset-label">Semi-Monthly Presets:</span>
              <button type="button" class="cw-preset-btn" @click="applyCutoffPreset(100, 0, 'first_deduction')">
                1st Deduction (SSS · 100% / 0%)
              </button>
              <button type="button" class="cw-preset-btn" @click="applyCutoffPreset(0, 100, 'second_deduction')">
                2nd Deduction (Pag-IBIG &amp; PhilHealth · 0% / 100%)
              </button>
              <button type="button" class="cw-preset-btn" @click="applyCutoffPreset(50, 50, 'split_50_50')">
                50% / 50% Split
              </button>
            </div>

            <div class="cw-fields">
              <label
                v-for="field in fields"
                :key="field.key"
              >
                <span>
                  {{ field.label }}
                  <b v-if="field.required">*</b>
                </span>

                <select
                  v-if="field.type === 'select'"
                  v-model="form[field.key]"
                  :required="field.required"
                >
                  <option value="" disabled>
                    Select {{ field.label }}
                  </option>

                  <option
                    v-for="option in field.options"
                    :key="option"
                    :value="option"
                  >
                    {{ field.optionLabels?.[option] ?? option }}
                  </option>
                </select>

                <input
                  v-else
                  v-model="form[field.key]"
                  :type="field.type || 'text'"
                  :required="field.required"
                  :step="
                    field.type === 'number'
                      ? 'any'
                      : undefined
                  "
                  :min="field.type === 'number' ? '0' : undefined"
                  :max="field.type === 'number' ? '100' : undefined"
                  :placeholder="field.label"
                />
              </label>
            </div>

            <div class="cw-modal-footer">
              <button
                type="button"
                class="cw-btn cw-outline"
                @click="closeForm"
              >
                Cancel
              </button>

              <button
                type="submit"
                class="cw-btn cw-primary"
              >
                {{
                  editingId === null
                    ? 'Save Record'
                    : 'Save Changes'
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- =================================================
         DELETE CONFIRMATION
    ================================================== -->

    <Teleport to="body">
      <div
        v-if="deletingId !== null"
        class="cw-backdrop"
        @click.self="deletingId = null"
      >
        <div
          class="cw-confirm"
          role="dialog"
          aria-modal="true"
          aria-label="Delete confirmation"
        >
          <h2>Delete this record?</h2>

          <p>
            This will permanently delete the contribution deduction setting from the database.
          </p>

          <div class="cw-modal-footer">
            <button
              type="button"
              class="cw-btn cw-outline"
              @click="deletingId = null"
            >
              Cancel
            </button>

            <button
              type="button"
              class="cw-btn cw-delete"
              @click="remove"
            >
              Delete Record
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.cw-error-banner {
  padding: 12px;
  margin-bottom: 14px;
  border: 1px solid var(--red);
  border-radius: 8px;
  background: color-mix(in srgb, var(--red) 10%, var(--bg-card));
  color: var(--red);
  font-size: 11px;
}

/* =====================================================
   MAIN LAYOUT
===================================================== */

.cw {
  width: 100%;
  max-width: 1700px;
  margin: 0 auto;
  color: var(--text-primary, #172033);
}

.cw-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 18px;
  margin-bottom: 24px;
}

.cw-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 10px;
  color: var(--primary, #246bfd);
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 1px;
}

.cw h1 {
  margin: 0 0 6px;
  font-size: 27px;
  font-weight: 750;
  line-height: 1.25;
}

.cw h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.cw p {
  margin: 5px 0 0;
  font-size: 12px;
  color: var(--text-secondary, #667085);
}

/* =====================================================
   HEADER BUTTONS
===================================================== */

.cw-header-actions {
  display: flex;
  align-items: center;
  gap: 9px;
}

.cw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 14px;
  border: 1px solid transparent;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
  cursor: pointer;
}

.cw-primary {
  background: #246bfd;
  color: #ffffff;
}

.cw-primary:hover {
  background: #1657dd;
}

.cw-outline {
  border-color: var(--border, #e6eaf0);
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
}

.cw-outline:hover {
  background: var(--bg-card-soft, #f8fafc);
}

/* =====================================================
   SUMMARY CARDS
===================================================== */

.cw-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.cw-stat {
  padding: 19px 21px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 12px;
  background: var(--bg-card, #ffffff);
  box-shadow: var(--shadow, none);
}

.cw-stat > span {
  display: block;
  color: var(--text-secondary, #667085);
  font-size: 12px;
}

.cw-stat strong {
  display: block;
  margin: 8px 0 2px;
  font-size: 29px;
  line-height: 1.3;
}

.cw-stat small {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-muted, #98a2b3);
  font-size: 11px;
}

.cw-green {
  color: #16a663 !important;
}

/* =====================================================
   DIRECTORY PANEL
===================================================== */

.cw-panel {
  overflow: hidden;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 12px;
  background: var(--bg-card, #ffffff);
}

.cw-panel-head {
  padding: 19px 20px 14px;
  border-bottom: 1px solid var(--border, #e6eaf0);
}

.cw-panel-head h2 {
  font-size: 14px;
  font-weight: 700;
}

.cw-panel-head p {
  margin-top: 5px;
  font-size: 11px;
}

/* =====================================================
   SEARCH AND FILTER
===================================================== */

.cw-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px 18px;
}

.cw-search {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 1 340px;
  width: 340px;
  max-width: 100%;
  min-width: 0;
  height: 39px;
  padding: 0 12px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 8px;
  background: var(--bg-card-soft, #f8fafc);
  color: var(--text-secondary, #667085);
  transition: border-color 0.2s ease;
}

.cw-search:focus-within {
  border-color: #246bfd;
}

.cw-search input {
  width: 100%;
  min-width: 0;
  flex: 1;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary, #172033);
  font-size: 12px;
}

.cw-search input::placeholder {
  color: var(--text-muted, #98a2b3);
}

.cw-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 39px;
  padding: 0 12px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 8px;
  background: var(--bg-card-soft, #f8fafc);
  color: var(--text-secondary, #667085);
}

.cw-filter select {
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary, #172033);
  font-size: 12px;
  cursor: pointer;
  color-scheme: light dark;
}

.cw-filter select option {
  background-color: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
}

/* =====================================================
   TABLE
===================================================== */

.cw-overflow {
  width: 100%;
  overflow-x: auto;
}

.cw-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  white-space: nowrap;
  text-align: left;
  font-size: 12px;
}

.cw-table thead th {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border, #e6eaf0);
  background: var(--bg-card-soft, #f8fafc);
  color: var(--text-secondary, #667085);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.25px;
  text-transform: uppercase;
}

.cw-table tbody td {
  height: 68px;
  padding: 18px 16px;
  border-bottom: 1px solid var(--border, #e6eaf0);
  color: var(--text-primary, #172033);
  font-size: 12px;
  vertical-align: middle;
}

.cw-table tbody tr {
  transition: background-color 0.2s ease;
}

.cw-table tbody tr:hover td {
  background: var(--bg-card-soft, #f8fafc);
}

.cw-table tbody tr:last-child td {
  border-bottom: none;
}

.cw-cell-value {
  font-size: 12px;
  font-weight: 500;
}

.cw-money {
  font-weight: 700;
}

/* =====================================================
   STATUS BADGES
===================================================== */

.cw-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 6px 11px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
}

.cw-status-dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
  background: currentColor;
}

.cw-active {
  background: rgba(22, 163, 74, 0.14);
  color: #16a34a;
}

.cw-inactive {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

/* =====================================================
   THREE-DOTS BUTTON
===================================================== */

.cw-actions-heading,
.cw-actions-cell {
  width: 85px;
  text-align: center !important;
}

.cw-more-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 9px;
  background: transparent;
  color: var(--text-secondary, #667085);
  cursor: pointer;
  transition: all 0.2s ease;
}

.cw-more-btn:hover,
.cw-more-btn[aria-expanded='true'] {
  border-color: #246bfd;
  background: rgba(36, 107, 253, 0.08);
  color: #246bfd;
}

/* =====================================================
   EMPTY TABLE
===================================================== */

.cw-empty {
  padding: 45px 20px !important;
  color: var(--text-secondary, #667085);
  font-size: 12px;
  text-align: center;
}

/* =====================================================
   PAGINATION
===================================================== */

.cw-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 2px;
}

.cw-pagination-info {
  color: var(--text-secondary, #667085);
  font-size: 11px;
}

.cw-pagination-info strong {
  color: var(--text-primary, #172033);
  font-weight: 600;
}

.cw-pagination-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cw-page-arrow,
.cw-page-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 8px;
  background: var(--bg-card, #ffffff);
  color: var(--text-secondary, #667085);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cw-page-arrow:hover:not(:disabled),
.cw-page-number:hover:not(.cw-page-active) {
  border-color: #246bfd;
  color: #246bfd;
}

.cw-page-active {
  border-color: #246bfd;
  background: #246bfd;
  color: #ffffff;
  font-weight: 700;
}

.cw-page-arrow:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* =====================================================
   RESPONSIVE
===================================================== */

@media (max-width: 768px) {
  .cw h1 {
    font-size: 23px;
  }

  .cw-header-actions {
    width: 100%;
  }

  .cw-stats {
    grid-template-columns: 1fr;
  }

  .cw-toolbar {
    padding: 12px;
  }

  .cw-search {
    flex: 1 1 100%;
    width: 100%;
    max-width: none;
  }

  .cw-pagination {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .cw-pagination-controls {
    align-self: flex-end;
  }

  .cw-table thead th,
  .cw-table tbody td {
    padding-left: 12px;
    padding-right: 12px;
  }
}
</style>

<style>
/* =====================================================
   TELEPORTED THREE-DOTS MENU
===================================================== */

.cw-action-dropdown {
  position: fixed;
  z-index: 9999;
  min-width: 230px;
  padding: 7px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 12px;
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.2);
}

.cw-action-dropdown button {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  padding: 12px 13px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-primary, #172033);
  font-size: 12px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
}

.cw-action-dropdown button:hover {
  background: var(--bg-card-soft, #f8fafc);
}

.cw-action-dropdown .cw-action-delete {
  color: #ef4444;
}

.cw-action-dropdown .cw-action-delete:hover {
  background: rgba(239, 68, 68, 0.08);
}

/* =====================================================
   MODAL BACKDROP
===================================================== */

.cw-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(5, 15, 30, 0.55);
}

/* =====================================================
   MODAL CONTAINERS
===================================================== */

.cw-modal,
.cw-confirm {
  width: min(680px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 15px;
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
  box-shadow: 0 20px 70px rgba(0, 0, 0, 0.27);
}

.cw-confirm {
  max-width: 420px;
}

.cw-modal h2,
.cw-confirm h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
}

.cw-modal p,
.cw-confirm p {
  margin-top: 7px;
  color: var(--text-secondary, #667085);
  font-size: 12px;
}

.cw-modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 20px;
}

.cw-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 7px;
  background: var(--bg-card, #ffffff);
  color: var(--text-secondary, #667085);
  cursor: pointer;
}

/* =====================================================
   CUTOFF PRESETS & FORM FIELDS
===================================================== */

.cw-cutoff-presets {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: 16px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 9px;
  background: var(--bg-card-soft, #f8fafc);
}

.cw-preset-label {
  font-size: 11px;
  font-weight: 650;
  color: var(--text-secondary, #667085);
  margin-right: 4px;
}

.cw-preset-btn {
  padding: 6px 10px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 7px;
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
  font-size: 11px;
  font-weight: 650;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cw-preset-btn:hover {
  border-color: #246bfd;
  color: #246bfd;
}

.cw-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.cw-fields label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.cw-fields label > span {
  font-size: 11px;
  font-weight: 650;
}

.cw-fields label b {
  color: #ef4444;
}

.cw-fields input,
.cw-fields select {
  width: 100%;
  min-width: 0;
  padding: 11px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 8px;
  outline: none;
  background: var(--bg-card-soft, #f8fafc);
  color: var(--text-primary, #172033);
  font-size: 12px;
  color-scheme: light dark;
}

.cw-fields select option {
  background-color: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
}

.cw-fields input:focus,
.cw-fields select:focus {
  border-color: #246bfd;
}

/* =====================================================
   MODAL FOOTER
===================================================== */

.cw-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 24px;
}

.cw-modal-footer .cw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 14px;
  border: 1px solid transparent;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}

.cw-modal-footer .cw-primary {
  background: #246bfd;
  color: #ffffff;
}

.cw-modal-footer .cw-primary:hover {
  background: #1657dd;
}

.cw-modal-footer .cw-outline {
  border-color: var(--border, #e6eaf0);
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
}

.cw-modal-footer .cw-outline:hover {
  background: var(--bg-card-soft, #f8fafc);
}

.cw-modal-footer .cw-delete {
  background: #dc2626;
  color: #ffffff;
}

.cw-modal-footer .cw-delete:hover {
  background: #b91c1c;
}

.cw-sched-first {
  background: rgba(36, 107, 253, 0.14);
  color: #3b82f6;
}

.cw-sched-second {
  background: rgba(139, 92, 246, 0.14);
  color: #a78bfa;
}

.cw-sched-split {
  background: rgba(16, 185, 129, 0.14);
  color: #10b981;
}

@media (max-width: 720px) {
  .cw-fields {
    grid-template-columns: 1fr;
  }
}
</style>
