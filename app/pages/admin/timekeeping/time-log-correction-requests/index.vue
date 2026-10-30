
<script setup lang="ts">
import {
  RefreshCw,
  Check,
  X,
  Eye,
  LoaderCircle,
  Clock3,
  CheckCircle2,
  XCircle,
  CalendarDays,
  MoreHorizontal,
} from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const { $api } = useNuxtApp()

interface Correction {
  id: number
  time_log_id: number
  status: 'pending' | 'approved' | 'rejected'
  correction_type: string
  priority: string
  reason: string
  review_remarks: string | null
  created_at: string
  employee?: {
    id: number
    emp_id: string
    firstname: string
    lastname: string
  }
  time_log?: {
    work_date: string
  }
  requested_time_in: string | null
  requested_time_out: string | null
  original_time_in: string | null
  original_time_out: string | null
}

interface ApiListResponse {
  success: boolean
  data: {
    data: Correction[]
    current_page: number
    last_page: number
    total: number
  }
  stats: {
    pending: number
    approved: number
    rejected: number
    this_month: number
  }
}

const loading = ref(false)
const processing = ref(false)
const error = ref('')
const message = ref('')

const statusFilter = ref('pending')
const page = ref(1)
const lastPage = ref(1)
const records = ref<Correction[]>([])

const totalRecords = ref(0)

const showingFrom = computed(() => {
  if (!totalRecords.value || !records.value.length) {
    return 0
  }

  return (page.value - 1) * 15 + 1
})

const showingTo = computed(() => {
  return Math.min(
    showingFrom.value + records.value.length - 1,
    totalRecords.value,
  )
})

const stats = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  this_month: 0,
})

const selected = ref<Correction | null>(null)
const action = ref<'view' | 'approve' | 'reject' | null>(null)
const reviewRemarks = ref('')

// ============================================
// THREE DOTS ACTION MENU
// ============================================

const activeMenuId = ref<number | null>(null)

const menuPosition = ref({
  top: '0px',
  left: '0px',
})

const menuRef = ref<HTMLElement | null>(null)

const closeMenu = () => {
  activeMenuId.value = null
}

const toggleMenu = async (
  event: MouseEvent,
  id: number,
) => {
  if (activeMenuId.value === id) {
    closeMenu()
    return
  }

  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()

  activeMenuId.value = id

  await nextTick()

  const menuWidth = menuRef.value?.offsetWidth ?? 190
  const menuHeight = menuRef.value?.offsetHeight ?? 150
  const gap = 6

  const left = Math.max(
    8,
    Math.min(
      rect.right - menuWidth,
      window.innerWidth - menuWidth - 8,
    ),
  )

  const top =
    window.innerHeight - rect.bottom >= menuHeight + gap
      ? rect.bottom + gap
      : Math.max(
          8,
          rect.top - menuHeight - gap,
        )

  menuPosition.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement

  if (
    target.closest('.correction-menu-trigger') ||
    menuRef.value?.contains(target)
  ) {
    return
  }

  closeMenu()
}

const handleScroll = () => {
  closeMenu()
}

const fetchRecords = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $api<ApiListResponse>(
      '/admin/time-log-corrections',
      {
        query: {
          status: statusFilter.value || undefined,
          page: page.value,
        },
      },
    )

  records.value = response.data.data || []
  lastPage.value = response.data.last_page || 1
  totalRecords.value = response.data.total || 0

    stats.value = response.stats ?? {
      pending: 0,
      approved: 0,
      rejected: 0,
      this_month: 0,
    }
  } catch (err: any) {
    error.value =
      err?.data?.message ||
      err?.message ||
      'Unable to load correction requests.'
  } finally {
    loading.value = false
  }
}

const openAction = (
  item: Correction,
  mode: 'view' | 'approve' | 'reject',
) => {
  closeMenu()

  selected.value = item
  action.value = mode
  reviewRemarks.value = ''
  message.value = ''
  error.value = ''
}

const closeAction = () => {
  if (processing.value) return
  selected.value = null
  action.value = null
}

const submitDecision = async () => {
  if (
    !selected.value ||
    !action.value ||
    action.value === 'view' ||
    processing.value
  ) {
    return
  }

  const requestId = selected.value.id
  const decision = action.value

  processing.value = true
  error.value = ''

  try {
    const response = await $api<{
      success: boolean
      message?: string
    }>(
      `/admin/time-log-corrections/${requestId}/${decision}`,
      {
        method: 'PATCH',
        body: {
          review_remarks: reviewRemarks.value.trim(),
        },
      },
    )

    if (!response.success) {
      throw new Error(
        response.message || 'Unable to review correction request.',
      )
    }

    message.value =
      response.message ||
      (decision === 'approve'
        ? 'Correction approved. Time log updated.'
        : 'Correction request rejected.')

    selected.value = null
    action.value = null

    await fetchRecords()
  } catch (err: any) {
    const validationErrors = err?.data?.errors

    error.value = validationErrors
      ? Object.values(validationErrors)
          .flat()
          .join(' ')
      : err?.data?.message ||
        err?.message ||
        'Unable to review correction request.'
  } finally {
    processing.value = false
  }
}

