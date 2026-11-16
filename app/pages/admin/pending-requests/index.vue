<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ArrowRight, ChevronDown, Inbox, RefreshCw, Search } from 'lucide-vue-next'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import BaseTableFooter from '~/components/shared-table/BaseTableFooter.vue'
import {
  PENDING_TYPE_STYLE,
  usePendingRequests,
  waitingLabel,
  type PendingListResponse,
  type PendingRequestItem,
  type PendingRequestType,
} from '~/composables/admin/dashboard/usePendingRequests'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()
const { summary, summaryLoading, getSummary, list } = usePendingRequests()

// =====================================================
// FILTERS (sent to the backend)
// =====================================================

const typeFilter = ref<PendingRequestType | ''>(
  typeof route.query.type === 'string' ? (route.query.type as PendingRequestType) : '',
)
const searchQuery = ref('')
const departmentFilter = ref<number | ''>('')
const sort = ref<'oldest' | 'newest'>('oldest')
const currentPage = ref(1)
const perPage = 15

// =====================================================
// DATA
// =====================================================

const items = ref<PendingRequestItem[]>([])
const meta = ref<PendingListResponse['meta']>({ current_page: 1, last_page: 1, per_page: perPage, total: 0, from: 0, to: 0 })
const departments = ref<PendingListResponse['departments']>([])
const loading = ref(false)
const loadError = ref('')
let requestId = 0

const load = async () => {
  const id = ++requestId
  loading.value = true
  loadError.value = ''
  try {
    const response = await list({
      type: typeFilter.value,
      search: searchQuery.value.trim(),
      department_id: departmentFilter.value === '' ? null : departmentFilter.value,
      sort: sort.value,
      page: currentPage.value,
      per_page: perPage,
    })
    if (id !== requestId) return
    items.value = response.data
    meta.value = response.meta
    departments.value = response.departments
  } catch {
    if (id === requestId) loadError.value = 'Unable to load pending requests.'
  } finally {
    if (id === requestId) loading.value = false
  }
}

const refresh = () => Promise.all([getSummary(), load()])

onMounted(refresh)

let searchTimer: ReturnType<typeof setTimeout> | undefined

watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (currentPage.value !== 1) currentPage.value = 1
    else load()
  }, 350)
})

watch([typeFilter, departmentFilter, sort], () => {
  router.replace({ query: typeFilter.value ? { type: typeFilter.value } : {} })
  if (currentPage.value !== 1) currentPage.value = 1
  else load()
})

watch(currentPage, load)

const resetFilters = () => {
  typeFilter.value = ''
  searchQuery.value = ''
  departmentFilter.value = ''
  sort.value = 'oldest'
}

// =====================================================
// TYPE CHIPS
// =====================================================

const chips = computed(() => [
  { type: '' as const, label: 'All', count: summary.value?.total ?? 0 },
  ...(summary.value?.types ?? []).map(t => ({ type: t.type, label: t.label, count: t.count })),
])

const waitingTone = (days: number) => (days >= 7 ? 'danger' : days >= 3 ? 'warn' : '')

const filedLabel = (iso: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso))

const review = (item: PendingRequestItem) => {
  router.push(item.url)
}
</script>

