<script setup lang="ts">
import {
  ArrowLeft,
  Pencil,
  MoreHorizontal,
  UserRound,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Mail,
  Phone,
  IdCard,
  BadgeCheck,
  WalletCards,
  Files,
  Activity,
  Clock3,
  MapPin,
  UserCheck,
  History,
  CalendarCheck2,

  // PAYROLL
  Banknote,
  Landmark,
  ShieldCheck,
  ReceiptText,
  CreditCard,

  // DOCUMENTS
  FileText,
  Upload,
  Download, 
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,

  // ACTIVITY
  UserPlus,
  FileUp,
  ListFilter,
  CalendarClock,
} from 'lucide-vue-next'

import type { Employee, EmployeeDocument, DocumentStatus } from '~/types/employee'

/**
 * GET /api/admin/employees/{id}
 * Matches EmployeeController::show() and DETAIL_RELATIONSHIPS.
 * These are API wire types, separate from the simplified Employee UI model.
 */
interface ApiEmployeeDocument {
  id: number
  file_name?: string | null
  filename?: string | null
  name?: string | null
  file_path?: string | null
  status?: string | null
  submitted?: boolean | number | null
  uploaded_at?: string | null
  created_at?: string | null
  expires_at?: string | null
  employment_document?: {
    name?: string | null
    document_name?: string | null
    type?: string | null
  } | null
}

interface ApiEmployment {
  id: number
  date_hired?: string | null
  employment_type?: {
    name?: string | null
    type_name?: string | null
    employment_type?: string | null
  } | null
  department?: { department_name?: string | null } | null
  position?: { position?: string | null } | null
  work_schedule?: {
    schedule_name?: string | null
    schedule_code?: string | null
    days?: Array<{
      day_of_week: string
      is_working_day?: boolean | number | null
      time_in?: string | null
      time_out?: string | null
    }>
  } | null
}

interface ApiEmployeeDetail {
  id: number
  emp_id: string | number
  firstname: string
  middlename?: string | null
  lastname: string
  birthday?: string | null
  gender?: string | null
  civil_status?: string | null
  profile_photo?: string | null
  status: boolean | number | string
  updated_at?: string | null
  department?: { department_name?: string | null } | null
  contact_information?: {
    email?: string | null
    mobile?: string | null
    residential_address?: string | null
  } | null
  employments?: ApiEmployment[] | null
  government_requirements?: Array<{
    id_name?: string | null
    id_number?: string | null
  }> | null
  salary_setup?: {
    basic_salary?: string | number | null
    daily_rate?: string | number | null
    hourly_rate?: string | number | null
    allowance?: string | number | null
    bank_name?: string | null
    account_name?: string | null
    account_number?: string | null
    salary_type?: {
      name?: string | null
      type_name?: string | null
      salary_type?: string | null
    } | null
  } | null
  payrolls?: Array<{
    id: number
    payroll_group?: {
      name?: string | null
      group_name?: string | null
    } | null
  }> | null
  contact_persons?: Array<{
    name?: string | null
    relationship?: string | null
    contact_number?: string | null
    address?: string | null
  }> | null
  documents?: ApiEmployeeDocument[] | null
}

interface EmployeeDetailResponse {
  success: boolean
  message?: string
  data: ApiEmployeeDetail
}

const dateOnly = (date?: string | null): string => date?.slice(0, 10) ?? ''

const numericOrUndefined = (value?: string | number | null): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : undefined
}

const validDocumentStatus = (status?: string | null): DocumentStatus => {
  switch (status?.trim().toLowerCase().replace(/[\s-]+/g, '_')) {
    case 'verified': return 'Verified'
    case 'expired': return 'Expired'
    case 'expiring_soon': return 'Expiring Soon'
    default: return 'Pending'
  }
}

const mapDocument = (record: ApiEmployeeDocument): EmployeeDocument => ({
  id: record.id,
  type: record.employment_document?.document_name
    ?? record.employment_document?.name
    ?? record.employment_document?.type
    ?? 'Employment Document',
  name: record.file_name
    ?? record.filename
    ?? record.name
    ?? record.file_path?.split('/').pop()
    ?? 'File not provided',
  status: validDocumentStatus(record.status),
  uploadedAt: dateOnly(record.uploaded_at ?? record.created_at) || undefined,
  expiresAt: dateOnly(record.expires_at) || undefined,
})

const mapEmployeeDetail = (record: ApiEmployeeDetail): Employee => {
  // Same employment selection convention used by LeaveCreditService:
  // latest date_hired, breaking ties by the latest employment ID.
  const employment = [...(record.employments ?? [])].sort((a, b) => {
    const dateOrder = dateOnly(b.date_hired).localeCompare(dateOnly(a.date_hired))
    return dateOrder || b.id - a.id
  })[0]

  const isActive = [true, 1, '1', 'true'].includes(record.status)
  const schedule = employment?.work_schedule
  const days = schedule?.days
  const week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Sat', 'Sun']
  const normalizedWeekday = (value: string): string => {
    const day = value.trim().toLowerCase()
    return day === 'saturday' ? 'sat' : day === 'sunday' ? 'sun' : day
  }
  const workingDays = new Set(
    (days ?? [])
      .filter(day => day.is_working_day !== false && day.is_working_day !== 0)
      .map(day => normalizedWeekday(day.day_of_week)),
  )
  const restDays = Array.isArray(days)
    ? week.filter(day => !workingDays.has(normalizedWeekday(day)))
    : []

  const governmentNumber = (...keywords: string[]): string | undefined =>
    (record.government_requirements ?? []).find(requirement => {
      const name = requirement.id_name?.toLowerCase() ?? ''
      return keywords.some(keyword => name.includes(keyword))
    })?.id_number ?? undefined

  const salary = record.salary_setup
  const salaryType = salary?.salary_type?.type_name
    ?? salary?.salary_type?.name
    ?? salary?.salary_type?.salary_type
  const emergencyContact = record.contact_persons?.[0]
  const payroll = [...(record.payrolls ?? [])].sort((a, b) => b.id - a.id)[0]

  return {
    id: record.id,
    employeeNumber: String(record.emp_id),
    firstName: record.firstname,
    middleName: record.middlename || undefined,
    lastName: record.lastname,
    email: record.contact_information?.email || 'Not provided',
    phone: record.contact_information?.mobile || undefined,
    avatar: record.profile_photo || undefined,
    birthDate: dateOnly(record.birthday) || undefined,
    gender: record.gender || undefined,
    civilStatus: record.civil_status || undefined,
    address: record.contact_information?.residential_address || undefined,
    department: employment?.department?.department_name
      ?? record.department?.department_name
      ?? 'Not assigned',
    position: employment?.position?.position ?? 'Not assigned',
    employmentType: (employment?.employment_type?.type_name
      ?? employment?.employment_type?.name
      ?? employment?.employment_type?.employment_type
      ?? 'Not assigned') as Employee['employmentType'],
    status: isActive ? 'Active' : 'Inactive',
    dateHired: dateOnly(employment?.date_hired),
    workSchedule: schedule
      ? [schedule.schedule_name, schedule.schedule_code ? `(${schedule.schedule_code})` : '']
          .filter(Boolean).join(' ') || undefined
      : undefined,
    // Missing WorkScheduleDay rows mean rest days. No legacy restday table.
    restDay: Array.isArray(days) ? restDays.join(', ') || 'None' : undefined,
    inactiveDate: !isActive ? dateOnly(record.updated_at) || undefined : undefined,
    salaryType: salaryType as Employee['salaryType'] | undefined,
    basicSalary: numericOrUndefined(salary?.basic_salary),
    dailyRate: numericOrUndefined(salary?.daily_rate),
    hourlyRate: numericOrUndefined(salary?.hourly_rate),
    allowance: numericOrUndefined(salary?.allowance),
    bankName: salary?.bank_name || undefined,
    accountName: salary?.account_name || undefined,
    accountNumber: salary?.account_number || undefined,
    payrollGroup: payroll?.payroll_group?.group_name
      ?? payroll?.payroll_group?.name
      ?? undefined,
    sssNumber: governmentNumber('sss', 'social security'),
    philHealthNumber: governmentNumber('philhealth'),
    pagIbigNumber: governmentNumber('pag-ibig', 'hdmf'),
    tinNumber: governmentNumber('tin', 'tax identification'),
    emergencyContactName: emergencyContact?.name || undefined,
    emergencyRelationship: emergencyContact?.relationship || undefined,
    emergencyMobileNumber: emergencyContact?.contact_number || undefined,
    emergencyAddress: emergencyContact?.address || undefined,
    documents: (record.documents ?? []).map(mapDocument),
  }
}

type ProfileTab =
  | 'overview'
  | 'employment'
  | 'payroll'
  | 'documents'
  | 'activity'

const route = useRoute()
const router = useRouter()

const { $api } = useNuxtApp()
const { info } = useToast()

/* =========================================================
   EMPLOYEE — LOAD FROM LARAVEL, NEVER FROM MOCK RECORDS
========================================================= */

const employee = ref<Employee | null>(null)
const profileLoading = ref(true)
const profileError = ref('')
let latestRequest = 0

const loadEmployeeProfile = async () => {
  const requestNumber = ++latestRequest
  const id = Number(route.params.id)
  employee.value = null
  profileError.value = ''

  if (!Number.isInteger(id) || id <= 0) {
    profileLoading.value = false
    profileError.value = 'Invalid employee ID.'
    return
  }

  profileLoading.value = true
  try {
    const response = await $api<EmployeeDetailResponse>(`/admin/employees/${id}`, {
      method: 'GET',
    })
    if (response.success === false || !response.data || response.data.id !== id) {
      throw new Error(response.message || 'Employee could not be loaded.')
    }
    if (requestNumber === latestRequest) employee.value = mapEmployeeDetail(response.data)
  } catch (problem: unknown) {
    if (requestNumber === latestRequest) {
      const error = problem as {
        data?: { message?: string }
        response?: { _data?: { message?: string } }
        message?: string
      }
      profileError.value = error.data?.message
        ?? error.response?._data?.message
        ?? error.message
        ?? 'Could not load this employee from Laravel.'
    }
  } finally {
    if (requestNumber === latestRequest) profileLoading.value = false
  }
}

watch(() => route.params.id, () => { void loadEmployeeProfile() }, { immediate: true })