const closeActionAfterSave = () => {
  selected.value = null
  action.value = null
}

const employeeName = (item: Correction) =>
  [
    item.employee?.firstname,
    item.employee?.lastname,
  ].filter(Boolean).join(' ') || `Employee #${item.employee?.id ?? '—'}`

const formatDate = (date?: string | null) =>
  date ? date.slice(0, 10) : '—'

const formatTime = (date?: string | null) =>
  date ? date.slice(11, 16) : '—'

watch([statusFilter], () => {
  page.value = 1
  fetchRecords()
})

watch(page, fetchRecords)

onMounted(() => {
  fetchRecords()

  document.addEventListener('click', handleOutsideClick)
  window.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', handleScroll)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', handleScroll)
})
</script>

<template>
  <section class="correction-review-page">
    <PageHeader
  title="Time Log Correction Requests"
  description="Review requested attendance adjustments before updating time logs."
>
  <AppButton
    variant="secondary"
    :icon="RefreshCw"
    :disabled="loading"
    @click="fetchRecords"
  >
    Refresh
  </AppButton>
</PageHeader>
    <CorrectionStats :stats="stats" />
    <!-- END DYNAMIC STATISTICS -->
    <div class="review-filters">
      <label>
        Status
        <select v-model="statusFilter">
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All Requests</option>
        </select>
      </label>
    </div>

    <p v-if="message" class="review-success">{{ message }}</p>
    <p v-if="error && !action" class="review-error">{{ error }}</p>

    <BaseDataTable
  title="Correction Requests"
  description="Review employee attendance correction requests and approval status."
  :has-rows="records.length > 0"
  min-width="950px"
  empty-title="No correction requests found"
  empty-description="No records match the selected status."
>
  <template #headers>
    <th>Employee</th>
    <th>Attendance Date</th>
    <th>Correction Type</th>
    <th>Priority</th>
    <th>Status</th>
    <th>Submitted</th>
    <th>Actions</th>
  </template>

  <template #rows>
    <tr
      v-for="item in records"
      :key="item.id"
    >
      <td>
        <div class="employee-info">
          <strong>
            {{ employeeName(item) }}
          </strong>

          <small>
            {{ item.employee?.emp_id || '—' }}
          </small>
        </div>
      </td>

      <td>
        {{ formatDate(item.time_log?.work_date) }}
      </td>

      <td>
        {{ item.correction_type.replaceAll('_', ' ') }}
      </td>

      <td class="capitalize">
        {{ item.priority }}
      </td>

      <td>
        <span
          class="status-pill"
          :class="item.status"
        >
          {{ item.status }}
        </span>
      </td>

      <td>
        {{ formatDate(item.created_at) }}
      </td>

      <td>
        <button
          type="button"
          class="correction-menu-trigger"
          :aria-expanded="activeMenuId === item.id"
          aria-label="Correction request actions"
          @click.stop="toggleMenu($event, item.id)"
        >
          <MoreHorizontal :size="17" />
        </button>
      </td>
    </tr>
  </template>
</BaseDataTable>

    <BaseTableFooter
      v-model="page"
      :showing-from="showingFrom"
      :showing-to="showingTo"
      :total-items="totalRecords"
      :total-pages="lastPage"
      item-label="correction requests"
    />

    <!-- THREE DOTS ACTION DROPDOWN -->
<Teleport to="body">
  <div
    v-if="activeMenuId !== null"
    ref="menuRef"
    class="correction-action-dropdown"
    :style="menuPosition"
    @click.stop
  >
    <template
      v-for="item in records"
      :key="item.id"
    >
      <template v-if="item.id === activeMenuId">
        <button
          type="button"
          @click="openAction(item, 'view')"
        >
          <Eye :size="15" />
          View Request
        </button>

        <template v-if="item.status === 'pending'">
          <div class="correction-menu-divider" />

          <button
            type="button"
            class="menu-approve"
            @click="openAction(item, 'approve')"
          >
            <Check :size="15" />
            Approve Request
          </button>

          <button
            type="button"
            class="menu-reject"
            @click="openAction(item, 'reject')"
          >
            <X :size="15" />
            Reject Request
          </button>
        </template>
      </template>
    </template>
  </div>
