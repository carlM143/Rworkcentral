
<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import {
  Plus, Search, Download, X, Ellipsis,
  Eye, CreditCard, Pencil, Power,
  FileText, CheckCircle2,
} from 'lucide-vue-next'

const props = defineProps<{
  mode: 'transactions' | 'types' | 'employees'
}>()

const {
  types,
  loans,
  transactions,
  employees,
  stats,
  peso,
  typeName,
  addType,
  addLoan,
  recordPayment,
} = useLoansDemo()

// =====================
// FILTERS
// =====================

const search = ref('')
const statusFilter = ref('')
const typeFilter = ref('')

const title = computed(() => {
  if (props.mode === 'transactions') return 'Loan Transactions'
  if (props.mode === 'types') return 'Loan Types'
  return 'Employee Loans'
})

const description = computed(() => {
  if (props.mode === 'transactions')
    return 'Monitor loan disbursements, employee repayments and payroll deductions.'

  if (props.mode === 'types')
    return 'Configure available employee loan categories and their descriptions.'

  return 'Manage employee loan applications, balances and deduction schedules.'
})

const filteredLoans = computed(() =>
  loans.value.filter(loan => {
    const matchesStatus =
      !statusFilter.value || loan.status === statusFilter.value

    const matchesType =
      !typeFilter.value || String(loan.typeId) === typeFilter.value

    const keyword = [
      loan.reference,
      loan.employee,
      loan.employeeId,
      loan.department,
      typeName(loan.typeId),
    ].join(' ').toLowerCase()

    return matchesStatus &&
      matchesType &&
      keyword.includes(search.value.toLowerCase())
  })
)

const filteredTypes = computed(() =>
  types.value.filter(type =>
    [
      type.name,
      type.code,
      type.description,
    ].join(' ').toLowerCase().includes(search.value.toLowerCase())
  )
)

const filteredTransactions = computed(() =>
  transactions.value.filter(transaction => {
    const loan = loans.value.find(l => l.id === transaction.loanId)

    return [
      transaction.reference,
      transaction.type,
      loan?.employee,
      loan?.reference,
    ].join(' ').toLowerCase().includes(search.value.toLowerCase())
  })
)

const recordCount = computed(() => {
  if (props.mode === 'types') return filteredTypes.value.length
  if (props.mode === 'transactions') return filteredTransactions.value.length
  return filteredLoans.value.length
})

const resetFilters = () => {
  search.value = ''
  statusFilter.value = ''
  typeFilter.value = ''
}

// =====================
// MODAL STATE
// =====================

type ModalMode =
  | 'loan-add'
  | 'loan-view'
  | 'type-add'
  | 'type-view'
  | 'type-edit'
  | 'payment'
  | null

const modal = ref<ModalMode>(null)

const selectedLoanId = ref<number | null>(null)
const selectedTypeId = ref<number | null>(null)

const feedback = ref('')

const selectedLoan = computed(() =>
  loans.value.find(loan => loan.id === selectedLoanId.value)
)

const selectedType = computed(() =>
  types.value.find(type => type.id === selectedTypeId.value)
)

const typeForm = ref({
  name: '',
  code: '',
  description: '',
})

const loanForm = ref({
  employeeId: '',
  typeId: 0,
  principal: 0,
  term: 12,
  startDate: '2026-10-28',
  notes: '',
})

const paymentForm = ref({
  loanId: 0,
  amount: 0,
  date: '2026-10-28',
  reference: '',
})

const closeModal = () => {
  modal.value = null
  selectedLoanId.value = null
  selectedTypeId.value = null
  feedback.value = ''
}

const openAddType = () => {
  closeMenu()

  typeForm.value = {
    name: '',
    code: '',
    description: '',
  }

  feedback.value = ''
  modal.value = 'type-add'
}

const openAddLoan = () => {
  closeMenu()

  loanForm.value = {
    employeeId: '',
    typeId: 0,
    principal: 0,
    term: 12,
    startDate: '2026-10-28',
    notes: '',
  }

  feedback.value = ''
  modal.value = 'loan-add'
}

const openLoanDetails = (loan: any) => {
  closeMenu()
  selectedLoanId.value = loan.id
  feedback.value = ''
  modal.value = 'loan-view'
}

const openLoanPayment = (loan?: any) => {
  closeMenu()

  paymentForm.value = {
    loanId: loan?.id ?? 0,
    amount: 0,
    date: '2026-10-28',
    reference: '',
  }

  feedback.value = ''
  modal.value = 'payment'
}

const openTypeDetails = (type: any) => {
  closeMenu()
  selectedTypeId.value = type.id
  feedback.value = ''
  modal.value = 'type-view'
}

