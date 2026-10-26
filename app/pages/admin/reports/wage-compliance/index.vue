<script setup lang="ts">
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  RefreshCcw,
  Scale,
  UsersRound,
} from 'lucide-vue-next'

const {
  complianceRecords,
} = useWageManagement()

const search = ref('')
const status = ref('')
const region = ref('')

const statusOptions = [
  'Compliant',
  'Below Minimum',
  'Pending Adjustment',
  'Distortion Review',
]

const regionOptions =
  computed(
    () => [
      ...new Set(
        complianceRecords.value.map(
          item => item.region,
        ),
      ),
    ],
  )

const filteredRecords =
  computed(() => {
    const keyword =
      search.value
        .trim()
        .toLowerCase()

    return complianceRecords.value.filter(
      item => {
        const matchesSearch =
          !keyword ||
          item.employeeName
            .toLowerCase()
            .includes(keyword) ||
          item.employeeNumber
            .toLowerCase()
            .includes(keyword) ||
          item.department
            .toLowerCase()
            .includes(keyword)

        return (
          matchesSearch &&
          (
            !status.value ||
            item.status ===
              status.value
          ) &&
          (
            !region.value ||
            item.region ===
              region.value
          )
        )
      },
    )
  })

const compliant =
  computed(
    () =>
      filteredRecords.value.filter(
        item =>
          item.status ===
          'Compliant',
      ).length,
  )

const pending =
  computed(
    () =>
      filteredRecords.value.filter(
        item =>
          item.status ===
          'Pending Adjustment' ||
          item.status ===
          'Below Minimum',
      ).length,
  )

const distortion =
  computed(
    () =>
      filteredRecords.value.filter(
        item =>
          item.distortionRisk,
      ).length,
  )

const money = (
  value: number,
) => {
  return new Intl.NumberFormat(
    'en-PH',
    {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    },
  ).format(value)
}

const resetFilters = () => {
  search.value = ''
  status.value = ''
  region.value = ''
}

const currentPage = ref(1)
const perPage = 10
const totalPages = computed(() => Math.max(1, Math.ceil(filteredRecords.value.length / perPage)))
const paginatedRecords = computed(() => filteredRecords.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage))
const showingFrom = computed(() => filteredRecords.value.length ? (currentPage.value - 1) * perPage + 1 : 0)
const showingTo = computed(() => Math.min(currentPage.value * perPage, filteredRecords.value.length))
watch([search, status, region], () => { currentPage.value = 1 })
watch(totalPages, value => { currentPage.value = Math.min(currentPage.value, value) })
const { busy, preview, selectedRecord, generate, viewRecord, download, print } = useReportActions({
  title: 'Wage Compliance Report', category: 'Payroll', rows: filteredRecords,
  period: () => 'Current wage review',
  filters: () => ({ Search: search.value, Region: region.value, Status: status.value }),
})
const handleExport = generate

const statusClass = (
  value: string,
) => {
  if (
    value ===
    'Compliant'
  ) {
    return 'success'
  }

  if (
    value ===
    'Distortion Review'
  ) {
    return 'distortion'
  }

  return 'warning'
}
</script>