const fullName = computed(() => {
  if (!employee.value) {
    return ''
  }

  return [
    employee.value.firstName,
    employee.value.middleName,
    employee.value.lastName,
  ]
    .filter(Boolean)
    .join(' ')
})

const initials = computed(() => {
  if (!employee.value) {
    return 'NA'
  }

  const first =
    employee.value.firstName?.charAt(0) ?? ''

  const last =
    employee.value.lastName?.charAt(0) ?? ''

  return `${first}${last}`.toUpperCase()
})

/* =========================================================
   TABS
========================================================= */

const activeTab =
  ref<ProfileTab>('overview')

const tabs: {
  key: ProfileTab
  label: string
  icon: any
}[] = [
  {
    key: 'overview',
    label: 'Overview',
    icon: UserRound,
  },
  {
    key: 'employment',
    label: 'Employment',
    icon: BriefcaseBusiness,
  },
  {
    key: 'payroll',
    label: 'Payroll',
    icon: WalletCards,
  },
  {
    key: 'documents',
    label: 'Documents',
    icon: Files,
  },
  {
    key: 'activity',
    label: 'Activity',
    icon: Activity,
  },
]

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (
  date?: string,
) => {
  if (!date) {
    return 'Not provided'
  }

  const parsedDate =
    new Date(`${date}T00:00:00`)

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return date
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    },
  ).format(parsedDate)
}

const valueOrFallback = (
  value?: string,
) => {
  return value?.trim()
    ? value
    : 'Not provided'
}

/* =========================================================
   PAYROLL HELPERS
========================================================= */

const formatCurrency = (
  value?: number,
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return 'Not provided'
  }

  return new Intl.NumberFormat(
    'en-PH',
    {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    },
  ).format(value)
}

const primaryRate = computed(() => {
  if (!employee.value) {
    return 'Not provided'
  }

  if (
    employee.value.salaryType === 'Monthly'
  ) {
    return formatCurrency(
      employee.value.basicSalary,
    )
  }

  if (
    employee.value.salaryType === 'Semi-Monthly'
  ) {
    const value = formatCurrency(
      employee.value.basicSalary,
    )

    return value === 'Not provided'
      ? value
      : `${value} / semi-month`
  }

  if (
    employee.value.salaryType === 'Daily'
  ) {
    const value = formatCurrency(
      employee.value.dailyRate,
    )

    return value === 'Not provided'
      ? value
      : `${value} / day`
  }

  if (
    employee.value.salaryType === 'Hourly'
  ) {
    const value = formatCurrency(
      employee.value.hourlyRate,
    )

    return value === 'Not provided'
      ? value
      : `${value} / hour`
  }

  return 'Not provided'
})

const maskedAccountNumber = computed(() => {
  const account =
    employee.value?.accountNumber

  if (!account) {
    return 'Not provided'
  }

  if (account.length <= 4) {
    return account
  }

  return `••••••${account.slice(-4)}`
})

const paymentMethod = computed(() => {
  return employee.value?.bankName
    ? 'Bank Transfer'
    : 'Not provided'
})

 /* =========================================================
   DOCUMENT HELPERS
========================================================= */

const documents = computed(() => {
  return employee.value?.documents ?? []
})

const documentSummary = computed(() => {
  return {
    total: documents.value.length,

    verified: documents.value.filter(
      document =>
        document.status === 'Verified',
    ).length,

    expiring: documents.value.filter(
      document =>
        document.status === 'Expiring Soon',
    ).length,

    pending: documents.value.filter(
      document =>
        document.status === 'Pending',
    ).length,
  }
})

const requiredDocumentTypes = [
  'Government ID',
  'Employment Contract',
  'NBI Clearance',
  'Medical Certificate',
]

const hasDocument = (
  type: string,
) => {
  return documents.value.some(
    document =>
      document.type === type,
  )
}

const documentStatusClass = (
  status?: string,
) => {
  if (status === 'Verified') {
    return 'verified'
  }

  if (status === 'Expiring Soon') {
    return 'expiring'
  }

  if (status === 'Expired') {
    return 'expired'
  }

  return 'pending'
}

const handleAddDocument = () => {
  info(
    'Add Document',
    'Document upload UI will be connected later.',
  )
}

const handleViewDocument = (
  documentName: string,
) => {
  info(
    'View Document',
    `Opening ${documentName} will be available once file storage is connected.`,
  )
}

const handleDownloadDocument = (
  documentName: string,
) => {
  info(
    'Download Document',
    `Downloading ${documentName} will be available once file storage is connected.`,
  )
}

/* =========================================================
   ACTIVITY HELPERS
========================================================= */

type ActivityCategory =
  | 'Employment'
  | 'Document'

interface EmployeeActivityItem {
  id: string
  category: ActivityCategory
  title: string
  description: string
  date: string
  icon: any
}

const activityFilter =
  ref<'All' | ActivityCategory>('All')

const activityFilters = [
  'All',
  'Employment',
  'Document',
] as const

const employeeActivities = computed<
  EmployeeActivityItem[]
>(() => {
  if (!employee.value) {
    return []
  }

  const items: EmployeeActivityItem[] = []

  /* Employee hired */
  items.push({
    id: `hire-${employee.value.id}`,
    category: 'Employment',
    title: 'Employee Hired',
    description:
      `${fullName.value} was added as ${employee.value.position} under ${employee.value.department}.`,
    date: employee.value.dateHired,
    icon: UserPlus,
  })

  /* Uploaded documents */
  employee.value.documents?.forEach(
    document => {
      if (!document.uploadedAt) {
        return
      }

      items.push({
        id: `document-${document.id}`,
        category: 'Document',
        title: 'Document Uploaded',
        description:
          `${document.type} (${document.name}) was added to the employee record.`,
        date: document.uploadedAt,
        icon: FileUp,
      })
    },
  )

  return items.sort(
    (a, b) =>
      new Date(
        `${b.date}T00:00:00`,
      ).getTime() -
      new Date(
        `${a.date}T00:00:00`,
      ).getTime(),
  )
})

const filteredActivities = computed(() => {
  if (activityFilter.value === 'All') {
    return employeeActivities.value
  }

  return employeeActivities.value.filter(
    item =>
      item.category ===
      activityFilter.value,
  )
})

const activitySummary = computed(() => {
  return {
    total: employeeActivities.value.length,

    employment:
      employeeActivities.value.filter(
        item =>
          item.category === 'Employment',
      ).length,

    documents:
      employeeActivities.value.filter(
        item =>
          item.category === 'Document',
      ).length,
  }
})

const activityIconClass = (
  category: ActivityCategory,
) => {
  if (category === 'Employment') {
    return 'green'
  }

  return 'blue'
}

/* =========================================================
   ACTIONS
========================================================= */

const goBack = () => {
  router.push('/admin/employees')
}

const handleEdit = () => {
  router.push({ path: '/admin/employees/edit', query: { id: String(route.params.id) } })
}

const handleMoreActions = () => {
  info(
    'Employee Actions',
    'Additional employee actions will be added later.',
  )
}

const handleCompensationHistory = () => {
  router.push(
    `/admin/employees/${route.params.id}/compensation-history`,
  )
}
</script>