const openTypeEdit = (type: any) => {
  closeMenu()
  selectedTypeId.value = type.id

  typeForm.value = {
    name: type.name,
    code: type.code,
    description: type.description,
  }

  feedback.value = ''
  modal.value = 'type-edit'
}

// =====================
// LOAN TYPE OPERATIONS
// =====================

const submitType = () => {
  feedback.value = addType(
    typeForm.value.name.trim(),
    typeForm.value.code.trim().toUpperCase(),
    typeForm.value.description.trim()
  )

  if (!feedback.value) closeModal()
}

const saveEditedType = () => {
  if (!selectedType.value) return

  const name = typeForm.value.name.trim()
  const code = typeForm.value.code.trim().toUpperCase()

  if (!name || !code) {
    feedback.value = 'Loan type name and code are required.'
    return
  }

  const duplicate = types.value.some(type =>
    type.id !== selectedTypeId.value &&
    (
      type.code.toLowerCase() === code.toLowerCase() ||
      type.name.toLowerCase() === name.toLowerCase()
    )
  )

  if (duplicate) {
    feedback.value = 'Loan type name or code already exists.'
    return
  }

  selectedType.value.name = name
  selectedType.value.code = code
  selectedType.value.description = typeForm.value.description.trim()

  closeModal()
}

const toggleTypeStatus = (type: any) => {
  closeMenu()

  const action = type.active ? 'deactivate' : 'activate'

  if (!window.confirm(`Do you want to ${action} ${type.name}?`)) {
    return
  }

  type.active = !type.active
}

// =====================
// EMPLOYEE LOAN OPERATIONS
// =====================

const submitLoan = () => {
  feedback.value = addLoan(loanForm.value)

  if (!feedback.value) closeModal()
}

const submitPayment = () => {
  feedback.value = recordPayment(
    paymentForm.value.loanId,
    paymentForm.value.amount,
    paymentForm.value.date,
    paymentForm.value.reference
  )

  if (!feedback.value) closeModal()
}

// =====================
// THREE DOTS DROPDOWN
// =====================

const menuKey = ref<string | null>(null)
const menuPosition = ref<Record<string, string>>({})

const menuRef = ref<HTMLElement | null>(null)
const menuTrigger = ref<HTMLElement | null>(null)

const closeMenu = () => {
  menuKey.value = null
  menuTrigger.value = null
}

const openActionMenu = async (
  event: MouseEvent,
  key: string,
  count: number
) => {
  if (menuKey.value === key) {
    closeMenu()
    return
  }

  menuTrigger.value = event.currentTarget as HTMLElement
  menuKey.value = key

  await nextTick()

  const rect = menuTrigger.value?.getBoundingClientRect()
  if (!rect) return

  const menuWidth = 205
  const menuHeight = count * 39 + 12

  const left = Math.max(
    8,
    Math.min(
      rect.right - menuWidth,
      window.innerWidth - menuWidth - 8
    )
  )

  const showAbove =
    window.innerHeight - rect.bottom < menuHeight + 12

  const top = showAbove
    ? Math.max(8, rect.top - menuHeight - 6)
    : rect.bottom + 6

  // The menu teleports to body to avoid table overflow clipping.
  // Carry the active admin theme colors along with it.
  const workspace = document.querySelector<HTMLElement>('.loan-workspace')
  const theme = workspace ? getComputedStyle(workspace) : null
  const cssVar = (name: string, fallback: string) =>
    theme?.getPropertyValue(name).trim() || fallback

  menuPosition.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    zIndex: '100000',
    '--loan-menu-bg': cssVar('--bg-card', '#141f30'),
    '--loan-menu-text': cssVar('--text-primary', '#e7eefb'),
    '--loan-menu-border': cssVar('--border', '#2a3a54'),
    '--loan-menu-primary': cssVar('--primary', '#3b82f6'),
    '--loan-menu-hover': cssVar('--primary-soft', 'rgba(59,130,246,.14)'),
  }
}

const onOutsideClick = (event: PointerEvent) => {
  const target = event.target as Node

  if (
    !menuRef.value?.contains(target) &&
    !menuTrigger.value?.contains(target)
  ) {
    closeMenu()
  }
}

const onScroll = () => {
  if (menuKey.value) closeMenu()
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeMenu()
    if (modal.value) closeModal()
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onOutsideClick)
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('scroll', onScroll, true)
  window.addEventListener('resize', closeMenu)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onOutsideClick)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('scroll', onScroll, true)
  window.removeEventListener('resize', closeMenu)
})

// =====================
// CSV EXPORT
// =====================

