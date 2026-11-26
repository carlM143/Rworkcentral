<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  ArrowRight,
  BarChart3,
  Clock3,
  FileText,
  Gift,
  Landmark,
  RefreshCw,
  Scale,
  Search,
  ShieldCheck,
  WalletCards,
} from 'lucide-vue-next'

/**
 * Reports › Reports Center: every report the user may open, with a one-line
 * status from the database (GET /admin/reports/summary).
 */
definePageMeta({ layout: 'admin' })
useHead({ title: 'Reports Center | RWorkCentral' })

type SummaryKey = 'attendance' | 'payroll' | 'government' | 'thirteenth_month' | 'wage_compliance' | 'withholding_tax'
type Summary = { headline: string, detail: string, state: 'ok' | 'warn' | 'danger' | 'info' | 'empty' }

interface ReportCard {
  title: string
  description: string
  to: string
  icon: unknown
  privilege: string
  summary: SummaryKey
  group: 'Time & Attendance' | 'Payroll' | 'Government Remittances' | 'Compliance'
  tone: 'blue' | 'green' | 'orange' | 'purple' | 'red'
}

const REPORTS: ReportCard[] = [
  { title: 'Attendance Reports', description: 'Daily and period attendance, late, undertime, absences and time log issues.', to: '/admin/reports/attendance', icon: Clock3, privilege: 'attendance.view', summary: 'attendance', group: 'Time & Attendance', tone: 'blue' },
  { title: 'Payroll Reports', description: 'Payroll register of a pay period with earnings, deductions, net pay and a department summary.', to: '/admin/reports/payroll', icon: WalletCards, privilege: 'payroll.view', summary: 'payroll', group: 'Payroll', tone: 'green' },
  { title: '13th Month Pay', description: 'Basic salary earned in the year ÷ 12 per employee (PD 851), with the Dec 24 deadline.', to: '/admin/13th-month-pay', icon: Gift, privilege: 'thirteenth_month.view', summary: 'thirteenth_month', group: 'Payroll', tone: 'purple' },
  { title: 'SSS Report', description: 'Monthly employee, employer and EC contributions for SSS remittance.', to: '/admin/reports/sss', icon: ShieldCheck, privilege: 'government.view', summary: 'government', group: 'Government Remittances', tone: 'blue' },
  { title: 'Pag-IBIG Report', description: 'Monthly employee and employer Pag-IBIG contributions for remittance.', to: '/admin/reports/pagibig', icon: Landmark, privilege: 'government.view', summary: 'government', group: 'Government Remittances', tone: 'orange' },
  { title: 'PhilHealth Report', description: 'Monthly employee and employer PhilHealth premiums for remittance.', to: '/admin/reports/philhealth', icon: FileText, privilege: 'government.view', summary: 'government', group: 'Government Remittances', tone: 'green' },
  { title: 'Withholding Tax Report', description: 'Tax withheld on compensation per employee for the month; basis for BIR Form 1601-C.', to: '/admin/reports/withholding-tax', icon: Landmark, privilege: 'withholding_tax.view', summary: 'withholding_tax', group: 'Government Remittances', tone: 'purple' },
  { title: 'Wage Compliance', description: 'Each employee’s daily rate against the minimum wage in force for their region.', to: '/admin/reports/wage-compliance', icon: Scale, privilege: 'wage_compliance.view', summary: 'wage_compliance', group: 'Compliance', tone: 'red' },
]

const GROUPS: ReportCard['group'][] = ['Time & Attendance', 'Payroll', 'Government Remittances', 'Compliance']

const { $api } = useNuxtApp()
const { can } = useAuth()

const summaries = ref<Partial<Record<SummaryKey, Summary>>>({})
const loading = ref(true)
const search = ref('')

const load = async () => {
  loading.value = true
  try {
    const response = await $api<{ data: Partial<Record<SummaryKey, Summary>> }>('/admin/reports/summary')
    summaries.value = response.data ?? {}
  } catch {
    summaries.value = {}
  } finally {
    loading.value = false
  }
}

onMounted(load)

// Only reports the user's role allows (Roles & Permissions › Reports).
const allowed = computed(() => REPORTS.filter(r => can('reports', r.privilege)))

const group = ref<ReportCard['group'] | ''>('')

const groupsWithReports = computed(() => GROUPS.filter(g => allowed.value.some(r => r.group === g)))

const visible = computed(() => {
  const q = search.value.trim().toLowerCase()
  return allowed.value
    .filter(r => !group.value || r.group === group.value)
    .filter(r => !q || `${r.title} ${r.description} ${r.group}`.toLowerCase().includes(q))
})

const attention = computed(() =>
  allowed.value
    .map(r => ({ report: r, summary: summaries.value[r.summary] }))
    .filter(x => x.summary && (x.summary.state === 'danger' || x.summary.state === 'warn'))
    .filter((x, i, list) => list.findIndex(y => y.report.summary === x.report.summary) === i),
)
</script>

