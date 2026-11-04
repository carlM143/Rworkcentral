
import { computed, onMounted, ref, watch } from 'vue'

import type {
  EmployeeSalaryRate,
  SalaryRateFilterOptions,
  SalaryRatesResponse,
  SalaryRateOptionsResponse,
} from '~/types/employeeSalaryRates/employeeSalaryRate'

export const useEmployeeSalaryRates = () => {
  const { $api } = useNuxtApp()

  const rates = ref<EmployeeSalaryRate[]>([])
  const loading = ref(false)
  const loadError = ref('')

  const options = ref<SalaryRateFilterOptions>({
    departments: [],
    salary_types: [],
  })

  const optionsError = ref('')

  // FILTERS
  const search = ref('')
  const department = ref('')
  const salaryType = ref('')
  const status = ref('')

  // PAGINATION
  const currentPage = ref(1)
  const perPage = 6

  const getErrorMessage = (error: unknown): string => {
    const problem = error as {
      data?: { message?: string }
      message?: string
    }

    return (
      problem.data?.message ||
      problem.message ||
      'Unable to load salary rates.'
    )
  }

  const getRates = async () => {
    loading.value = true
    loadError.value = ''

    try {
      const response = await $api<SalaryRatesResponse>(
        '/admin/employee-salary-rates',
        { method: 'GET' },
      )

      if (
        response.success === false ||
        !Array.isArray(response.data)
      ) {
        throw new Error(
          response.message || 'Invalid salary rate response.',
        )
      }

      rates.value = response.data
    } catch (error: unknown) {
      loadError.value = getErrorMessage(error)
      rates.value = []
    } finally {
      loading.value = false
    }
  }

  const getOptions = async () => {
    optionsError.value = ''

    try {
      const response = await $api<SalaryRateOptionsResponse>(
        '/admin/employee-salary-rates/filter-options',
        { method: 'GET' },
      )

      if (
        response.success === false ||
        !Array.isArray(response.data?.departments) ||
        !Array.isArray(response.data?.salary_types)
      ) {
        throw new Error(
          response.message || 'Invalid filter options response.',
        )
      }

      options.value = response.data
    } catch (error: unknown) {
      optionsError.value = getErrorMessage(error)
    }
  }

  const departments = computed(() =>
    options.value.departments.map(item => item.name),
  )

  const salaryTypes = computed(() =>
    options.value.salary_types.map(item => item.name),
  )

  const filteredRates = computed(() => {
    const keyword = search.value.trim().toLowerCase()

    const selectedDepartment = options.value.departments.find(
      item => item.name === department.value,
    )

    const selectedSalaryType = options.value.salary_types.find(
      item => item.name === salaryType.value,
    )

    return rates.value.filter(rate => {
      const matchesSearch =
        !keyword ||
        rate.employee_name.toLowerCase().includes(keyword) ||
        String(rate.emp_id ?? '').toLowerCase().includes(keyword) ||
        rate.salary_type_name.toLowerCase().includes(keyword)

      const matchesDepartment =
        !department.value ||
        (
          selectedDepartment !== undefined &&
          Number(rate.department_id) === selectedDepartment.id
        )

      const matchesSalaryType =
        !salaryType.value ||
        (
          selectedSalaryType !== undefined &&
          Number(rate.salary_type_id) === selectedSalaryType.id
        )

      const matchesStatus =
        !status.value ||
        (status.value === 'Active'
          ? rate.status === true
          : rate.status === false)

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesSalaryType &&
        matchesStatus
      )
    })
  })

  const stats = computed(() => ({
    total: rates.value.length,
    active: rates.value.filter(rate => rate.status).length,
    inactive: rates.value.filter(rate => !rate.status).length,
    salaryTypes: new Set(
      rates.value
        .map(rate => rate.salary_type_id)
        .filter(id => id !== null),
    ).size,
  }))

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredRates.value.length / perPage)),
  )

  const paginatedRates = computed(() => {
    const start = (currentPage.value - 1) * perPage

    return filteredRates.value.slice(start, start + perPage)
  })

  const showingFrom = computed(() =>
    filteredRates.value.length
      ? (currentPage.value - 1) * perPage + 1
      : 0,
  )

  const showingTo = computed(() =>
    Math.min(currentPage.value * perPage, filteredRates.value.length),
  )

  const resetFilters = () => {
    search.value = ''
    department.value = ''
    salaryType.value = ''
    status.value = ''
    currentPage.value = 1
  }

  watch(
    [search, department, salaryType, status],
    () => {
      currentPage.value = 1
    },
  )

  watch(totalPages, pages => {
    if (currentPage.value > pages) {
      currentPage.value = pages
    }
  })

  onMounted(() => {
    void getRates()
    void getOptions()
  })

  return {
    rates,
    loading,
    loadError,
    optionsError,

    search,
    department,
    salaryType,
    status,

    departments,
    salaryTypes,

    filteredRates,
    paginatedRates,
    stats,

    currentPage,
    totalPages,
    showingFrom,
    showingTo,

    getRates,
    getOptions,
    resetFilters,
  }
}