const exportCsv = () => {
  const rows: (string | number)[][] = []

  if (props.mode === 'types') {
    rows.push(['Code', 'Name', 'Description', 'Status'])

    filteredTypes.value.forEach(type => {
      rows.push([
        type.code,
        type.name,
        type.description,
        type.active ? 'Active' : 'Inactive',
      ])
    })
  } else if (props.mode === 'employees') {
    rows.push([
      'Reference',
      'Employee',
      'Department',
      'Type',
      'Principal',
      'Balance',
      'Deduction/Cutoff',
      'Status',
    ])

    filteredLoans.value.forEach(loan => {
      rows.push([
        loan.reference,
        loan.employee,
        loan.department,
        typeName(loan.typeId),
        loan.principal,
        loan.balance,
        loan.deduction,
        loan.status,
      ])
    })
  } else {
    rows.push([
      'Reference',
      'Employee',
      'Date',
      'Transaction',
      'Amount',
      'Loan',
    ])

    filteredTransactions.value.forEach(transaction => {
      const loan = loans.value.find(l => l.id === transaction.loanId)

      rows.push([
        transaction.reference,
        loan?.employee ?? '',
        transaction.date,
        transaction.type,
        transaction.amount,
        loan?.reference ?? '',
      ])
    })
  }

  const csv = rows.map(row =>
    row.map(value =>
      `"${String(value).replace(/"/g, '""')}"`
    ).join(',')
  ).join('\r\n')

  const blob = new Blob(
    ['\uFEFF', csv],
    { type: 'text/csv;charset=utf-8' }
  )

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = `rworkcentral-${props.mode}-demo.csv`
  anchor.click()

  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="loan-workspace">

    <!-- HEADER -->
    <header class="loan-header">
      <div>
        <p class="eyebrow">
          PAYROLL OPERATIONS
          <span>FRONTEND DEMO</span>
        </p>

        <h1>{{ title }}</h1>
        <p class="description">{{ description }}</p>
      </div>

      <div class="top-actions">
        <button
          type="button"
          class="secondary"
          @click="exportCsv"
        >
          <Download :size="15" />
          Export CSV
        </button>

        <button
          v-if="mode === 'types'"
          type="button"
          class="primary"
          @click="openAddType"
        >
          <Plus :size="15" />
          Add Loan Type
        </button>

        <button
          v-if="mode === 'employees'"
          type="button"
          class="primary"
          @click="openAddLoan"
        >
          <Plus :size="15" />
          Add Loan
        </button>

        <button
          v-if="mode === 'transactions'"
          type="button"
          class="primary"
          @click="openLoanPayment()"
        >
          <CreditCard :size="15" />
          Record Payment
        </button>
      </div>
    </header>

    <!-- STATS -->
    <div class="stats-grid">
      <div class="stat">
        <span>Total Loans</span>
        <strong>{{ stats.total }}</strong>
        <small>Registered loan records</small>
      </div>

      <div class="stat">
        <span>Active Loans</span>
        <strong>{{ stats.active }}</strong>
        <small>With remaining balances</small>
      </div>

      <div class="stat">
        <span>Outstanding Balance</span>
        <strong>{{ peso(stats.outstanding) }}</strong>
        <small>All outstanding loans</small>
      </div>

      <div class="stat">
        <span>Paid Loans</span>
        <strong>{{ stats.paid }}</strong>
        <small>Fully settled</small>
      </div>
    </div>

    <!-- FILTERS -->
    <div class="filter-bar">
      
<div class="search-field">
  <Search :size="17" class="search-icon" />

  <input
    v-model="search"
    type="text"
    class="search-input"
    :placeholder="
      mode === 'types'
        ? 'Search loan types...'
        : 'Search employee, loan or reference...'
    "
  />
</div>

      <select
        v-if="mode === 'employees'"
        v-model="typeFilter"
      >
        <option value="">All Loan Types</option>

        <option
          v-for="type in types"
          :key="type.id"
          :value="String(type.id)"
        >
          {{ type.name }}
        </option>
      </select>

      <select
        v-if="mode === 'employees'"
        v-model="statusFilter"
      >
        <option value="">All Statuses</option>

        <option
          v-for="status in ['Pending', 'Active', 'Paid', 'Rejected']"
          :key="status"
        >
          {{ status }}
        </option>
      </select>

      <button
        type="button"
        class="secondary"
        @click="resetFilters"
      >
        Reset
      </button>
    </div>

    <!-- TABLE -->
    <div class="table-card">
      <div class="table-heading">
        <div>
          <strong>
            {{
              mode === 'transactions'
                ? 'Loan Transaction History'
                : mode === 'types'
                  ? 'Loan Type Directory'
                  : 'Employee Loan Directory'
            }}
          </strong>

          <p>
            {{
              mode === 'transactions'
                ? 'Sample ledger entries; no payroll integration yet'
                : 'Frontend demonstration records'
            }}
          </p>
        </div>

        <small>{{ recordCount }} records</small>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr v-if="mode === 'employees'">
              <th>LOAN NO.</th>
              <th>EMPLOYEE</th>
              <th>LOAN TYPE</th>
              <th>PRINCIPAL</th>
              <th>DEDUCTION / CUTOFF</th>
              <th>BALANCE</th>
              <th>STATUS</th>
              <th class="actions-heading">ACTIONS</th>
            </tr>

            <tr v-else-if="mode === 'types'">
              <th>CODE</th>
              <th>LOAN TYPE</th>
              <th>DESCRIPTION</th>
              <th>STATUS</th>
              <th class="actions-heading">ACTIONS</th>
            </tr>

            <tr v-else>
              <th>TRANSACTION REF.</th>
              <th>EMPLOYEE / LOAN</th>
              <th>DATE</th>
              <th>TRANSACTION TYPE</th>
              <th>AMOUNT</th>
            </tr>
          </thead>

          <!-- EMPLOYEE LOANS -->
          <tbody v-if="mode === 'employees'">
            <tr
              v-for="loan in filteredLoans"
              :key="loan.id"
            >
              <td class="link">{{ loan.reference }}</td>

              <td>
                <b>{{ loan.employee }}</b>
                <small>{{ loan.employeeId }} · {{ loan.department }}</small>
              </td>

              <td>{{ typeName(loan.typeId) }}</td>
              <td>{{ peso(loan.principal) }}</td>
              <td>{{ peso(loan.deduction) }}</td>
              <td><b>{{ peso(loan.balance) }}</b></td>

              <td>
                <span
                  class="pill"
                  :class="loan.status.toLowerCase()"
                >
                  {{ loan.status }}
                </span>
              </td>

              <td class="action-cell">
                <button
                  type="button"
                  class="dots"
                   @pointerdown.stop
                  aria-label="Employee loan actions"
                  :aria-expanded="menuKey === `loan-${loan.id}`"
                  @click="openActionMenu(
                    $event,
                    `loan-${loan.id}`,
                    loan.status === 'Active' ? 2 : 1
                  )"
                >
                  <Ellipsis :size="18" />
                </button>

                <Teleport to="body">
                  <div
                    v-if="menuKey === `loan-${loan.id}`"
                    ref="menuRef"
                    class="loan-action-dropdown"
                     @pointerdown.stop
                    :style="menuPosition"
                    role="menu"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      @click="openLoanDetails(loan)"
                    >
                      <Eye :size="15" />
                      View Loan Details
                    </button>

                    <button
                      v-if="loan.status === 'Active'"
                      type="button"
                      role="menuitem"
                      @click="openLoanPayment(loan)"
                    >
                      <CreditCard :size="15" />
                      Record Payment
                    </button>
                  </div>
                </Teleport>
              </td>
            </tr>
          </tbody>

          <!-- LOAN TYPES -->
          <tbody v-else-if="mode === 'types'">
            <tr
              v-for="type in filteredTypes"
              :key="type.id"
            >
              <td class="link">{{ type.code }}</td>
              <td><b>{{ type.name }}</b></td>
              <td>{{ type.description }}</td>

              <td>
                <span
                  class="pill"
                  :class="type.active ? 'active' : 'rejected'"
                >
                  {{ type.active ? 'Active' : 'Inactive' }}
                </span>
              </td>

              <td class="action-cell">
                <button
                  type="button"
                  class="dots"
                   @pointerdown.stop
                  aria-label="Loan type actions"
                  :aria-expanded="menuKey === `type-${type.id}`"
                  @click="openActionMenu(
                    $event,
                    `type-${type.id}`,
                    3
                  )"
                >
                  <Ellipsis :size="18" />
                </button>

                <Teleport to="body">
                  <div
                    v-if="menuKey === `type-${type.id}`"
                    ref="menuRef"
                    class="loan-action-dropdown"
                     @pointerdown.stop
                    :style="menuPosition"
                    role="menu"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      @click="openTypeDetails(type)"
                    >
                      <Eye :size="15" />
                      View Details
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      @click="openTypeEdit(type)"
                    >
                      <Pencil :size="15" />
                      Edit Loan Type
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      :class="{ 'danger-action': type.active }"
                      @click="toggleTypeStatus(type)"
                    >
                      <Power :size="15" />
                      {{ type.active ? 'Deactivate' : 'Activate' }}
                    </button>
                  </div>
                </Teleport>
              </td>
            </tr>
          </tbody>

          <!-- TRANSACTIONS -->
          <tbody v-else>
            <tr
              v-for="transaction in filteredTransactions"
              :key="transaction.id"
            >
              <td class="link">{{ transaction.reference }}</td>

              <td>
                <b>
                  {{
                    loans.find(
                      loan => loan.id === transaction.loanId
                    )?.employee
                  }}
                </b>

                <small>
                  {{
                    loans.find(
                      loan => loan.id === transaction.loanId
                    )?.reference
                  }}
                </small>
              </td>

              <td>{{ transaction.date }}</td>
              <td>{{ transaction.type }}</td>
              <td><b>{{ peso(transaction.amount) }}</b></td>
            </tr>
          </tbody>
        </table>

        <div v-if="recordCount === 0" class="empty-state">
          <FileText :size="28" />
          <strong>No records found</strong>
          <p>Try changing your filters or search keyword.</p>
        </div>
      </div>
    </div>

    <!-- MODALS -->
    <Teleport to=".loan-workspace">
      <div
        v-if="modal"
        class="loan-overlay"
        @click.self="closeModal"
      >
        <section
          class="loan-dialog"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <div class="dialog-header">
            <div>
              <h2>
                {{
                  modal === 'type-add'
                    ? 'Add Loan Type'
                    : modal === 'type-edit'
                      ? 'Edit Loan Type'
                      : modal === 'type-view'
                        ? 'Loan Type Details'
                        : modal === 'loan-add'
                          ? 'Add Employee Loan'
                          : modal === 'payment'
                            ? 'Record Loan Payment'
                            : 'Employee Loan Details'
                }}
              </h2>

              <p>RWorkCentral frontend demonstration</p>
            </div>

            <button
              type="button"
              class="close"
              aria-label="Close modal"
              @click="closeModal"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- ADD / EDIT LOAN TYPE -->
          <form
            v-if="modal === 'type-add' || modal === 'type-edit'"
            @submit.prevent="
              modal === 'type-add'
                ? submitType()
                : saveEditedType()
            "
          >
            <div class="dialog-body">
              <label>
                Loan Type Name
                <input
                  v-model="typeForm.name"
                  required
                  placeholder="Example: Emergency Loan"
                />
              </label>

              <label>
                Type Code
                <input
                  v-model="typeForm.code"
                  required
                  placeholder="Example: EMERG"
                />
              </label>

              <label>
                Description
                <textarea
                  v-model="typeForm.description"
                  rows="3"
                  placeholder="Description of this loan category"
                />
              </label>
            </div>

            <p v-if="feedback" class="error">{{ feedback }}</p>

            <div class="dialog-footer">
              <button
                type="button"
                class="secondary"
                @click="closeModal"
              >
                Cancel
              </button>

              <button type="submit" class="primary">
                <CheckCircle2 :size="15" />
                {{ modal === 'type-add' ? 'Save Loan Type' : 'Save Changes' }}
              </button>
            </div>
          </form>

          <!-- VIEW LOAN TYPE -->
          <div v-else-if="modal === 'type-view' && selectedType">
            <div class="dialog-body">
              <div class="detail-grid">
                <div class="detail-item">
                  <span>Loan Type</span>
                  <strong>{{ selectedType.name }}</strong>
                </div>

                <div class="detail-item">
                  <span>Code</span>
                  <strong>{{ selectedType.code }}</strong>
                </div>

                <div class="detail-item">
                  <span>Status</span>
                  <span
                    class="pill"
                    :class="selectedType.active ? 'active' : 'rejected'"
                  >
                    {{ selectedType.active ? 'Active' : 'Inactive' }}
                  </span>
                </div>

                <div class="detail-item">
                  <span>Assigned Loans</span>
                  <strong>
                    {{
                      loans.filter(
                        loan => loan.typeId === selectedTypeId
                      ).length
                    }}
                  </strong>
                </div>

                <div class="detail-item full">
                  <span>Description</span>
                  <strong>
                    {{ selectedType.description || 'No description' }}
                  </strong>
                </div>
              </div>
            </div>

            <div class="dialog-footer">
              <button
                type="button"
                class="secondary"
                @click="closeModal"
              >
                Close
              </button>

              <button
                type="button"
                class="primary"
                @click="openTypeEdit(selectedType)"
              >
                <Pencil :size="15" />
                Edit Loan Type
              </button>
            </div>
          </div>

          <!-- ADD EMPLOYEE LOAN -->
          <form
            v-else-if="modal === 'loan-add'"
            @submit.prevent="submitLoan"
          >
            <div class="dialog-body">
              <label>
                Employee
                <select v-model="loanForm.employeeId" required>
                  <option value="">Select employee</option>

                  <option
                    v-for="employee in employees"
                    :key="employee.id"
                    :value="employee.id"
                  >
                    {{ employee.name }} ({{ employee.id }})
                  </option>
                </select>
              </label>

              <label>
                Loan Type
                <select v-model.number="loanForm.typeId" required>
                  <option :value="0" disabled>
                    Select loan type
                  </option>

                  <option
                    v-for="type in types.filter(item => item.active)"
                    :key="type.id"
                    :value="type.id"
                  >
                    {{ type.name }}
                  </option>
                </select>
              </label>

              <div class="two">
                <label>
                  Principal Amount (₱)
                  <input
                    v-model.number="loanForm.principal"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </label>

                <label>
                  Number of Cutoffs
                  <input
                    v-model.number="loanForm.term"
                    type="number"
                    min="1"
                    step="1"
                    required
                  />
                </label>
              </div>

              <label>
                Start Date
                <input
                  v-model="loanForm.startDate"
                  type="date"
                  required
                />
              </label>

              <p class="preview">
                Estimated deduction per cutoff:
                <strong>
                  {{
                    peso(
                      loanForm.principal > 0 && loanForm.term > 0
                        ? loanForm.principal / loanForm.term
                        : 0
                    )
                  }}
                </strong>
                (no interest)
              </p>

              <label>
                Remarks
                <textarea
                  v-model="loanForm.notes"
                  rows="2"
                />
              </label>
            </div>

            <p v-if="feedback" class="error">{{ feedback }}</p>

            <div class="dialog-footer">
              <button
                type="button"
                class="secondary"
                @click="closeModal"
              >
                Cancel
              </button>

              <button type="submit" class="primary">
                Add Loan (Pending)
              </button>
            </div>
          </form>

          <!-- RECORD PAYMENT -->
          <form
            v-else-if="modal === 'payment'"
            @submit.prevent="submitPayment"
          >
            <div class="dialog-body">
              <label>
                Active Loan
                <select
                  v-model.number="paymentForm.loanId"
                  required
                >
                  <option :value="0" disabled>Select loan</option>

                  <option
                    v-for="loan in loans.filter(item => item.status === 'Active')"
                    :key="loan.id"
                    :value="loan.id"
                  >
                    {{ loan.reference }} —
                    {{ loan.employee }} ({{ peso(loan.balance) }})
                  </option>
                </select>
              </label>

              <label>
                Payment Amount (₱)
                <input
                  v-model.number="paymentForm.amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                />
              </label>

              <label>
                Date
                <input
                  v-model="paymentForm.date"
                  type="date"
                  required
                />
              </label>

              <label>
                Receipt / Reference
                <input
                  v-model="paymentForm.reference"
                  required
                  placeholder="Example: OR-0101"
                />
              </label>
            </div>

            <p v-if="feedback" class="error">{{ feedback }}</p>

            <div class="dialog-footer">
              <button
                type="button"
                class="secondary"
                @click="closeModal"
              >
                Cancel
              </button>

              <button type="submit" class="primary">
                Save Demo Payment
              </button>
            </div>
          </form>

          <!-- VIEW EMPLOYEE LOAN -->
          <div v-else-if="modal === 'loan-view' && selectedLoan">
            <div class="dialog-body">
              <div class="detail-grid">
                <div class="detail-item">
                  <span>Loan Number</span>
                  <strong>{{ selectedLoan.reference }}</strong>
                </div>

                <div class="detail-item">
                  <span>Employee</span>
                  <strong>{{ selectedLoan.employee }}</strong>
                </div>

                <div class="detail-item">
                  <span>Loan Type</span>
                  <strong>{{ typeName(selectedLoan.typeId) }}</strong>
                </div>

                <div class="detail-item">
                  <span>Status</span>
                  <span
                    class="pill"
                    :class="selectedLoan.status.toLowerCase()"
                  >
                    {{ selectedLoan.status }}
                  </span>
                </div>

                <div class="detail-item">
                  <span>Principal</span>
                  <strong>{{ peso(selectedLoan.principal) }}</strong>
                </div>

                <div class="detail-item">
                  <span>Remaining Balance</span>
                  <strong>{{ peso(selectedLoan.balance) }}</strong>
                </div>

                <div class="detail-item">
                  <span>Deduction / Cutoff</span>
                  <strong>{{ peso(selectedLoan.deduction) }}</strong>
                </div>

                <div class="detail-item">
                  <span>Department</span>
                  <strong>{{ selectedLoan.department }}</strong>
                </div>

                <div class="detail-item full">
                  <span>Remarks</span>
                  <strong>{{ selectedLoan.notes || 'None' }}</strong>
                </div>
              </div>
            </div>

            <div class="dialog-footer">
              <button
                type="button"
                class="secondary"
                @click="closeModal"
              >
                Close
              </button>

              <button
                v-if="selectedLoan.status === 'Active'"
                type="button"
                class="primary"
                @click="openLoanPayment(selectedLoan)"
              >
                <CreditCard :size="15" />
                Record Payment
              </button>
            </div>
          </div>
        </section>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