<template>
  <section class="employee-profile-page">

    <div v-if="profileLoading" class="profile-loading" role="status" aria-live="polite">
      Loading employee profile from Laravel...
    </div>

    <div v-else-if="profileError" class="profile-loading profile-error" role="alert">
      <strong>Unable to load employee profile</strong>
      <p>{{ profileError }}</p>
      <AppButton variant="secondary" @click="loadEmployeeProfile">Retry</AppButton>
    </div>

    <!-- =====================================================
         EMPLOYEE FOUND
    ====================================================== -->
    <template v-else-if="employee">

      <!-- BACK -->
      <button
        type="button"
        class="back-link"
        @click="goBack"
      >
        <ArrowLeft :size="15" />

        Back to Employees
      </button>

      <!-- ===================================================
           PROFILE HEADER
      ==================================================== -->
      <div class="profile-header">

        <div class="profile-identity">

          <div class="profile-avatar">
            {{ initials }}
          </div>

          <div class="profile-name">
            <div class="name-row">
              <h1>
                {{ fullName }}
              </h1>

              <StatusBadge
                :status="employee.status"
              />
            </div>

            <div class="profile-meta">
              <span>
                {{ employee.employeeNumber }}
              </span>

              <span class="meta-dot" />

              <span>
                {{ employee.position }}
              </span>

              <span class="meta-dot" />

              <span>
                {{ employee.department }}
              </span>
            </div>
          </div>

        </div>

        <div class="profile-actions">
          <AppButton
            variant="secondary"
            :icon="Pencil"
            @click="handleEdit"
          >
            Edit Employee
          </AppButton>

          <button
            type="button"
            class="more-button"
            title="More actions"
            @click="handleMoreActions"
          >
            <MoreHorizontal :size="19" />
          </button>
        </div>

      </div>

      <!-- ===================================================
           QUICK SUMMARY
      ==================================================== -->
      <div class="quick-grid">

        <div class="quick-card">
          <div class="quick-icon blue">
            <BriefcaseBusiness
              :size="18"
            />
          </div>

          <div>
            <span>
              Employment
            </span>

            <strong>
              {{ employee.employmentType }}
            </strong>
          </div>
        </div>

        <div class="quick-card">
          <div class="quick-icon green">
            <Building2 :size="18" />
          </div>

          <div>
            <span>
              Department
            </span>

            <strong>
              {{ employee.department }}
            </strong>
          </div>
        </div>

        <div class="quick-card">
          <div class="quick-icon orange">
            <CalendarDays :size="18" />
          </div>

          <div>
            <span>
              Date Hired
            </span>

            <strong>
              {{
                formatDate(
                  employee.dateHired,
                )
              }}
            </strong>
          </div>
        </div>

        <div class="quick-card">
          <div class="quick-icon purple">
            <Phone :size="18" />
          </div>

          <div>
            <span>
              Contact
            </span>

            <strong>
              {{
                valueOrFallback(
                  employee.phone,
                )
              }}
            </strong>
          </div>
        </div>

      </div>

      <!-- ===================================================
           TABS
      ==================================================== -->
      <div class="tabs-card">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="tab-button"
          :class="{
            active:
              activeTab === tab.key,
          }"
          @click="activeTab = tab.key"
        >
          <component
            :is="tab.icon"
            :size="15"
          />

          {{ tab.label }}
        </button>
      </div>

      <!-- ===================================================
           OVERVIEW
      ==================================================== -->
      <div
        v-if="activeTab === 'overview'"
        class="overview-layout"
      >

        <!-- ===============================================
             LEFT COLUMN
        ================================================ -->
        <div class="main-column">

          <!-- PERSONAL INFORMATION -->
          <article class="profile-card">
            <div class="card-header">
              <div class="card-title">
                <div class="card-icon blue">
                  <UserRound :size="17" />
                </div>

                <div>
                  <h3>
                    Personal Information
                  </h3>

                  <p>
                    Basic employee identity and contact details.
                  </p>
                </div>
              </div>

              <button
                type="button"
                class="edit-section"
                @click="handleEdit"
              >
                <Pencil :size="12" />

                Edit
              </button>
            </div>

            <div class="details-grid">

              <div class="detail-item">
                <span>
                  Full Name
                </span>

                <strong>
                  {{ fullName }}
                </strong>
              </div>

              <div class="detail-item">
                <span>
                  Employee ID
                </span>

                <strong>
                  {{ employee.employeeNumber }}
                </strong>
              </div>

              <div class="detail-item">
                <span>
                  Email Address
                </span>

                <strong class="detail-with-icon">
                  <Mail :size="13" />

                  {{
                    valueOrFallback(
                      employee.email,
                    )
                  }}
                </strong>
              </div>

              <div class="detail-item">
                <span>
                  Mobile Number
                </span>

                <strong class="detail-with-icon">
                  <Phone :size="13" />

                  {{
                    valueOrFallback(
                      employee.phone,
                    )
                  }}
                </strong>
              </div>

            </div>
          </article>

          <!-- EMPLOYMENT -->
          <article class="profile-card">
            <div class="card-header">
              <div class="card-title">
                <div class="card-icon green">
                  <BriefcaseBusiness
                    :size="17"
                  />
                </div>

                <div>
                  <h3>
                    Employment Information
                  </h3>

                  <p>
                    Employee assignment and employment status.
                  </p>
                </div>
              </div>

              <button
                type="button"
                class="view-section"
                @click="
                  activeTab = 'employment'
                "
              >
                View Details
              </button>
            </div>

            <div class="details-grid">

              <div class="detail-item">
                <span>
                  Department
                </span>

                <strong>
                  {{ employee.department }}
                </strong>
              </div>

              <div class="detail-item">
                <span>
                  Position / Designation
                </span>

                <strong>
                  {{ employee.position }}
                </strong>
              </div>

              <div class="detail-item">
                <span>
                  Employment Type
                </span>

                <strong>
                  {{ employee.employmentType }}
                </strong>
              </div>

              <div class="detail-item">
                <span>
                  Employment Status
                </span>

                <strong>
                  {{ employee.status }}
                </strong>
              </div>

              <div class="detail-item">
                <span>
                  Date Hired
                </span>

                <strong>
                  {{
                    formatDate(
                      employee.dateHired,
                    )
                  }}
                </strong>
              </div>

              <div class="detail-item">
                <span>
                  Employee Number
                </span>

                <strong>
                  {{ employee.employeeNumber }}
                </strong>
              </div>

            </div>
          </article>

        </div>

        <!-- ===============================================
             RIGHT COLUMN
        ================================================ -->
        <div class="side-column">

          <!-- EMPLOYEE STATUS -->
          <article class="profile-card">
            <div class="card-header compact">
              <div class="card-title">
                <div class="card-icon green">
                  <BadgeCheck :size="17" />
                </div>

                <div>
                  <h3>
                    Employee Status
                  </h3>

                  <p>
                    Current HR record status.
                  </p>
                </div>
              </div>
            </div>

            <div class="status-panel">
              <div class="status-row">
                <span>
                  Status
                </span>

                <StatusBadge
                  :status="employee.status"
                />
              </div>

              <div class="status-row">
                <span>
                  Employment
                </span>

                <strong>
                  {{ employee.employmentType }}
                </strong>
              </div>

              <div class="status-row">
                <span>
                  Date Hired
                </span>

                <strong>
                  {{
                    formatDate(
                      employee.dateHired,
                    )
                  }}
                </strong>
              </div>
            </div>
          </article>

          <!-- ORGANIZATION -->
          <article class="profile-card">
            <div class="card-header compact">
              <div class="card-title">
                <div class="card-icon blue">
                  <Building2 :size="17" />
                </div>

                <div>
                  <h3>
                    Organization
                  </h3>

                  <p>
                    Current work assignment.
                  </p>
                </div>
              </div>
            </div>

            <div class="status-panel">
              <div class="status-row">
                <span>
                  Department
                </span>

                <strong>
                  {{ employee.department }}
                </strong>
              </div>

              <div class="status-row">
                <span>
                  Position
                </span>

                <strong>
                  {{ employee.position }}
                </strong>
              </div>
            </div>
          </article>

          <!-- CONTACT -->
          <article class="profile-card">
            <div class="card-header compact">
              <div class="card-title">
                <div class="card-icon purple">
                  <IdCard :size="17" />
                </div>

                <div>
                  <h3>
                    Contact Information
                  </h3>

                  <p>
                    Employee contact details.
                  </p>
                </div>
              </div>
            </div>

            <div class="contact-list">

              <div class="contact-item">
                <div class="contact-icon">
                  <Mail :size="14" />
                </div>

                <div>
                  <span>Email</span>

                  <strong>
                    {{
                      valueOrFallback(
                        employee.email,
                      )
                    }}
                  </strong>
                </div>
              </div>

              <div class="contact-item">
                <div class="contact-icon">
                  <Phone :size="14" />
                </div>

                <div>
                  <span>Mobile</span>

                  <strong>
                    {{
                      valueOrFallback(
                        employee.phone,
                      )
                    }}
                  </strong>
                </div>
              </div>

            </div>
          </article>

        </div>
      </div>

     
      <!-- ===================================================
     EMPLOYMENT TAB
==================================================== -->
<div
  v-else-if="activeTab === 'employment'"
  class="employment-tab"
>

  <!-- ===============================================
       LEFT / MAIN
  ================================================ -->
  <div class="employment-main">

    <!-- CURRENT EMPLOYMENT -->
    <article class="profile-card">
      <div class="card-header">
        <div class="card-title">
          <div class="card-icon green">
            <BriefcaseBusiness :size="17" />
          </div>

          <div>
            <h3>
              Current Employment
            </h3>

            <p>
              Employee's current employment status and assignment.
            </p>
          </div>
        </div>

        <button
          type="button"
          class="edit-section"
          @click="handleEdit"
        >
          <Pencil :size="12" />

          Edit
        </button>
      </div>

      <div class="employment-details-grid">

        <div class="employment-detail">
          <div class="employment-detail-icon blue">
            <IdCard :size="15" />
          </div>

          <div>
            <span>
              Employee ID
            </span>

            <strong>
              {{ employee.employeeNumber }}
            </strong>
          </div>
        </div>

        <div class="employment-detail">
          <div class="employment-detail-icon orange">
            <CalendarDays :size="15" />
          </div>

          <div>
            <span>
              Date Hired
            </span>

            <strong>
              {{
                formatDate(
                  employee.dateHired,
                )
              }}
            </strong>
          </div>
        </div>

        <div class="employment-detail">
          <div class="employment-detail-icon purple">
            <UserCheck :size="15" />
          </div>

          <div>
            <span>
              Employment Type
            </span>

            <strong>
              {{ employee.employmentType }}
            </strong>
          </div>
        </div>

        <div class="employment-detail">
          <div class="employment-detail-icon green">
            <BadgeCheck :size="15" />
          </div>

          <div>
            <span>
              Employment Status
            </span>

            <strong>
              {{ employee.status }}
            </strong>
          </div>
        </div>

      </div>
    </article>

    <!-- ===============================================
         ORGANIZATION ASSIGNMENT
    ================================================ -->
    <article class="profile-card">
      <div class="card-header">
        <div class="card-title">
          <div class="card-icon blue">
            <Building2 :size="17" />
          </div>

          <div>
            <h3>
              Organization Assignment
            </h3>

            <p>
              Department, position and reporting structure.
            </p>
          </div>
        </div>
      </div>

      <div class="assignment-grid">

        <div class="assignment-item">
          <span>
            Department
          </span>

          <strong>
            {{ employee.department }}
          </strong>
        </div>

        <div class="assignment-item">
          <span>
            Position / Designation
          </span>

          <strong>
            {{ employee.position }}
          </strong>
        </div>

        <div class="assignment-item">
          <span>
            Immediate Supervisor
          </span>

          <strong>
            {{
              valueOrFallback(
                employee.supervisor,
              )
            }}
          </strong>
        </div>

        <div class="assignment-item">
          <span>
            Branch / Work Location
          </span>

          <strong>
            {{
              valueOrFallback(
                employee.branch,
              )
            }}
          </strong>
        </div>

      </div>
    </article>

    <!-- ===============================================
         WORK SCHEDULE
    ================================================ -->
    <article class="profile-card">
      <div class="card-header">
        <div class="card-title">
          <div class="card-icon orange">
            <Clock3 :size="17" />
          </div>

          <div>
            <h3>
              Work Schedule
            </h3>

            <p>
              Employee's assigned work schedule and rest day.
            </p>
          </div>
        </div>
      </div>

      <div class="schedule-grid">

        <div class="schedule-card">
          <div class="schedule-icon">
            <Clock3 :size="18" />
          </div>

          <div>
            <span>
              Default Work Schedule
            </span>

            <strong>
              {{
                valueOrFallback(
                  employee.workSchedule,
                )
              }}
            </strong>

            <small>
              Regular assigned work schedule
            </small>
          </div>
        </div>

        <div class="schedule-card">
          <div class="schedule-icon purple">
            <CalendarCheck2 :size="18" />
          </div>

          <div>
            <span>
              Rest Day
            </span>

            <strong>
              {{
                valueOrFallback(
                  employee.restDay,
                )
              }}
            </strong>

            <small>
              Default weekly rest day
            </small>
          </div>
        </div>

        <div class="schedule-card">
          <div class="schedule-icon green">
            <MapPin :size="18" />
          </div>

          <div>
            <span>
              Work Location
            </span>

            <strong>
              {{
                valueOrFallback(
                  employee.branch,
                )
              }}
            </strong>

            <small>
              Assigned branch or work location
            </small>
          </div>
        </div>

      </div>
    </article>

  </div>

  <!-- ===============================================
       RIGHT SIDE
  ================================================ -->
  <div class="employment-side">

    <!-- CURRENT ASSIGNMENT -->
    <article class="profile-card">
      <div class="card-header compact">
        <div class="card-title">
          <div class="card-icon green">
            <UserCheck :size="17" />
          </div>

          <div>
            <h3>
              Current Assignment
            </h3>

            <p>
              Active organizational assignment.
            </p>
          </div>
        </div>
      </div>

      <div class="employment-summary">

        <div class="employment-summary-row">
          <span>
            Department
          </span>

          <strong>
            {{ employee.department }}
          </strong>
        </div>

        <div class="employment-summary-row">
          <span>
            Position
          </span>

          <strong>
            {{ employee.position }}
          </strong>
        </div>

        <div class="employment-summary-row">
          <span>
            Supervisor
          </span>

          <strong>
            {{
              valueOrFallback(
                employee.supervisor,
              )
            }}
          </strong>
        </div>

        <div class="employment-summary-row">
          <span>
            Branch
          </span>

          <strong>
            {{
              valueOrFallback(
                employee.branch,
              )
            }}
          </strong>
        </div>

      </div>
    </article>

    <!-- EMPLOYMENT STATUS -->
    <article class="profile-card">
      <div class="card-header compact">
        <div class="card-title">
          <div class="card-icon blue">
            <BadgeCheck :size="17" />
          </div>

          <div>
            <h3>
              Employment Status
            </h3>

            <p>
              Current employment record.
            </p>
          </div>
        </div>
      </div>

      <div class="employment-status-box">

        <div class="employment-status-main">
          <div>
            <span>
              Current Status
            </span>

            <StatusBadge
              :status="employee.status"
            />
          </div>
        </div>

        <div class="employment-summary-row">
          <span>
            Employment Type
          </span>

          <strong>
            {{ employee.employmentType }}
          </strong>
        </div>

        <div class="employment-summary-row">
          <span>
            Effective Since
          </span>

          <strong>
            {{
              formatDate(
                employee.dateHired,
              )
            }}
          </strong>
        </div>

      </div>
    </article>

    <!-- EMPLOYMENT HISTORY -->
    <article class="profile-card">
      <div class="card-header compact">
        <div class="card-title">
          <div class="card-icon purple">
            <History :size="17" />
          </div>

          <div>
            <h3>
              Employment History
            </h3>

            <p>
              Assignment and status history.
            </p>
          </div>
        </div>
      </div>

      <div class="employment-timeline">

        <div class="timeline-item">
          <div class="timeline-marker active" />

          <div class="timeline-content">
            <span class="timeline-date">
              Current
            </span>

            <strong>
              {{ employee.position }}
            </strong>

            <p>
              {{ employee.department }}
              ·
              {{ employee.employmentType }}
            </p>
          </div>
        </div>

        <div class="timeline-item">
          <div class="timeline-marker" />

          <div class="timeline-content">
            <span class="timeline-date">
              {{
                formatDate(
                  employee.dateHired,
                )
              }}
            </span>

            <strong>
              Employee Hired
            </strong>

            <p>
              Initial employee record created.
            </p>
          </div>
        </div>

      </div>

      <div class="history-note">
        Department transfers, position changes and
        employment status changes will automatically
        appear here once transaction history is connected.
      </div>
    </article>

  </div>

