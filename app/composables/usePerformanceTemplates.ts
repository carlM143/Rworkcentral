import type {
  PerformanceTemplate,
  TemplatePayload,
} from '~/types/performanceTemplate'

export const usePerformanceTemplates = () => {
  const templates = useState<PerformanceTemplate[]>(
    'document-evaluation-templates-v3',
    () => [
      {
        id: 1,
        company: 'RWorkCentral Inc.',
        department: 'All Departments',
        position: 'All Positions',
        documentName: 'Employee Evaluation Form.pdf',
        documentType: 'application/pdf',
        documentSize: 0,
        createdAt: '2026-09-28',
        updatedAt: '2026-09-28',
      },
      {
        id: 2,
        company: 'RWorkCentral Inc.',
        department: 'Human Resources',
        position: 'HR Administrator',
        documentName: 'HR Evaluation.pdf',
        documentType: 'application/pdf',
        documentSize: 0,
        createdAt: '2026-09-29',
        updatedAt: '2026-09-29',
      },
      {
        id: 3,
        company: 'RWorkCentral Inc.',
        department: 'Operations',
        position: 'Driver',
        documentName: 'Driver Evaluation.pdf',
        documentType: 'application/pdf',
        documentSize: 0,
        createdAt: '2026-09-30',
        updatedAt: '2026-09-30',
      },
    ],
  )

  const search = ref('')
  const department = ref('')
  const currentPage = ref(1)
  const perPage = 6

  const departmentOptions = computed(() => {
    return [...new Set(templates.value.map(item => item.department))].sort()
  })

  const filteredTemplates = computed(() => {
    const keyword = search.value.trim().toLowerCase()

    return templates.value.filter(item => {
      const fields = [
        item.company,
        item.department,
        item.position,
        item.documentName,
      ]

      const matchesSearch =
        !keyword || fields.some(field => field.toLowerCase().includes(keyword))
      const matchesDepartment =
        !department.value || item.department === department.value

      return matchesSearch && matchesDepartment
    })
  })

  const totalPages = computed(() => {
    return Math.max(1, Math.ceil(filteredTemplates.value.length / perPage))
  })

  const paginatedTemplates = computed(() => {
    const start = (currentPage.value - 1) * perPage
    return filteredTemplates.value.slice(start, start + perPage)
  })

  const showingFrom = computed(() => {
    return filteredTemplates.value.length
      ? (currentPage.value - 1) * perPage + 1
      : 0
  })

  const showingTo = computed(() => {
    return Math.min(currentPage.value * perPage, filteredTemplates.value.length)
  })

  const resetFilters = () => {
    search.value = ''
    department.value = ''
    currentPage.value = 1
  }

  const createTemplate = (payload: TemplatePayload) => {
    const id = Math.max(0, ...templates.value.map(item => item.id)) + 1
    const now = new Date().toISOString()

    templates.value.unshift({
      ...payload,
      id,
      createdAt: now,
      updatedAt: now,
    })

    currentPage.value = 1
  }

  const updateTemplate = (id: number, payload: TemplatePayload) => {
    const index = templates.value.findIndex(item => item.id === id)
    if (index < 0) return false

    templates.value[index] = {
      ...templates.value[index]!,
      ...payload,
      updatedAt: new Date().toISOString(),
    }

    return true
  }

  const deleteTemplate = (id: number) => {
    const index = templates.value.findIndex(item => item.id === id)
    if (index < 0) return false

    templates.value.splice(index, 1)
    return true
  }

  watch([search, department], () => {
    currentPage.value = 1
  })

  watch(totalPages, value => {
    if (currentPage.value > value) currentPage.value = value
  })

  return {
    templates,
    search,
    department,
    currentPage,
    departmentOptions,
    filteredTemplates,
    paginatedTemplates,
    totalPages,
    showingFrom,
    showingTo,
    resetFilters,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  }
}