<template>
  <section class="rc-page">
    <PageHeader
      title="Reports Center"
      description="Every report you can open, with its latest status. Reports are read-only and come from timekeeping, payroll and compensation data."
    >
      <AppButton variant="secondary" :icon="RefreshCw" :disabled="loading" @click="load">Refresh</AppButton>
    </PageHeader>

    <!-- NEEDS ATTENTION -->
    <section v-if="attention.length" class="attention" aria-label="Needs attention">
      <h2>Needs attention</h2>
      <NuxtLink v-for="a in attention" :key="a.report.to" :to="a.report.to" class="attention-item" :class="a.summary!.state">
        <component :is="a.report.icon" :size="16" />
        <span><strong>{{ a.report.title }}</strong> — {{ a.summary!.headline }}</span>
        <ArrowRight :size="14" />
      </NuxtLink>
    </section>

    <div class="toolbar">
      <label class="search">
        <Search :size="16" />
        <input v-model="search" type="search" placeholder="Search reports..." aria-label="Search reports">
      </label>
      <div class="chips" role="group" aria-label="Report group">
        <button type="button" class="chip" :class="{ on: !group }" :aria-pressed="!group" @click="group = ''">All</button>
        <button
          v-for="g in groupsWithReports"
          :key="g"
          type="button"
          class="chip"
          :class="{ on: group === g }"
          :aria-pressed="group === g"
          @click="group = group === g ? '' : g"
        >
          {{ g }}
        </button>
      </div>
    </div>

    <div v-if="!allowed.length" class="state">
      <BarChart3 :size="28" />
      <strong>No reports available</strong>
      <span>Your role has no report permissions. Ask your administrator to update it in Users & Access › Roles & Permissions.</span>
    </div>

    <div v-else-if="!visible.length" class="state">
      <strong>No reports match “{{ search }}”</strong>
    </div>

    <div v-if="visible.length" class="grid">
      <NuxtLink v-for="r in visible" :key="r.to" :to="r.to" class="card">
        <div class="card-top">
          <span class="icon" :class="r.tone"><component :is="r.icon" :size="20" /></span>
          <span class="tag">{{ r.group }}</span>
        </div>
        <h3>{{ r.title }} <ArrowRight :size="15" class="go" /></h3>
        <p>{{ r.description }}</p>

        <div class="status" :class="summaries[r.summary]?.state ?? 'loading'">
          <template v-if="loading && !summaries[r.summary]">
            <span class="skeleton" /><span class="skeleton short" />
          </template>
          <template v-else-if="summaries[r.summary]">
            <strong>{{ summaries[r.summary]!.headline }}</strong>
            <small>{{ summaries[r.summary]!.detail }}</small>
          </template>
          <small v-else>Open the report for details.</small>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.rc-page { display: grid; gap: 18px; width: 100%; max-width: 1320px; margin: 0 auto; }

.attention { display: grid; gap: 8px; padding: 14px 16px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.attention h2 { margin: 0 0 2px; color: var(--text-secondary); font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
.attention-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 9px; font-size: 13px; }
.attention-item span { flex: 1; }
.attention-item.danger { background: var(--red-soft); color: var(--red); }
.attention-item.warn { background: var(--orange-soft); color: var(--orange); }

.toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
.search { display: flex; width: 100%; max-width: 380px; height: 42px; align-items: center; gap: 8px; padding: 0 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-card); color: var(--text-muted); }
.search:focus-within { border-color: var(--primary); }
.search input { width: 100%; height: 100%; border: 0; outline: 0; background: transparent; color: var(--text-primary); font-family: inherit; font-size: 13px; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { height: 34px; padding: 0 14px; border: 1px solid var(--border); border-radius: 999px; background: var(--bg-card); color: var(--text-secondary); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.chip.on { border-color: var(--primary); background: var(--primary-soft); color: var(--text-primary); }
.chip:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

.state { display: flex; min-height: 200px; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 20px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); color: var(--text-muted); font-size: 13px; text-align: center; }
.state strong { color: var(--text-primary); font-size: 15px; }

/* One even grid: 3 columns on desktop, every card the same height */
.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; align-items: stretch; }

.card { display: flex; height: 100%; flex-direction: column; gap: 8px; padding: 20px; border: 1px solid var(--border); border-radius: 14px; background: var(--bg-card); transition: border-color 0.15s ease, transform 0.15s ease; }
.card:hover { border-color: var(--primary); transform: translateY(-2px); }
.card:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.card-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.tag { padding: 3px 9px; border-radius: 999px; background: var(--bg-card-soft); color: var(--text-muted); font-size: 10px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap; }
.card h3 { display: flex; align-items: center; gap: 6px; margin: 6px 0 0; color: var(--text-primary); font-size: 16px; }
.go { color: var(--text-muted); transition: transform 0.15s ease; }
.card:hover .go { color: var(--primary); transform: translateX(3px); }
.card p { flex: 1; margin: 0; color: var(--text-secondary); font-size: 12px; line-height: 1.55; }

.icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 11px; }
.icon.blue { background: var(--primary-soft); color: var(--primary); }
.icon.green { background: var(--green-soft); color: var(--green); }
.icon.orange { background: var(--orange-soft); color: var(--orange); }
.icon.purple { background: var(--purple-soft); color: var(--purple); }
.icon.red { background: var(--red-soft); color: var(--red); }

.status { display: grid; gap: 3px; min-height: 58px; margin-top: 8px; padding: 10px 12px; border-left: 3px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); }
.status strong { color: var(--text-primary); font-size: 13px; }
.status small { color: var(--text-secondary); font-size: 11px; line-height: 1.4; }
.status.ok { border-left-color: var(--green); }
.status.warn { border-left-color: var(--orange); }
.status.danger { border-left-color: var(--red); }
.status.info { border-left-color: var(--primary); }
.status.empty small, .status.empty strong { color: var(--text-muted); }
.skeleton { display: block; height: 10px; border-radius: 4px; background: var(--border); }
.skeleton.short { width: 60%; }

@media (max-width: 1150px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 700px) { .grid { grid-template-columns: 1fr; } .search { max-width: none; } }
@media (prefers-reduced-motion: reduce) { .card, .go { transition: none; } .card:hover, .card:hover .go { transform: none; } }
</style>