</div>

    <!-- ===================================================
     PAYROLL TAB
==================================================== -->
<div
  v-else-if="activeTab === 'payroll'"
  class="payroll-tab"
>
  <!-- LEFT COLUMN -->
  <div class="payroll-main">

    <!-- COMPENSATION SETUP -->
    <article class="profile-card">
      <div class="card-header">
        <div class="card-title">
          <div class="card-icon green">
            <Banknote :size="17" />
          </div>

          <div>
            <h3>Compensation Setup</h3>

            <p>
              Employee salary, rate and fixed compensation details.
            </p>
          </div>
        </div>

        <div class="compensation-actions">
          <button
            type="button"
            class="view-section"
            @click="handleCompensationHistory"
          >
            <History :size="12" />
            History
          </button>

          <button
            type="button"
            class="edit-section"
            @click="handleEdit"
          >
            <Pencil :size="12" />
            Edit
          </button>
        </div>
      </div>

      <div class="compensation-grid">

        <div class="compensation-card">
          <div class="compensation-icon blue">
            <WalletCards :size="17" />
          </div>

          <div>
            <span>Salary Type</span>

            <strong>
              {{
                valueOrFallback(
                  employee.salaryType,
                )
              }}
            </strong>
          </div>
        </div>

        <div class="compensation-card">
          <div class="compensation-icon green">
            <Banknote :size="17" />
          </div>

          <div>
            <span>Current Rate</span>

            <strong>
              {{ primaryRate }}
            </strong>
          </div>
        </div>

        <div class="compensation-card">
          <div class="compensation-icon orange">
            <ReceiptText :size="17" />
          </div>

          <div>
            <span>Fixed Allowance</span>

            <strong>
              {{
                formatCurrency(
                  employee.allowance,
                )
              }}
            </strong>
          </div>
        </div>

        <div class="compensation-card">
          <div class="compensation-icon purple">
            <CreditCard :size="17" />
          </div>

          <div>
            <span>Payroll Group</span>

            <strong>
              {{
                valueOrFallback(
                  employee.payrollGroup,
                )
              }}
            </strong>
          </div>
        </div>

      </div>
    </article>

    <!-- PAYMENT INFORMATION -->
    <article class="profile-card">
      <div class="card-header">
        <div class="card-title">
          <div class="card-icon blue">
            <CreditCard :size="17" />
          </div>

          <div>
            <h3>Payment Information</h3>

            <p>
              Employee payroll disbursement and bank account details.
            </p>
          </div>
        </div>
      </div>

      <div class="payment-grid">

        <div class="payment-detail">
          <span>Payment Method</span>

          <strong>
            {{ paymentMethod }}
          </strong>
        </div>

        <div class="payment-detail">
          <span>Bank Name</span>

          <strong>
            {{
              valueOrFallback(
                employee.bankName,
              )
            }}
          </strong>
        </div>

        <div class="payment-detail">
          <span>Account Name</span>

          <strong>
            {{
              valueOrFallback(
                employee.accountName,
              )
            }}
          </strong>
        </div>

        <div class="payment-detail">
          <span>Account Number</span>

          <strong class="account-number">
            {{ maskedAccountNumber }}
          </strong>
        </div>

      </div>

      <div class="bank-security-note">
        <ShieldCheck :size="15" />

        <div>
          <strong>
            Protected Payroll Information
          </strong>

          <p>
            Bank account details are considered sensitive employee payroll
            information and should only be accessible to authorized HR and
            payroll personnel.
          </p>
        </div>
      </div>
    </article>

    <!-- PAYROLL HISTORY -->
    <article class="profile-card">
      <div class="card-header">
        <div class="card-title">
          <div class="card-icon purple">
            <ReceiptText :size="17" />
          </div>

          <div>
            <h3>Payroll History</h3>

            <p>
              Completed payroll transactions and payslips.
            </p>
          </div>
        </div>
      </div>

      <div class="payroll-empty-state">
        <div class="payroll-empty-icon">
          <ReceiptText :size="23" />
        </div>

        <strong>
          No payroll records yet
        </strong>

        <p>
          Completed payroll transactions for this employee
          will appear here once payroll processing is connected.
        </p>
      </div>
    </article>

  </div>

  <!-- RIGHT COLUMN -->
  <div class="payroll-side">

    <!-- PAYROLL SUMMARY -->
    <article class="profile-card">
      <div class="card-header compact">
        <div class="card-title">
          <div class="card-icon green">
            <WalletCards :size="17" />
          </div>

          <div>
            <h3>Payroll Summary</h3>

            <p>
              Current compensation configuration.
            </p>
          </div>
        </div>
      </div>

      <div class="payroll-summary">

        <div class="payroll-summary-primary">
          <span>Current Rate</span>

          <strong>
            {{ primaryRate }}
          </strong>

          <small>
            {{
              valueOrFallback(
                employee.salaryType,
              )
            }}
            compensation
          </small>
        </div>

        <div class="payroll-summary-row">
          <span>Allowance</span>

          <strong>
            {{
              formatCurrency(
                employee.allowance,
              )
            }}
          </strong>
        </div>

        <div class="payroll-summary-row">
          <span>Payroll Group</span>

          <strong>
            {{
              valueOrFallback(
                employee.payrollGroup,
              )
            }}
          </strong>
        </div>

        <div class="payroll-summary-row">
          <span>Payment Method</span>

          <strong>
            {{ paymentMethod }}
          </strong>
        </div>

      </div>
    </article>

    <!-- GOVERNMENT RECORDS -->
    <article class="profile-card">
      <div class="card-header compact">
        <div class="card-title">
          <div class="card-icon blue">
            <Landmark :size="17" />
          </div>

          <div>
            <h3>Government Records</h3>

            <p>
              Statutory payroll identifiers.
            </p>
          </div>
        </div>
      </div>

      <div class="government-records">

        <div class="government-row">
          <div class="government-label">
            <span class="government-badge">
              SSS
            </span>

            <span>SSS Number</span>
          </div>

          <strong>
            {{
              valueOrFallback(
                employee.sssNumber,
              )
            }}
          </strong>
        </div>

        <div class="government-row">
          <div class="government-label">
            <span class="government-badge green">
              PH
            </span>

            <span>PhilHealth</span>
          </div>

          <strong>
            {{
              valueOrFallback(
                employee.philHealthNumber,
              )
            }}
          </strong>
        </div>

        <div class="government-row">
          <div class="government-label">
            <span class="government-badge orange">
              HDMF
            </span>

            <span>Pag-IBIG</span>
          </div>

          <strong>
            {{
              valueOrFallback(
                employee.pagIbigNumber,
              )
            }}
          </strong>
        </div>

        <div class="government-row">
          <div class="government-label">
            <span class="government-badge purple">
              TIN
            </span>

            <span>Tax Number</span>
          </div>

          <strong>
            {{
              valueOrFallback(
                employee.tinNumber,
              )
            }}
          </strong>
        </div>

      </div>
    </article>

    <!-- BANK ACCOUNT -->
    <article class="profile-card">
      <div class="card-header compact">
        <div class="card-title">
          <div class="card-icon purple">
            <CreditCard :size="17" />
          </div>

          <div>
            <h3>Bank Account</h3>

            <p>
              Payroll payment destination.
            </p>
          </div>
        </div>
      </div>

      <div class="bank-summary">

        <div class="bank-logo">
          <Landmark :size="21" />
        </div>

        <div class="bank-details">
          <span>
            {{
              valueOrFallback(
                employee.bankName,
              )
            }}
          </span>

          <strong>
            {{ maskedAccountNumber }}
          </strong>

          <small>
            {{
              valueOrFallback(
                employee.accountName,
              )
            }}
          </small>
        </div>

      </div>
    </article>

  </div>