<template>
  <section class="pending-page">
    <PageHeader
      title="Pending Requests"
      description="Every request waiting for a decision. Open one to approve or reject it on its module page."
    >
      <AppButton variant="secondary" :icon="RefreshCw" :disabled="loading" @click="refresh">
        Refresh
      </AppButton>
    </PageHeader>

    <!-- TYPE CHIPS -->
    <nav class="type-chips" aria-label="Filter by request type">
      <button
        v-for="chip in chips"
        :key="chip.type || 'all'"
        type="button"
        class="chip"
        :class="[{ active: typeFilter === chip.type }, chip.type ? `tone-${PENDING_TYPE_STYLE[chip.type].color}` : '']"
        :aria-pressed="typeFilter === chip.type"
        @click="typeFilter = chip.type"
      >
        <component :is="PENDING_TYPE_STYLE[chip.type].icon" v-if="chip.type" :size="14" />
        {{ chip.label }}
        <span class="chip-count">{{ summaryLoading && !summary ? '…' : chip.count }}</span>
      </button>
    </nav>

    <!-- FILTERS -->
    <div class="filters-row">
      <div class="search-box">
        <Search :size="15" />
        <input v-model="searchQuery" type="text" placeholder="Search employee, employee no., request no. or details..." aria-label="Search pending requests">
      </div>

      <div class="select-wrap">
        <select v-model="departmentFilter" aria-label="Department">
          <option value="">All Departments</option>
          <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
        </select>
        <ChevronDown :size="14" class="select-icon" />
      </div>

      <div class="select-wrap">
        <select v-model="sort" aria-label="Sort">
          <option value="oldest">Oldest first</option>
          <option value="newest">Newest first</option>
        </select>
        <ChevronDown :size="14" class="select-icon" />
      </div>

      <button type="button" class="reset-btn" @click="resetFilters">Reset</button>
    </div>

    <p v-if="loadError" class="load-error" role="alert">
      {{ loadError }}
      <button type="button" @click="load">Retry</button>
    </p>

    <!-- TABLE -->
    <BaseDataTable
      title="Waiting for Approval"
      description="Oldest requests first so nothing waits too long."
      :has-rows="items.length > 0"
      :loading="loading"
      min-width="1000px"
      empty-title="No pending requests"
      empty-description="Everything has been reviewed, or no request matches your filters."
    >
      <template #headers>
        <th>Request</th>
        <th>Employee</th>
        <th>Details</th>
        <th>Filed</th>
        <th>Waiting</th>
        <th class="text-right"><span class="sr-only">Action</span></th>
      </template>

      <template #rows>
        <tr v-for="item in items" :key="item.key">
          <td>
            <span class="type-pill" :class="`tone-${PENDING_TYPE_STYLE[item.type].color}`">
              <component :is="PENDING_TYPE_STYLE[item.type].icon" :size="13" />
              {{ item.type_label }}
            </span>
            <small class="cell-sub">{{ item.request_no }}</small>
          </td>
          <td>
            <strong class="cell-title">{{ item.employee.name }}</strong>
            <small class="cell-sub">
              {{ item.employee.emp_id }}<template v-if="item.employee.department"> · {{ item.employee.department }}</template>
            </small>
          </td>
          <td class="details-cell">
            <span class="cell-title">{{ item.details }}</span>
            <small v-if="item.reason" class="cell-sub reason" :title="item.reason">{{ item.reason }}</small>
          </td>
          <td>{{ filedLabel(item.filed_at) }}</td>
          <td>
            <span class="waiting" :class="waitingTone(item.waiting_days)">{{ waitingLabel(item.waiting_days) }}</span>
          </td>
          <td class="text-right">
            <button type="button" class="review-btn" @click="review(item)">
              Review <ArrowRight :size="14" />
            </button>
          </td>
        </tr>
      </template>
    </BaseDataTable>

    <BaseTableFooter
      v-model="currentPage"
      :showing-from="meta.from"
      :showing-to="meta.to"
      :total-items="meta.total"
      :total-pages="meta.last_page"
      item-label="pending requests"
    />

    <p v-if="!loading && summary && summary.total === 0" class="all-clear">
      <Inbox :size="16" /> All caught up. There are no requests waiting for approval.
    </p>
  </section>
</template>

<style scoped>
.pending-page {
  width: 100%;
  max-width: 1660px;
  margin: 0 auto;
}

/* ===== Type chips ===== */

.type-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 18px 0 12px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.chip:hover { color: var(--text-primary); }

.chip.active {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--text-primary);
}

.chip:focus-visible,
.review-btn:focus-visible,
.reset-btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.chip-count {
  min-width: 22px;
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-size: 11px;
  text-align: center;
}

.chip.tone-green svg { color: var(--green); }
.chip.tone-orange svg { color: var(--orange); }
.chip.tone-purple svg { color: var(--purple); }
.chip.tone-blue svg { color: var(--primary); }
.chip.tone-red svg { color: var(--red); }

/* ===== Filters ===== */

.filters-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
}

.search-box {
  display: flex;
  flex: 1;
  min-width: 240px;
  height: 40px;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
}

.search-box:focus-within { border-color: var(--primary); }

.search-box input {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 12px;
  outline: none;
}

.select-wrap {
  position: relative;
  min-width: 170px;
}

.select-wrap select {
  width: 100%;
  height: 40px;
  padding: 0 34px 0 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 12px;
  appearance: none;
}

.select-wrap select:focus-visible {
  border-color: var(--primary);
  outline: none;
}

.select-icon {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.reset-btn {
  height: 40px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: transparent;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.load-error {
  margin: 0 0 14px;
  padding: 10px 12px;
  border-radius: 9px;
  background: var(--red-soft);
  color: var(--red);
  font-size: 13px;
}

.load-error button {
  margin-left: 10px;
  border: 0;
  background: transparent;
  color: var(--primary);
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
}

/* ===== Table cells ===== */

.type-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.tone-green.type-pill { background: var(--green-soft); color: var(--green); }
.tone-orange.type-pill { background: var(--orange-soft); color: var(--orange); }
.tone-purple.type-pill { background: var(--purple-soft); color: var(--purple); }
.tone-blue.type-pill { background: var(--primary-soft); color: var(--primary); }
.tone-red.type-pill { background: var(--red-soft); color: var(--red); }

.cell-title { display: block; }

.cell-sub {
  display: block;
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 11px;
}

.details-cell { max-width: 360px; }

.reason {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.waiting {
  display: inline-block;
  padding: 4px 9px;
  border-radius: 999px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.waiting.warn { background: var(--orange-soft); color: var(--orange); }
.waiting.danger { background: var(--red-soft); color: var(--red); }

.review-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--primary);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.review-btn:hover {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.all-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 14px 0 0;
  color: var(--green);
  font-size: 13px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 640px) {
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box,
  .select-wrap,
  .reset-btn { width: 100%; }
}
</style>