<template>
  <section class="page">
    <ReportDataNotice />

    <PageHeader
      title="Wage Compliance Report"
      description="Monitor employee rates against applicable wage orders and identify pending minimum wage adjustments or possible wage distortion."
    >

      <AppButton
        :icon="Download"
        :disabled="busy"
        @click="handleExport"
      >
        Export Report
      </AppButton>

    </PageHeader>

    <div class="stats-grid">

      <StatCard
        label="Employees Reviewed"
        :value="filteredRecords.length"
        description="Employees evaluated"
        :icon="UsersRound"
        tone="blue"
      />

      <StatCard
        label="Compliant"
        :value="compliant"
        description="Meeting applicable minimum"
        :icon="CheckCircle2"
        tone="green"
      />

      <StatCard
        label="Pending Adjustment"
        :value="pending"
        description="Employees requiring action"
        :icon="Scale"
        tone="orange"
      />

      <StatCard
        label="Distortion Review"
        :value="distortion"
        description="Salary gaps for HR review"
        :icon="AlertTriangle"
        tone="purple"
      />

    </div>

    <article class="filter-card">

      <div class="filter-grid">

        <AppInput
          v-model="search"
          searchable
          placeholder="Search employee or department..."
        />

        <AppSelect
          v-model="region"
          :options="regionOptions"
          placeholder="All Regions"
        />

        <AppSelect
          v-model="status"
          :options="statusOptions"
          placeholder="Compliance Status"
        />

        <AppButton
          variant="secondary"
          :icon="RefreshCcw"
          @click="resetFilters"
        >
          Reset
        </AppButton>

      </div>

    </article>

    <article class="table-card">

      <div class="table-scroll">

        <table>

          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Position</th>
              <th>Region</th>
              <th>Current Rate</th>
              <th>Required Minimum</th>
              <th>Variance</th>
              <th>Wage Order</th>
              <th>Distortion Risk</th>
              <th>Compliance Status</th>
              <th>Details</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="!filteredRecords.length"><td colspan="11">No wage compliance records match your filters.</td></tr>

            <tr
              v-for="item in paginatedRecords"
              :key="item.id"
            >

              <td>
                <strong>
                  {{ item.employeeName }}
                </strong>

                <span>
                  {{ item.employeeNumber }}
                </span>
              </td>

              <td>
                {{ item.department }}
              </td>

              <td>
                {{ item.position }}
              </td>

              <td>
                {{ item.region }}
              </td>

              <td>
                {{ money(item.currentRate) }}
              </td>

              <td>
                <strong>
                  {{ money(item.requiredMinimum) }}
                </strong>
              </td>

              <td>
                <span
                  :class="{
                    negative:
                      item.variance < 0,
                    positive:
                      item.variance >= 0,
                  }"
                >
                  {{
                    item.variance >= 0
                      ? '+'
                      : ''
                  }}{{ money(item.variance) }}
                </span>
              </td>

              <td>
                {{ item.wageOrderCode }}
              </td>

              <td>
                <span
                  :class="{
                    risk:
                      item.distortionRisk,
                  }"
                >
                  {{
                    item.distortionRisk
                      ? 'Review'
                      : 'None'
                  }}
                </span>
              </td>

              <td>
                <span
                  class="status-badge"
                  :class="statusClass(item.status)"
                >
                  {{ item.status }}
                </span>
              </td>
              <td><AppButton variant="secondary" size="sm" @click="viewRecord(item)">View</AppButton></td>

            </tr>

          </tbody>

        </table>

      </div>

    </article>

    <div class="report-footer">
      <p>Showing {{ showingFrom }}–{{ showingTo }} of {{ filteredRecords.length }} records</p>
      <AppPagination v-model="currentPage" :total-pages="totalPages" />
    </div>
    <ReportDialog :report="preview" :record="selectedRecord" :busy="busy" title="Wage Compliance Report"
      @close="preview = null; selectedRecord = null" @download="download" @print="print" />
  </section>
</template>

<style scoped>
.report-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding-top: 14px; font-size: 12px; color: var(--text-secondary); }
.page {
  width: 100%;
  max-width: 1680px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.filter-card {
  margin-bottom: 14px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
}

.filter-grid {
  display: grid;
  grid-template-columns:
    minmax(300px, 1fr)
    210px
    220px
    auto;
  gap: 9px;
}

.table-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1550px;
  border-collapse: collapse;
}

th {
  padding: 11px 12px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 9px;
  text-align: left;
  white-space: nowrap;
}

td {
  padding: 12px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 10px;
}

td strong,
td span {
  display: block;
}

td strong {
  color: var(--text-primary);
}

td span {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 9px;
}

.negative {
  color: var(--red) !important;
  font-weight: 700;
}

.positive {
  color: var(--green) !important;
  font-weight: 700;
}

.risk {
  color: var(--orange) !important;
  font-weight: 700;
}

.status-badge {
  display: inline-flex;
  margin: 0;
  padding: 5px 8px;
  border-radius: 20px;
  font-weight: 650;
}

.status-badge.success {
  background: var(--green-soft);
  color: var(--green);
}

.status-badge.warning {
  background: var(--orange-soft);
  color: var(--orange);
}

.status-badge.distortion {
  background: var(--purple-soft);
  color: var(--purple);
}

@media (max-width: 1000px) {
  .stats-grid,
  .filter-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .stats-grid,
  .filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