</div>

   <!-- ===================================================
     DOCUMENTS TAB
==================================================== -->
<div
  v-else-if="activeTab === 'documents'"
  class="documents-tab"
>

  <!-- LEFT -->
  <div class="documents-main">

    <article class="profile-card">
      <div class="card-header">
        <div class="card-title">
          <div class="card-icon blue">
            <Files :size="17" />
          </div>

          <div>
            <h3>
              Employee Documents
            </h3>

            <p>
              Uploaded employee records and supporting documents.
            </p>
          </div>
        </div>

        <AppButton
          :icon="Upload"
          @click="handleAddDocument"
        >
          Add Document
        </AppButton>
      </div>

      <!-- DOCUMENT LIST -->
      <div
        v-if="documents.length"
        class="document-list"
      >
        <div
          v-for="document in documents"
          :key="document.id"
          class="document-row"
        >
          <div class="document-file">
            <div class="document-file-icon">
              <FileText :size="18" />
            </div>

            <div class="document-file-info">
              <strong>
                {{ document.type }}
              </strong>

              <span>
                {{ document.name }}
              </span>

              <div class="document-meta">
                <span>
                  Uploaded:
                  {{
                    formatDate(
                      document.uploadedAt,
                    )
                  }}
                </span>

                <span
                  v-if="document.expiresAt"
                >
                  Expires:
                  {{
                    formatDate(
                      document.expiresAt,
                    )
                  }}
                </span>
              </div>
            </div>
          </div>

          <span
            class="document-status"
            :class="
              documentStatusClass(
                document.status,
              )
            "
          >
            {{
              document.status ??
              'Pending'
            }}
          </span>

          <div class="document-actions">
            <button
              type="button"
              class="document-action"
              title="View document"
              @click="
                handleViewDocument(
                  document.name,
                )
              "
            >
              <Eye :size="14" />
            </button>

            <button
              type="button"
              class="document-action"
              title="Download document"
              @click="
                handleDownloadDocument(
                  document.name,
                )
              "
            >
              <Download :size="14" />
            </button>
          </div>
        </div>
      </div>

      <!-- EMPTY -->
      <div
        v-else
        class="documents-empty"
      >
        <div class="documents-empty-icon">
          <Files :size="23" />
        </div>

        <strong>
          No documents uploaded
        </strong>

        <p>
          Employee documents will appear here
          once files are uploaded.
        </p>
      </div>

    </article>

  </div>

  <!-- RIGHT -->
  <div class="documents-side">

    <!-- SUMMARY -->
    <article class="profile-card">
      <div class="card-header compact">
        <div class="card-title">
          <div class="card-icon green">
            <CheckCircle2 :size="17" />
          </div>

          <div>
            <h3>
              Document Summary
            </h3>

            <p>
              Current document status.
            </p>
          </div>
        </div>
      </div>

      <div class="documents-summary-grid">

        <div class="document-summary-card">
          <span>Total</span>

          <strong>
            {{ documentSummary.total }}
          </strong>
        </div>

        <div class="document-summary-card green">
          <span>Verified</span>

          <strong>
            {{ documentSummary.verified }}
          </strong>
        </div>

        <div class="document-summary-card orange">
          <span>Expiring</span>

          <strong>
            {{ documentSummary.expiring }}
          </strong>
        </div>

        <div class="document-summary-card purple">
          <span>Pending</span>

          <strong>
            {{ documentSummary.pending }}
          </strong>
        </div>

      </div>
    </article>

    <!-- REQUIRED DOCUMENTS -->
    <article class="profile-card">
      <div class="card-header compact">
        <div class="card-title">
          <div class="card-icon orange">
            <FileText :size="17" />
          </div>

          <div>
            <h3>
              Required Documents
            </h3>

            <p>
              Employee document checklist.
            </p>
          </div>
        </div>
      </div>

      <div class="required-documents">
        <div
          v-for="required in requiredDocumentTypes"
          :key="required"
          class="required-document-row"
        >
          <div class="required-document-name">
            <div
              class="required-document-icon"
              :class="{
                complete:
                  hasDocument(required),
              }"
            >
              <CheckCircle2
                v-if="
                  hasDocument(required)
                "
                :size="14"
              />

              <XCircle
                v-else
                :size="14"
              />
            </div>

            <span>
              {{ required }}
            </span>
          </div>

          <strong
            :class="{
              complete:
                hasDocument(required),
            }"
          >
            {{
              hasDocument(required)
                ? 'Available'
                : 'Missing'
            }}
          </strong>
        </div>
      </div>

      <div class="document-note">
        <AlertTriangle :size="14" />

        <span>
          Missing and expiring documents should be reviewed
          before employee records are considered complete.
        </span>
      </div>
    </article>

  </div>
</div>

    <!-- ===================================================
     ACTIVITY TAB
==================================================== -->
<div
  v-else-if="activeTab === 'activity'"
  class="activity-tab"
>

  <!-- LEFT -->
  <div class="activity-main">

    <article class="profile-card">

      <div class="card-header">
        <div class="card-title">
          <div class="card-icon purple">
            <Activity :size="17" />
          </div>

          <div>
            <h3>
              Employee Activity
            </h3>

            <p>
              Timeline of employee record activity.
            </p>
          </div>
        </div>
      </div>

      <!-- FILTERS -->
      <div class="activity-toolbar">

        <div class="activity-filter-label">
          <ListFilter :size="14" />

          <span>
            Filter Activity
          </span>
        </div>

        <div class="activity-filters">
          <button
            v-for="filter in activityFilters"
            :key="filter"
            type="button"
            class="activity-filter-button"
            :class="{
              active:
                activityFilter === filter,
            }"
            @click="
              activityFilter = filter
            "
          >
            {{ filter }}
          </button>
        </div>

      </div>

      <!-- TIMELINE -->
      <div
        v-if="filteredActivities.length"
        class="activity-timeline"
      >
        <div
          v-for="item in filteredActivities"
          :key="item.id"
          class="activity-item"
        >
          <div
            class="activity-item-icon"
            :class="
              activityIconClass(
                item.category,
              )
            "
          >
            <component
              :is="item.icon"
              :size="16"
            />
          </div>

          <div class="activity-item-content">

            <div class="activity-item-heading">
              <div>
                <strong>
                  {{ item.title }}
                </strong>

                <span
                  class="activity-category"
                  :class="
                    activityIconClass(
                      item.category,
                    )
                  "
                >
                  {{ item.category }}
                </span>
              </div>

              <time>
                {{
                  formatDate(
                    item.date,
                  )
                }}
              </time>
            </div>

            <p>
              {{ item.description }}
            </p>

          </div>
        </div>
      </div>

      <!-- EMPTY -->
      <div
        v-else
        class="activity-empty"
      >
        <div class="activity-empty-icon">
          <Activity :size="23" />
        </div>

        <strong>
          No activity found
        </strong>

        <p>
          There are no employee activities
          matching the selected filter.
        </p>
      </div>

    </article>

  </div>

  <!-- RIGHT -->
  <div class="activity-side">

    <!-- SUMMARY -->
    <article class="profile-card">
      <div class="card-header compact">
        <div class="card-title">
          <div class="card-icon blue">
            <History :size="17" />
          </div>

          <div>
            <h3>
              Activity Summary
            </h3>

            <p>
              Current recorded activities.
            </p>
          </div>
        </div>
      </div>

      <div class="activity-summary">

        <div class="activity-summary-primary">
          <span>
            Total Activities
          </span>

          <strong>
            {{ activitySummary.total }}
          </strong>
        </div>

        <div class="activity-summary-row">
          <div>
            <div class="summary-dot green" />

            <span>
              Employment
            </span>
          </div>

          <strong>
            {{
              activitySummary.employment
            }}
          </strong>
        </div>

        <div class="activity-summary-row">
          <div>
            <div class="summary-dot blue" />

            <span>
              Documents
            </span>
          </div>

          <strong>
            {{
              activitySummary.documents
            }}
          </strong>
        </div>

      </div>
    </article>

    <!-- AUDIT INFORMATION -->
    <article class="profile-card">
      <div class="card-header compact">
        <div class="card-title">
          <div class="card-icon green">
            <ShieldCheck :size="17" />
          </div>

          <div>
            <h3>
              Audit Information
            </h3>

            <p>
              Employee record history tracking.
            </p>
          </div>
        </div>
      </div>

      <div class="audit-info">

        <div class="audit-info-icon">
          <CalendarClock :size="19" />
        </div>

        <div>
          <strong>
            Activity tracking enabled
          </strong>

          <p>
            Employment changes, document uploads,
            payroll changes, approvals and other
            employee actions will appear here once
            backend audit logs are connected.
          </p>
        </div>

      </div>
    </article>

  </div>
</div>
</template>

    <!-- =====================================================
         EMPLOYEE NOT FOUND
    ====================================================== -->
    <div
      v-else
      class="not-found"
    >
      <div class="not-found-icon">
        <UserRound :size="28" />
      </div>

      <h2>
        Employee Not Found
      </h2>

      <p>
        The employee record you are trying to view does not exist.
      </p>

      <AppButton
        :icon="ArrowLeft"
        @click="goBack"
      >
        Back to Employees
      </AppButton>
    </div>

  </section>
</template>

<style scoped>
/* Consistent type scale for the entire employee profile and all five tabs. */
.profile-loading {
  display: flex;
  min-height: 190px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 13px;
}
.profile-loading strong { color: var(--text-primary); font-size: 15px; }
.profile-loading p { margin: 0; }
.profile-error { color: var(--red); }