</Teleport>

    <Teleport to="body">
      <div
        v-if="selected && action"
        class="review-overlay"
        @click.self="closeAction"
      >
        <div class="review-modal">
          <div class="review-modal-heading">
            <h2>
              {{
                action === 'view'
                  ? 'Correction Request Details'
                  : action === 'approve'
                    ? 'Approve Correction'
                    : 'Reject Correction'
              }}
            </h2>
            <button @click="closeAction"><X :size="18" /></button>
          </div>

          <div class="review-modal-body">
            <p><strong>Employee:</strong> {{ employeeName(selected) }}</p>
            <p><strong>Reason:</strong> {{ selected.reason }}</p>
            <p><strong>Priority:</strong> {{ selected.priority }}</p>
            <p><strong>Status:</strong> {{ selected.status }}</p>
            <p>
              <strong>Original In / Out:</strong>
              {{ formatTime(selected.original_time_in) }} /
              {{ formatTime(selected.original_time_out) }}
            </p>
            <p>
              <strong>Requested In / Out:</strong>
              {{ formatTime(selected.requested_time_in) }} /
              {{ formatTime(selected.requested_time_out) }}
            </p>

            <p v-if="selected.review_remarks">
              <strong>Review Remarks:</strong>
              {{ selected.review_remarks }}
            </p>

            <label v-if="action !== 'view'">
              Review Remarks
              <textarea
                v-model="reviewRemarks"
                rows="4"
                :placeholder="
                  action === 'reject'
                    ? 'Explain why the request is rejected...'
                    : 'Optional approval remarks...'
                "
              />
            </label>

            <p v-if="error" class="review-error">{{ error }}</p>
          </div>

          <div class="review-modal-footer">
            <button @click="closeAction">Cancel</button>

            <button
              v-if="action !== 'view'"
              class="decision-button"
              :disabled="
                processing ||
                (action === 'reject' && reviewRemarks.trim().length < 5)
              "
              @click="submitDecision"
            >
              <LoaderCircle
                v-if="processing"
                :size="15"
                class="spinner"
              />
              {{ processing ? 'Saving...' : `Confirm ${action}` }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.correction-review-page {
  max-width: 1660px;
  margin: 0 auto;
  color: var(--text-primary);
}

.review-heading {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  align-items: center;
  margin-bottom: 18px;
}

.review-heading h1 {
  margin: 0;
  font-size: 23px;
}

.review-heading p {
  color: var(--text-secondary);
  font-size: 11px;
}

.review-button,
.pagination button,
.row-actions button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 11px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 10px;
  cursor: pointer;
}

.review-filters {
  margin-bottom: 14px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
}

.review-filters label {
  display: inline-flex;
  flex-direction: column;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 10px;
}

.review-filters select {
  min-width: 170px;
  padding: 9px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.review-table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
}

.review-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 950px;
}

.review-table th,
.review-table td {
  padding: 13px;
  border-bottom: 1px solid var(--border);
  text-align: left;
  font-size: 10px;
}

.review-table th {
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  text-transform: uppercase;
  font-size: 9px;
}

.review-table small {
  display: block;
  margin-top: 4px;
  color: var(--text-muted);
}

.row-actions {
  display: flex;
  gap: 6px;
}

.row-actions .approve {
  color: var(--green);
}

.row-actions .reject {
  color: var(--red);
}

.status-pill {
  display: inline-block;
  padding: 5px 9px;
  border-radius: 15px;
  background: var(--orange-soft);
  color: var(--orange);
  text-transform: capitalize;
}

.status-pill.approved {
  background: var(--green-soft);
  color: var(--green);
}

.status-pill.rejected {
  background: var(--red-soft);
  color: var(--red);
}

.empty {
  padding: 45px !important;
  text-align: center !important;
  color: var(--text-muted);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 15px;
  font-size: 11px;
}

.pagination button:disabled {
  opacity: .4;
}

.review-error,
.review-success {
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 8px;
  font-size: 11px;
}

.review-error {
  background: var(--red-soft);
  color: var(--red);
}

.review-success {
  background: var(--green-soft);
  color: var(--green);
}
</style>

<style>
.review-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background: rgba(3, 11, 28, .7);
  backdrop-filter: blur(6px);
}

.review-modal {
  width: min(560px, 100%);
  max-height: 90vh;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-primary);
}

.review-modal-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.review-modal-heading h2 {
  margin: 0;
  font-size: 15px;
}