/* Loans workspace: styles inherit active RWorkCentral light/dark variables. */
.loan-workspace { max-width:1660px; margin:0 auto; color:var(--text-primary); font-size:12px; }
.loan-header { display:flex; align-items:center; justify-content:space-between; gap:18px; margin:6px 0 22px; }
.eyebrow { margin:0; color:var(--text-secondary); font-size:10px; font-weight:700; letter-spacing:1px; }
.eyebrow span { color:#f59e0b; margin-left:8px; }
.loan-header h1 { margin:8px 0; font-size:25px; color:var(--text-primary); }
.description,.table-heading p { color:var(--text-secondary); }
.top-actions { display:flex; gap:8px; flex-wrap:wrap; }
.loan-workspace button { font:inherit; cursor:pointer; }
.primary,.secondary { display:inline-flex; align-items:center; justify-content:center; gap:7px; min-height:38px; padding:10px 14px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-primary); font-weight:700; }
.primary { background:var(--primary); border-color:var(--primary); color:#fff; }
.primary:hover { filter:brightness(1.08); }
.secondary:hover { border-color:var(--primary); color:var(--primary); }
.stats-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; margin-bottom:14px; }
.stat { display:flex; flex-direction:column; gap:7px; padding:17px; border:1px solid var(--border); border-radius:12px; background:var(--bg-card); }
.stat span,.stat small { font-size:11px; color:var(--text-secondary); }
.stat strong { font-size:22px; color:var(--text-primary); }
.filter-bar { display:flex; align-items:center; gap:9px; padding:10px; margin-bottom:13px; border:1px solid var(--border); border-radius:10px; background:var(--bg-card); }
.search-field { display:flex; align-items:center; flex:1; min-width:0; min-height:42px; gap:10px; padding:0 12px; background:var(--bg-card); border:1px solid var(--border); border-radius:8px; }
.search-field:focus-within { border-color:var(--primary); }
.search-icon { flex-shrink:0; color:var(--text-muted); }
.loan-workspace .search-field .search-input { flex:1; width:100%; min-width:0; height:40px; padding:0; background:transparent; border:0; border-radius:0; outline:0; box-shadow:none; color:var(--text-primary); font-size:12px; }
.loan-workspace .search-field .search-input:focus { border:0; outline:0; box-shadow:none; }
.search-input::placeholder { color:var(--text-muted); opacity:1; }
.filter-bar select { width:180px; }
.loan-workspace select,.loan-workspace input,.loan-workspace textarea { padding:10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-primary); outline:none; }
.loan-workspace :is(select,input,textarea):focus { border-color:var(--primary); }
.table-card { overflow:hidden; border:1px solid var(--border); border-radius:12px; background:var(--bg-card); }
.table-heading { display:flex; align-items:center; justify-content:space-between; padding:16px; }
.table-heading p { font-size:11px; margin:6px 0 0; }
.table-heading small { color:var(--text-muted); }
.table-scroll { overflow-x:auto; }
.loan-workspace table { width:100%; min-width:850px; border-collapse:collapse; text-align:left; }
.loan-workspace th { padding:13px 16px; background:var(--bg-card-soft,var(--bg-card)); color:var(--text-secondary); font-size:10px; white-space:nowrap; }
.loan-workspace td { padding:16px; border-top:1px solid var(--border); color:var(--text-primary); }
.loan-workspace td small { display:block; margin-top:5px; color:var(--text-muted); }
.loan-workspace td b { font-weight:650; color:var(--text-primary); }
.link { color:var(--primary); font-weight:700; }
.pill { display:inline-block; padding:6px 9px; border-radius:20px; background:rgba(245,158,11,.14); color:#d97706; font-size:11px; font-weight:700; }
.pill.active,.pill.paid { background:rgba(16,185,129,.14); color:#059669; }
.pill.rejected { background:rgba(239,68,68,.14); color:#dc2626; }
.action-cell,.actions-heading { width:90px; text-align:center; }
.dots { display:inline-flex; align-items:center; justify-content:center; width:33px; height:33px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-secondary); transition:all .15s; }
.dots:hover,.dots[aria-expanded="true"] { background:var(--primary-soft,rgba(37,99,235,.12)); border-color:var(--primary); color:var(--primary); }
.empty-state { display:flex; flex-direction:column; align-items:center; gap:8px; padding:40px; color:var(--text-muted); }
.empty-state strong { color:var(--text-primary); }
.empty-state p { margin:0; }
.two { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
.preview { margin:0; padding:12px; border:1px solid var(--border); border-radius:9px; background:var(--bg-card-soft,var(--bg-card)); color:var(--text-secondary); }
.preview strong { color:var(--text-primary); }
.error { margin:0; padding:0 24px 14px; color:#ef4444; }

/* Menus and dialogs teleport into .loan-workspace so they inherit theme variables. */
/* Teleported action menus need GLOBAL selectors (not scoped descendants). */
:global(.loan-action-dropdown) {
  position: fixed;
  display: block;
  width: 205px;
  padding: 6px;
  box-sizing: border-box;
  background: var(--loan-menu-bg, #141f30);
  color: var(--loan-menu-text, #e7eefb);
  border: 1px solid var(--loan-menu-border, #2a3a54);
  border-radius: 10px;
  box-shadow: 0 16px 44px rgba(0,0,0,.26);
  z-index: 100000;
}
:global(.loan-action-dropdown button) {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 12px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--loan-menu-text, #e7eefb);
  font-size: 11px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
}
:global(.loan-action-dropdown button:hover),
:global(.loan-action-dropdown button:focus-visible) {
  background: var(--loan-menu-hover, rgba(59,130,246,.14));
  color: var(--loan-menu-primary, #3b82f6);
  outline: none;
}
:global(.loan-action-dropdown button.danger-action:hover) {
  background: rgba(239,68,68,.12);
  color: #ef4444;
}
:global(.loan-action-dropdown button svg) { flex-shrink: 0; }
.loan-overlay { position:fixed; inset:0; z-index:100001; display:flex; justify-content:center; align-items:center; padding:20px; box-sizing:border-box; background:rgba(3,9,23,.72); backdrop-filter:blur(3px); }
.loan-dialog { display:block; width:100%; max-width:620px; max-height:88vh; overflow-y:auto; box-sizing:border-box; border:1px solid var(--border); border-radius:14px; background:var(--bg-card); color:var(--text-primary); box-shadow:0 24px 75px rgba(0,0,0,.32); font-size:12px; line-height:1.5; }
.loan-dialog * { box-sizing:border-box; }
.loan-dialog .dialog-header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; padding:20px 24px; border-bottom:1px solid var(--border); }
.loan-dialog .dialog-header h2 { margin:0; color:var(--text-primary); font-size:18px; font-weight:750; }
.loan-dialog .dialog-header p { margin:5px 0 0; color:var(--text-secondary); font-size:11px; }
.loan-dialog .close { display:inline-flex; align-items:center; justify-content:center; width:33px; height:33px; padding:0; flex-shrink:0; border:1px solid var(--border); border-radius:8px; background:var(--bg-card-soft,var(--bg-card)); color:var(--text-secondary); }
.loan-dialog .close:hover { background:var(--primary-soft,rgba(37,99,235,.12)); color:var(--primary); }
.loan-dialog .dialog-body { display:grid; grid-template-columns:minmax(0,1fr); gap:17px; padding:24px; }
.loan-dialog label { display:flex; flex-direction:column; gap:7px; min-width:0; color:var(--text-primary); font-size:12px; font-weight:650; }
.loan-dialog input,.loan-dialog select,.loan-dialog textarea { display:block; width:100%; min-width:0; min-height:42px; margin:0; padding:10px 12px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-primary); font:inherit; font-weight:400; outline:0; }
.loan-dialog textarea { min-height:92px; resize:vertical; }
.loan-dialog input:focus,.loan-dialog select:focus,.loan-dialog textarea:focus { border-color:var(--primary); }
.loan-dialog :is(input,textarea)::placeholder { color:var(--text-muted); }
.loan-dialog .two { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
.loan-dialog .preview { padding:13px 15px; background:var(--bg-card-soft,var(--bg-card)); }
.loan-dialog .dialog-footer { display:flex; align-items:center; justify-content:flex-end; gap:10px; padding:16px 24px; border-top:1px solid var(--border); }
.loan-dialog .primary,.loan-dialog .secondary { min-height:38px; padding:10px 15px; font-size:12px; }
.loan-dialog .detail-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
.loan-dialog .detail-item { display:flex; flex-direction:column; align-items:flex-start; gap:7px; min-width:0; padding:14px; border:1px solid var(--border); border-radius:9px; background:var(--bg-card-soft,var(--bg-card)); }
.loan-dialog .detail-item > span:first-child { color:var(--text-secondary); font-size:11px; }
.loan-dialog .detail-item strong { color:var(--text-primary); font-size:12px; overflow-wrap:anywhere; }
.loan-dialog .detail-item.full { grid-column:1 / -1; }
@media (max-width:950px) { .stats-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media (max-width:650px) { .loan-header { align-items:flex-start; flex-direction:column; } .stats-grid { grid-template-columns:1fr; } .filter-bar { flex-wrap:wrap; } .search-field { flex-basis:100%; } .filter-bar select { flex:1; min-width:130px; } .loan-overlay { padding:12px; } .loan-dialog { max-height:92vh; } .loan-dialog .dialog-header,.loan-dialog .dialog-body,.loan-dialog .dialog-footer { padding:16px; } .loan-dialog .two,.loan-dialog .detail-grid { grid-template-columns:1fr; } .loan-dialog .dialog-footer { flex-wrap:wrap; } }
</style>