.employee-profile-page {
  --profile-page-title-size: 26px;
  --profile-heading-size: 15px;
  --profile-subheading-size: 14px;
  --profile-description-size: 12px;
  --profile-label-size: 12px;
  --profile-value-size: 13px;
  --profile-secondary-size: 11px;
  --profile-caption-size: 12px;
  --profile-control-size: 12px;
  --profile-count-size: 20px;
  line-height: 1.45;
  width: 100%;
  max-width: 1660px;
  margin: 0 auto;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  margin-bottom: 13px;
  padding: 0;

  border: 0;

  background: transparent;
  color: var(--primary);

  font-size: var(--profile-control-size);
  font-weight: 600;
}

.back-link:hover {
  text-decoration: underline;
}

/* ==============================
   PROFILE HEADER
============================== */

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  margin-bottom: 18px;
}

.profile-identity {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 13px;
}

.profile-avatar {
  display: flex;
  width: 58px;
  height: 58px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  border-radius: 14px;

  background:
    linear-gradient(
      135deg,
      var(--primary),
      #6091ff
    );

  color: white;

  font-size: 19px;
  font-weight: 750;

  box-shadow:
    0 7px 18px rgba(36, 107, 253, 0.18);
}

.profile-name {
  min-width: 0;
}

.name-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 9px;
}

.name-row h1 {
  margin: 0;

  color: var(--text-primary);

  font-size: var(--profile-page-title-size);
  font-weight: 750;
  letter-spacing: -0.5px;
}

.profile-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;

  margin-top: 6px;

  color: var(--text-secondary);

  font-size: var(--profile-caption-size);
}

.meta-dot {
  width: 3px;
  height: 3px;

  border-radius: 50%;

  background: var(--text-muted);
}

.profile-actions {
  display: flex;
  align-items: center;
  gap: 7px;
}

.more-button {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;

  border: 1px solid var(--border);
  border-radius: 8px;

  background: var(--bg-card);
  color: var(--text-secondary);
}

.more-button:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

/* ==============================
   QUICK CARDS
============================== */

.quick-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 10px;

  margin-bottom: 14px;
}

.quick-card {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;

  padding: 12px;

  border: 1px solid var(--border);
  border-radius: 10px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.quick-icon {
  display: flex;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  border-radius: 9px;
}

.quick-icon.blue,
.card-icon.blue {
  background: var(--primary-soft);
  color: var(--primary);
}

.quick-icon.green,
.card-icon.green {
  background: var(--green-soft);
  color: var(--green);
}

.quick-icon.orange,
.card-icon.orange {
  background: var(--orange-soft);
  color: var(--orange);
}

.quick-icon.purple,
.card-icon.purple {
  background: var(--purple-soft);
  color: var(--purple);
}

.quick-card > div:last-child {
  min-width: 0;
}

.quick-card span,
.quick-card strong {
  display: block;
}

.quick-card span {
  color: var(--text-muted);

  font-size: var(--profile-secondary-size);
}

.quick-card strong {
  overflow: hidden;

  margin-top: 3px;

  color: var(--text-primary);

  font-size: var(--profile-value-size);

  white-space: nowrap;
  text-overflow: ellipsis;
}

/* ==============================
   TABS
============================== */

.tabs-card {
  display: flex;
  gap: 3px;

  margin-bottom: 13px;
  padding: 5px;

  overflow-x: auto;

  border: 1px solid var(--border);
  border-radius: 10px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.tab-button {
  display: flex;
  min-height: 38px;
  align-items: center;
  gap: 6px;

  padding: 0 12px;

  border: 0;
  border-radius: 7px;

  background: transparent;
  color: var(--text-secondary);

  font-size: var(--profile-control-size);
  font-weight: 600;

  white-space: nowrap;
}

.tab-button:hover {
  background: var(--bg-card-soft);
}

.tab-button.active {
  background: var(--primary-soft);
  color: var(--primary);
}

/* ==============================
   LAYOUT
============================== */

.overview-layout {
  display: grid;
  grid-template-columns:
    minmax(0, 1.5fr)
    minmax(280px, 0.7fr);

  gap: 12px;
}

.main-column,
.side-column {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 12px;
}

/* ==============================
   CARD
============================== */

.profile-card {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 10px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  padding: 12px 14px;

  border-bottom:
    1px solid var(--border-soft);
}

.card-header.compact {
  padding: 11px 13px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 9px;
}

.card-icon {
  display: flex;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  border-radius: 8px;
}

.card-title h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: var(--profile-heading-size);
  font-weight: 700;
}

.card-title p {
  margin: 2px 0 0;

  color: var(--text-muted);

  font-size: var(--profile-description-size);
}

.edit-section,
.view-section {
  display: flex;
  align-items: center;
  gap: 5px;

  padding: 5px 7px;

  border: 0;
  border-radius: 6px;

  background: transparent;
  color: var(--primary);

  font-size: var(--profile-control-size);
  font-weight: 600;
}

.edit-section:hover,
.view-section:hover {
  background: var(--primary-soft);
}

/* ==============================
   DETAILS
============================== */

.details-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  padding: 4px 14px 11px;
}

.detail-item {
  min-width: 0;

  padding: 10px 5px;

  border-bottom:
    1px solid var(--border-soft);
}

.detail-item span {
  display: block;

  margin-bottom: 4px;

  color: var(--text-muted);

  font-size: var(--profile-label-size);
}

.detail-item strong {
  display: block;

  color: var(--text-primary);

  font-size: var(--profile-value-size);
  font-weight: 600;

  word-break: break-word;
}

.detail-with-icon {
  display: flex !important;
  align-items: center;
  gap: 5px;

  color: var(--text-secondary) !important;
}

/* ==============================
   SIDE PANEL
============================== */

.status-panel {
  padding: 3px 13px 11px;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  padding: 9px 0;

  border-bottom:
    1px solid var(--border-soft);
}

.status-row:last-child {
  border-bottom: 0;
}

.status-row > span {
  color: var(--text-muted);

  font-size: var(--profile-label-size);
}

.status-row > strong {
  color: var(--text-primary);

  font-size: var(--profile-value-size);
  font-weight: 600;

  text-align: right;
}

.contact-list {
  padding: 8px 13px 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 9px;

  padding: 8px 0;
}

.contact-icon {
  display: flex;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: var(--bg-card-soft);
  color: var(--text-secondary);
}

.contact-item > div:last-child {
  min-width: 0;
}

.contact-item span,
.contact-item strong {
  display: block;
}

.contact-item span {
  color: var(--text-muted);

  font-size: var(--profile-secondary-size);
}

.contact-item strong {
  overflow: hidden;

  margin-top: 2px;

  color: var(--text-primary);

  font-size: var(--profile-value-size);

  white-space: nowrap;
  text-overflow: ellipsis;
}

/* ==============================
   OTHER TAB
============================== */

.tab-content {
  display: block;
}

.coming-soon {
  display: flex;
  min-height: 300px;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  border: 1px solid var(--border);
  border-radius: 10px;

  background: var(--bg-card);

  box-shadow: var(--shadow);

  text-align: center;
}

.coming-icon {
  display: flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;

  margin-bottom: 10px;

  border-radius: 12px;

  background: var(--primary-soft);
  color: var(--primary);
}

.coming-soon h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: var(--profile-heading-size);
}

.coming-soon p {
  margin: 5px 0 0;

  color: var(--text-muted);

  font-size: var(--profile-description-size);
}

/* ==============================
   NOT FOUND
============================== */

.not-found {
  display: flex;
  min-height:
    calc(100vh - 160px);

  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;
}

.not-found-icon {
  display: flex;
  width: 58px;
  height: 58px;
  align-items: center;
  justify-content: center;

  margin-bottom: 13px;

  border-radius: 14px;

  background: var(--primary-soft);
  color: var(--primary);
}

.not-found h2 {
  margin: 0;

  color: var(--text-primary);

  font-size: 20px;
}

.not-found p {
  margin: 6px 0 17px;

  color: var(--text-muted);

  font-size: var(--profile-value-size);
}

/* ==============================
   EMPLOYMENT TAB
============================== */

.employment-tab {
  display: grid;

  grid-template-columns:
    minmax(0, 1.5fr)
    minmax(280px, 0.7fr);

  gap: 12px;
}

.employment-main,
.employment-side {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 12px;
}

/* CURRENT EMPLOYMENT */

.employment-details-grid {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 1px;

  padding: 12px 14px;

  background: var(--border-soft);
}

.employment-detail {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;

  padding: 12px;

  background: var(--bg-card);
}

.employment-detail-icon {
  display: flex;

  width: 34px;
  height: 34px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;
}

.employment-detail-icon.blue {
  background: var(--primary-soft);
  color: var(--primary);
}

.employment-detail-icon.green {
  background: var(--green-soft);
  color: var(--green);
}

.employment-detail-icon.orange {
  background: var(--orange-soft);
  color: var(--orange);
}

.employment-detail-icon.purple {
  background: var(--purple-soft);
  color: var(--purple);
}

.employment-detail span,
.employment-detail strong {
  display: block;
}

.employment-detail span {
  margin-bottom: 4px;

  color: var(--text-muted);

  font-size: var(--profile-label-size);
}

.employment-detail strong {
  color: var(--text-primary);

  font-size: var(--profile-value-size);
  font-weight: 650;
}

/* ASSIGNMENT */

.assignment-grid {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  padding: 4px 14px 12px;
}

.assignment-item {
  padding: 11px 5px;

  border-bottom:
    1px solid var(--border-soft);
}

.assignment-item span,
.assignment-item strong {
  display: block;
}

.assignment-item span {
  color: var(--text-muted);

  font-size: var(--profile-label-size);
}

.assignment-item strong {
  margin-top: 4px;

  color: var(--text-primary);

  font-size: var(--profile-value-size);
  font-weight: 600;
}

/* SCHEDULE */

.schedule-grid {
  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 9px;

  padding: 13px 14px;
}

.schedule-card {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 9px;

  padding: 11px;

  border: 1px solid var(--border);
  border-radius: 9px;

  background: var(--bg-card-soft);
}

.schedule-icon {
  display: flex;

  width: 34px;
  height: 34px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: var(--orange-soft);
  color: var(--orange);
}

.schedule-icon.purple {
  background: var(--purple-soft);
  color: var(--purple);
}

.schedule-icon.green {
  background: var(--green-soft);
  color: var(--green);
}

.schedule-card > div:last-child {
  min-width: 0;
}