.review-modal-heading button {
  border: 0;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.review-modal-body {
  padding: 17px;
  font-size: 11px;
  line-height: 1.7;
}

.review-modal-body label {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.review-modal-body textarea {
  padding: 11px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.review-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 15px;
  border-top: 1px solid var(--border);
}

.review-modal-footer button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;

  padding: 10px 14px;

  border: 1px solid var(--border);
  border-radius: 7px;

  background: var(--bg-card-soft);
  color: var(--text-primary);

  font-size: 11px;
  font-weight: 600;

  cursor: pointer;
  transition: all 0.2s ease;
}

.review-modal-footer button:hover:not(:disabled) {
  filter: brightness(1.12);
}

.review-modal-footer button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.review-modal-footer .decision-button {
  border: 0;
  background: var(--primary);
  color: #fff;
}

.review-modal-footer button:disabled {
  opacity: .5;
}

.spinner {
  animation: review-spin 1s linear infinite;
}

@keyframes review-spin {
  to { transform: rotate(360deg); }
}

.correction-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.correction-stat-card {
  display: flex;
  align-items: center;
  gap: 13px;
  min-height: 92px;
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 39px;
  height: 39px;
  flex-shrink: 0;
  border-radius: 10px;
}

.stat-icon.pending {
  background: var(--orange-soft);
  color: var(--orange);
}

.stat-icon.approved {
  background: var(--green-soft);
  color: var(--green);
}

.stat-icon.rejected {
  background: var(--purple-soft);
  color: var(--purple);
}

.stat-icon.month {
  background: var(--primary-soft);
  color: var(--primary);
}

.correction-stat-card span,
.correction-stat-card strong,
.correction-stat-card small {
  display: block;
}

.correction-stat-card span {
  color: var(--text-secondary);
  font-size: 10px;
}

.correction-stat-card strong {
  margin: 5px 0;
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 750;
}

.correction-stat-card small {
  color: var(--text-muted);
  font-size: 9px;
}

@media (max-width: 1050px) {
  .correction-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .correction-stats {
    grid-template-columns: 1fr;
  }
}


/* THREE DOTS BUTTON */

.correction-menu-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 30px;
  height: 30px;
  padding: 0;

  border: 1px solid transparent;
  border-radius: 7px;

  background: transparent;
  color: var(--text-secondary);

  box-shadow: none;
  cursor: pointer;

  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

/* Show subtle square only on hover or when menu is open */

.correction-menu-trigger:hover,
.correction-menu-trigger[aria-expanded='true'] {
  border-color: var(--border);
  background: var(--bg-card-soft);
  color: var(--primary);
}

/* Keyboard accessibility */

.correction-menu-trigger:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.correction-menu-trigger:hover {
  background: transparent;
  color: var(--text-primary);
}

.correction-menu-trigger:focus,
.correction-menu-trigger:focus-visible,
.correction-menu-trigger:active {
  border: none;
  outline: none;
  box-shadow: none;
}

.correction-menu-trigger:hover,
.correction-menu-trigger[aria-expanded='true'] {
  background: var(--primary-soft);
  color: var(--primary);
}

/* TELEPORTED DROPDOWN */

.correction-action-dropdown {
  position: fixed;
  z-index: 100000;

  width: 190px;
  padding: 6px;

  border: 1px solid var(--border);
  border-radius: 9px;

  background: var(--bg-card);

  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25);
}

.correction-action-dropdown button {
  display: flex;
  align-items: center;
  gap: 9px;

  width: 100%;
  padding: 10px;

  border: none;
  border-radius: 6px;

  background: transparent;
  color: var(--text-secondary);

  font-size: 10px;
  text-align: left;

  cursor: pointer;
}

.correction-action-dropdown button:hover {
  background: var(--primary-soft);
  color: var(--primary);
}

.correction-action-dropdown .menu-approve {
  color: var(--green);
}

.correction-action-dropdown .menu-reject {
  color: var(--red);
}

.correction-menu-divider {
  height: 1px;
  margin: 5px 0;
  background: var(--border);
}

.employee-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.employee-info strong {
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 650;
}

.employee-info small {
  color: var(--text-muted);
  font-size: 9px;
}

.capitalize {
  text-transform: capitalize;
}

.status-pill {
  display: inline-flex;
  padding: 5px 9px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 650;
  text-transform: capitalize;
}

.status-pill.pending {
  background: var(--orange-soft);
  color: var(--orange);
}

.status-pill.approved {
  background: var(--green-soft);
  color: var(--green);
}

.status-pill.rejected {
  background: var(--red-soft);
  color: var(--red);
}
</style>