.schedule-card span,
.schedule-card strong,
.schedule-card small {
  display: block;
}

.schedule-card span {
  color: var(--text-muted);

  font-size: var(--profile-label-size);
}

.schedule-card strong {
  overflow: hidden;

  margin-top: 3px;

  color: var(--text-primary);

  font-size: var(--profile-value-size);

  white-space: nowrap;
  text-overflow: ellipsis;
}

.schedule-card small {
  margin-top: 4px;

  color: var(--text-muted);

  font-size: var(--profile-secondary-size);
}

/* RIGHT SUMMARY */

.employment-summary {
  padding: 3px 13px 11px;
}

.employment-summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  padding: 10px 0;

  border-bottom:
    1px solid var(--border-soft);
}

.employment-summary-row:last-child {
  border-bottom: 0;
}

.employment-summary-row span {
  color: var(--text-muted);

  font-size: var(--profile-label-size);
}

.employment-summary-row strong {
  max-width: 60%;

  color: var(--text-primary);

  font-size: var(--profile-value-size);
  font-weight: 600;

  text-align: right;
}

/* STATUS */

.employment-status-box {
  padding: 5px 13px 11px;
}

.employment-status-main {
  padding: 12px 0;

  border-bottom:
    1px solid var(--border-soft);
}

.employment-status-main > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.employment-status-main span {
  color: var(--text-muted);

  font-size: var(--profile-label-size);
}

/* TIMELINE */

.employment-timeline {
  position: relative;

  padding: 13px 15px 4px;
}

.timeline-item {
  position: relative;

  display: flex;
  gap: 11px;

  padding-bottom: 18px;
}

.timeline-item:not(:last-child)::before {
  position: absolute;

  top: 12px;
  left: 5px;

  width: 1px;
  height: calc(100% - 2px);

  background: var(--border);

  content: '';
}

.timeline-marker {
  position: relative;
  z-index: 1;

  width: 11px;
  height: 11px;

  flex-shrink: 0;

  margin-top: 3px;

  border: 2px solid var(--bg-card);
  border-radius: 50%;

  background: var(--text-muted);

  box-shadow:
    0 0 0 1px var(--border);
}

.timeline-marker.active {
  background: var(--green);

  box-shadow:
    0 0 0 3px var(--green-soft);
}

.timeline-content {
  min-width: 0;
}

.timeline-date {
  display: block;

  margin-bottom: 3px;

  color: var(--text-muted);

  font-size: var(--profile-secondary-size);
}

.timeline-content strong {
  display: block;

  color: var(--text-primary);

  font-size: var(--profile-value-size);
}

.timeline-content p {
  margin: 3px 0 0;

  color: var(--text-secondary);

  font-size: var(--profile-description-size);
}

.history-note {
  margin:
    0 13px 13px;

  padding: 9px;

  border-radius: 7px;

  background: var(--primary-soft);
  color: var(--text-secondary);

  font-size: var(--profile-description-size);
  line-height: 1.5;
}

    /* ==============================
   PAYROLL TAB
============================== */

.payroll-tab {
  display: grid;
  grid-template-columns:
    minmax(0, 1.5fr)
    minmax(280px, 0.7fr);
  gap: 12px;
}

.payroll-main,
.payroll-side {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 12px;
}

/* ==============================
   COMPENSATION
============================== */

.compensation-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 9px;

  padding: 13px 14px;
}

.compensation-card {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;

  padding: 12px;

  border: 1px solid var(--border);
  border-radius: 9px;

  background: var(--bg-card-soft);
}

.compensation-icon {
  display: flex;
  width: 35px;
  height: 35px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  border-radius: 8px;
}

.compensation-icon.blue {
  background: var(--primary-soft);
  color: var(--primary);
}

.compensation-icon.green {
  background: var(--green-soft);
  color: var(--green);
}

.compensation-icon.orange {
  background: var(--orange-soft);
  color: var(--orange);
}

.compensation-icon.purple {
  background: var(--purple-soft);
  color: var(--purple);
}

.compensation-card > div:last-child {
  min-width: 0;
}

.compensation-card span,
.compensation-card strong {
  display: block;
}

.compensation-card span {
  color: var(--text-muted);

  font-size: var(--profile-label-size);
}

.compensation-card strong {
  overflow: hidden;

  margin-top: 4px;

  color: var(--text-primary);

  font-size: var(--profile-subheading-size);
  font-weight: 650;

  white-space: nowrap;
  text-overflow: ellipsis;
}

/* ==============================
   PAYMENT INFORMATION
============================== */

.payment-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  padding: 5px 14px 10px;
}

.payment-detail {
  min-width: 0;

  padding: 11px 5px;

  border-bottom:
    1px solid var(--border-soft);
}

.payment-detail span,
.payment-detail strong {
  display: block;
}

.payment-detail span {
  color: var(--text-muted);

  font-size: var(--profile-label-size);
}

.payment-detail strong {
  margin-top: 4px;

  color: var(--text-primary);

  font-size: var(--profile-value-size);
  font-weight: 600;

  word-break: break-word;
}

.account-number {
  letter-spacing: 0.7px;
}

/* ==============================
   SECURITY NOTE
============================== */

.bank-security-note {
  display: flex;
  align-items: flex-start;
  gap: 9px;

  margin: 0 14px 13px;
  padding: 10px;

  border-radius: 8px;

  background: var(--primary-soft);
  color: var(--primary);
}

.bank-security-note > svg {
  flex-shrink: 0;

  margin-top: 1px;
}

.bank-security-note strong {
  display: block;

  color: var(--text-primary);

  font-size: var(--profile-value-size);
}

.bank-security-note p {
  margin: 3px 0 0;

  color: var(--text-secondary);

  font-size: var(--profile-description-size);
  line-height: 1.5;
}

/* ==============================
   PAYROLL SUMMARY
============================== */

.payroll-summary {
  padding: 11px 13px;
}

.payroll-summary-primary {
  margin-bottom: 7px;
  padding: 13px;

  border-radius: 9px;

  background: var(--green-soft);
}

.payroll-summary-primary span,
.payroll-summary-primary strong,
.payroll-summary-primary small {
  display: block;
}

.payroll-summary-primary span {
  color: var(--green);

  font-size: var(--profile-label-size);
  font-weight: 600;
}

.payroll-summary-primary strong {
  margin-top: 5px;

  color: var(--text-primary);

  font-size: var(--profile-count-size);
  font-weight: 750;
}

.payroll-summary-primary small {
  margin-top: 3px;

  color: var(--text-secondary);

  font-size: var(--profile-secondary-size);
}

.payroll-summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  padding: 10px 0;

  border-bottom:
    1px solid var(--border-soft);
}

.payroll-summary-row:last-child {
  border-bottom: 0;
}

.payroll-summary-row span {
  color: var(--text-muted);

  font-size: var(--profile-label-size);
}

.payroll-summary-row strong {
  max-width: 60%;

  color: var(--text-primary);

  font-size: var(--profile-value-size);
  font-weight: 600;

  text-align: right;
}

/* ==============================
   GOVERNMENT RECORDS
============================== */

.government-records {
  padding: 5px 13px 11px;
}

.government-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  padding: 9px 0;

  border-bottom:
    1px solid var(--border-soft);
}

.government-row:last-child {
  border-bottom: 0;
}

.government-label {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 7px;
}

.government-label > span:last-child {
  color: var(--text-muted);

  font-size: var(--profile-label-size);
}

.government-badge {
  display: flex;

  min-width: 30px;
  height: 24px;

  align-items: center;
  justify-content: center;

  padding: 0 6px;

  border-radius: 6px;

  background: var(--primary-soft);
  color: var(--primary);

  font-size: var(--profile-secondary-size);
  font-weight: 700;
}

.government-badge.green {
  background: var(--green-soft);
  color: var(--green);
}

.government-badge.orange {
  background: var(--orange-soft);
  color: var(--orange);
}

.government-badge.purple {
  background: var(--purple-soft);
  color: var(--purple);
}

.government-row > strong {
  max-width: 55%;

  color: var(--text-primary);

  font-size: var(--profile-value-size);
  font-weight: 600;

  text-align: right;
  word-break: break-word;
}

/* ==============================
   BANK ACCOUNT
============================== */

.bank-summary {
  display: flex;
  align-items: center;
  gap: 11px;

  padding: 14px;
}

.bank-logo {
  display: flex;

  width: 43px;
  height: 43px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: var(--purple-soft);
  color: var(--purple);
}

.bank-details {
  min-width: 0;
}

.bank-details span,
.bank-details strong,
.bank-details small {
  display: block;
}

.bank-details span {
  color: var(--text-muted);

  font-size: var(--profile-label-size);
}

.bank-details strong {
  overflow: hidden;

  margin-top: 3px;

  color: var(--text-primary);

  font-size: var(--profile-subheading-size);
  letter-spacing: 0.7px;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.bank-details small {
  overflow: hidden;

  margin-top: 3px;

  color: var(--text-secondary);

  font-size: var(--profile-secondary-size);

  white-space: nowrap;
  text-overflow: ellipsis;
}

/* ==============================
   PAYROLL HISTORY EMPTY STATE
============================== */

.payroll-empty-state {
  display: flex;

  min-height: 150px;

  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 25px;

  text-align: center;
}

.payroll-empty-icon {
  display: flex;

  width: 44px;
  height: 44px;

  align-items: center;
  justify-content: center;

  margin-bottom: 9px;

  border-radius: 10px;

  background: var(--primary-soft);
  color: var(--primary);
}

.payroll-empty-state strong {
  color: var(--text-primary);

  font-size: var(--profile-subheading-size);
}

.payroll-empty-state p {
  max-width: 380px;

  margin: 4px 0 0;

  color: var(--text-muted);

  font-size: var(--profile-description-size);
  line-height: 1.5;
}

/* ==============================
   DOCUMENTS TAB
============================== */

.documents-tab {
  display: grid;
  grid-template-columns:
    minmax(0, 1.5fr)
    minmax(280px, 0.7fr);

  gap: 12px;
}

.documents-main,
.documents-side {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 12px;
}

/* DOCUMENT LIST */

.document-list {
  padding: 4px 14px 10px;
}

.document-row {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    auto
    auto;

  align-items: center;
  gap: 12px;

  padding: 12px 4px;

  border-bottom:
    1px solid var(--border-soft);
}

.document-row:last-child {
  border-bottom: 0;
}

.document-file {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
}

.document-file-icon {
  display: flex;

  width: 38px;
  height: 38px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: var(--primary-soft);
  color: var(--primary);
}

.document-file-info {
  min-width: 0;
}

.document-file-info strong,
.document-file-info > span {
  display: block;
}

.document-file-info strong {
  color: var(--text-primary);

  font-size: var(--profile-value-size);
  font-weight: 650;
}

.document-file-info > span {
  overflow: hidden;

  margin-top: 3px;

  color: var(--text-secondary);

  font-size: var(--profile-description-size);

  white-space: nowrap;
  text-overflow: ellipsis;
}

.document-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  margin-top: 5px;
}

.document-meta span {
  color: var(--text-muted);

  font-size: var(--profile-secondary-size);
}

/* STATUS */

.document-status {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  min-height: 23px;

  padding: 0 8px;

  border-radius: 20px;

  font-size: var(--profile-secondary-size);
  font-weight: 650;

  white-space: nowrap;
}

.document-status.verified {
  background: var(--green-soft);
  color: var(--green);
}

.document-status.expiring {
  background: var(--orange-soft);
  color: var(--orange);
}

.document-status.pending {
  background: var(--purple-soft);
  color: var(--purple);
}

.document-status.expired {
  background: var(--red-soft);
  color: var(--red);
}

/* ACTIONS */

.document-actions {
  display: flex;
  gap: 5px;
}

.document-action {
  display: flex;

  width: 30px;
  height: 30px;

  align-items: center;
  justify-content: center;

  border: 1px solid var(--border);
  border-radius: 7px;

  background: var(--bg-card);
  color: var(--text-secondary);
}

.document-action:hover {
  background: var(--primary-soft);
  color: var(--primary);
}

/* EMPTY */

.documents-empty {
  display: flex;

  min-height: 180px;

  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 25px;

  text-align: center;
}

.documents-empty-icon {
  display: flex;

  width: 44px;
  height: 44px;

  align-items: center;
  justify-content: center;

  margin-bottom: 9px;

  border-radius: 10px;

  background: var(--primary-soft);
  color: var(--primary);
}

.documents-empty strong {
  color: var(--text-primary);

  font-size: var(--profile-subheading-size);
}

.documents-empty p {
  margin: 4px 0 0;

  color: var(--text-muted);

  font-size: var(--profile-description-size);
}

/* SUMMARY */

.documents-summary-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 8px;

  padding: 12px 13px;
}

.document-summary-card {
  padding: 11px;

  border-radius: 8px;

  background: var(--primary-soft);
}

.document-summary-card.green {
  background: var(--green-soft);
}

.document-summary-card.orange {
  background: var(--orange-soft);
}

.document-summary-card.purple {
  background: var(--purple-soft);
}

.document-summary-card span,
.document-summary-card strong {
  display: block;
}

.document-summary-card span {
  color: var(--text-muted);

  font-size: var(--profile-label-size);
}

.document-summary-card strong {
  margin-top: 4px;

  color: var(--text-primary);

  font-size: var(--profile-count-size);
  font-weight: 750;
}

/* REQUIRED DOCUMENTS */

.required-documents {
  padding: 5px 13px 8px;
}

.required-document-row {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding: 9px 0;

  border-bottom:
    1px solid var(--border-soft);
}

.required-document-row:last-child {
  border-bottom: 0;
}

.required-document-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.required-document-icon {
  display: flex;

  width: 27px;
  height: 27px;

  align-items: center;
  justify-content: center;

  border-radius: 7px;

  background: var(--red-soft);
  color: var(--red);
}

.required-document-icon.complete {
  background: var(--green-soft);
  color: var(--green);
}

.required-document-name span {
  color: var(--text-primary);

  font-size: var(--profile-label-size);
  font-weight: 600;
}

.required-document-row > strong {
  color: var(--red);

  font-size: var(--profile-secondary-size);
  font-weight: 650;
}

.required-document-row > strong.complete {
  color: var(--green);
}

/* NOTE */

.document-note {
  display: flex;
  align-items: flex-start;
  gap: 7px;

  margin: 0 13px 13px;
  padding: 9px;

  border-radius: 7px;

  background: var(--orange-soft);
  color: var(--orange);
}

.document-note svg {
  flex-shrink: 0;
}

.document-note span {
  color: var(--text-secondary);

  font-size: var(--profile-description-size);
  line-height: 1.5;
}

/* ==============================
   ACTIVITY TAB
============================== */

.activity-tab {
  display: grid;

  grid-template-columns:
    minmax(0, 1.5fr)
    minmax(280px, 0.7fr);

  gap: 12px;
}

.activity-main,
.activity-side {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 12px;
}

/* TOOLBAR */

.activity-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding: 10px 14px;

  border-bottom:
    1px solid var(--border-soft);
}

.activity-filter-label {
  display: flex;
  align-items: center;
  gap: 6px;

  color: var(--text-secondary);

  font-size: var(--profile-control-size);
  font-weight: 600;
}

.activity-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.activity-filter-button {
  min-height: 27px;

  padding: 0 9px;

  border: 1px solid var(--border);
  border-radius: 7px;

  background: var(--bg-card);
  color: var(--text-secondary);

  font-size: var(--profile-control-size);
  font-weight: 600;
}

.activity-filter-button:hover {
  background: var(--bg-card-soft);
}

.activity-filter-button.active {
  border-color: var(--primary);

  background: var(--primary-soft);
  color: var(--primary);
}

/* TIMELINE */

.activity-timeline {
  padding: 7px 14px 13px;
}

.activity-item {
  position: relative;

  display: flex;
  gap: 11px;

  padding: 12px 4px;
}

.activity-item:not(:last-child) {
  border-bottom:
    1px solid var(--border-soft);
}

.activity-item-icon {
  display: flex;

  width: 36px;
  height: 36px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;
}

.activity-item-icon.green {
  background: var(--green-soft);
  color: var(--green);
}

.activity-item-icon.blue {
  background: var(--primary-soft);
  color: var(--primary);
}

.activity-item-content {
  min-width: 0;
  flex: 1;
}

.activity-item-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 12px;
}

.activity-item-heading > div {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
}

.activity-item-heading strong {
  color: var(--text-primary);

  font-size: var(--profile-value-size);
  font-weight: 650;
}

.activity-item-heading time {
  flex-shrink: 0;

  color: var(--text-muted);

  font-size: var(--profile-secondary-size);
}

.activity-category {
  display: inline-flex;

  align-items: center;

  min-height: 21px;

  padding: 0 7px;

  border-radius: 20px;

  font-size: var(--profile-secondary-size);
  font-weight: 650;
}

.activity-category.green {
  background: var(--green-soft);
  color: var(--green);
}

.activity-category.blue {
  background: var(--primary-soft);
  color: var(--primary);
}

.activity-item-content p {
  margin: 5px 0 0;

  color: var(--text-secondary);

  font-size: var(--profile-description-size);
  line-height: 1.5;
}

/* EMPTY */

.activity-empty {
  display: flex;

  min-height: 200px;

  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 25px;

  text-align: center;
}

.activity-empty-icon {
  display: flex;

  width: 44px;
  height: 44px;

  align-items: center;
  justify-content: center;

  margin-bottom: 9px;

  border-radius: 10px;

  background: var(--purple-soft);
  color: var(--purple);
}

.activity-empty strong {
  color: var(--text-primary);

  font-size: var(--profile-subheading-size);
}

.activity-empty p {
  margin: 4px 0 0;

  color: var(--text-muted);

  font-size: var(--profile-description-size);
}

/* SUMMARY */

.activity-summary {
  padding: 11px 13px;
}

.activity-summary-primary {
  margin-bottom: 6px;
  padding: 13px;

  border-radius: 9px;

  background: var(--primary-soft);
}

.activity-summary-primary span,
.activity-summary-primary strong {
  display: block;
}

.activity-summary-primary span {
  color: var(--primary);

  font-size: var(--profile-label-size);
  font-weight: 600;
}

.activity-summary-primary strong {
  margin-top: 4px;

  color: var(--text-primary);

  font-size: var(--profile-count-size);
  font-weight: 750;
}

.activity-summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding: 10px 0;

  border-bottom:
    1px solid var(--border-soft);
}

.activity-summary-row:last-child {
  border-bottom: 0;
}

.activity-summary-row > div {
  display: flex;
  align-items: center;
  gap: 7px;
}

.activity-summary-row span {
  color: var(--text-secondary);

  font-size: var(--profile-label-size);
}

.activity-summary-row strong {
  color: var(--text-primary);

  font-size: var(--profile-value-size);
}

.summary-dot {
  width: 7px;
  height: 7px;

  border-radius: 50%;
}

.summary-dot.green {
  background: var(--green);
}

.summary-dot.blue {
  background: var(--primary);
}

/* AUDIT */

.audit-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;

  padding: 14px;
}

.audit-info-icon {
  display: flex;

  width: 38px;
  height: 38px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: var(--green-soft);
  color: var(--green);
}

.audit-info strong {
  display: block;

  color: var(--text-primary);

  font-size: var(--profile-value-size);
}

.audit-info p {
  margin: 4px 0 0;

  color: var(--text-secondary);

  font-size: var(--profile-description-size);
  line-height: 1.55;
}

/* ==============================
   RESPONSIVE
============================== */

@media (max-width: 1000px) {
  .quick-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

.overview-layout,
.employment-tab,
.payroll-tab,
.documents-tab,
.activity-tab {
  grid-template-columns: 1fr;
 }

  .schedule-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .document-row {
  grid-template-columns: 1fr;
}

.activity-item-heading {
  flex-direction: column;
  gap: 5px;
}

.activity-toolbar {
  align-items: flex-start;
  flex-direction: column;
}

.document-status {
  justify-self: start;
}

.document-actions {
  justify-self: start;
}

.documents-summary-grid {
  grid-template-columns: 1fr;
}

  .profile-actions {
    width: 100%;
  }

  .quick-grid,
  .details-grid,
  .employment-details-grid,
  .assignment-grid,
  .schedule-grid,
  .compensation-grid,
  .payment-grid {
    grid-template-columns: 1fr;
  }

.overview-layout,
.employment-tab,
.payroll-tab,
.documents-tab {
  grid-template-columns: 1fr;
}

  .name-row h1 {
    font-size: 22px;
  }
}

.compensation-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
