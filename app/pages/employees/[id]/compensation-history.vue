<script setup lang="ts">
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarDays,
  History,
  ShieldCheck,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const {
  getCompensationHistory,
} = useWageManagement()

const employeeId =
  computed(
    () =>
      route.params.id as string,
  )

const history =
  computed(
    () =>
      getCompensationHistory(
        employeeId.value,
      ),
  )

const employeeName =
  computed(
    () =>
      history.value[0]
        ?.employeeName ||
      `Employee #${employeeId.value}`,
  )

const employeeNumber =
  computed(
    () =>
      history.value[0]
        ?.employeeNumber ||
      'No compensation history',
  )

const currentRate =
  computed(
    () =>
      history.value[0]
        ?.newRate || 0,
  )

const totalChanges =
  computed(
    () =>
      history.value.length,
  )

const governmentChanges =
  computed(
    () =>
      history.value.filter(
        item =>
          item.reason ===
          'Government Wage Order',
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

const formatDate = (
  value: string,
) => {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    },
  ).format(
    new Date(
      `${value}T00:00:00`,
    ),
  )
}

const goBack = () => {
  router.push(
    `/employees/${employeeId.value}`,
  )
}
</script>

<template>
  <section class="page">

    <button
      type="button"
      class="back-button"
      @click="goBack"
    >
      <ArrowLeft :size="15" />
      Back to Employee Profile
    </button>

    <PageHeader
      title="Compensation History"
      :description="`${employeeName} · ${employeeNumber}`"
    />

    <div class="stats-grid">

      <StatCard
        label="Current Rate"
        :value="money(currentRate)"
        description="Latest effective compensation rate"
        :icon="Banknote"
        tone="green"
      />

      <StatCard
        label="Salary Changes"
        :value="totalChanges"
        description="Recorded compensation adjustments"
        :icon="History"
        tone="blue"
      />

      <StatCard
        label="Government Adjustments"
        :value="governmentChanges"
        description="Changes caused by wage orders"
        :icon="ShieldCheck"
        tone="orange"
      />

    </div>

    <article class="history-card">

      <div class="history-header">
        <h3>
          Rate History
        </h3>

        <p>
          Chronological employee salary and rate changes.
        </p>
      </div>

      <div
        v-if="history.length"
        class="timeline"
      >

        <div
          v-for="item in history"
          :key="item.id"
          class="timeline-item"
        >

          <div class="timeline-marker">
            <Banknote :size="14" />
          </div>

          <div class="timeline-card">

            <div class="timeline-top">

              <div>
                <span class="reason">
                  {{ item.reason }}
                </span>

                <strong>
                  {{
                    formatDate(
                      item.effectiveDate,
                    )
                  }}
                </strong>
              </div>

              <span class="salary-type">
                {{ item.salaryType }} Rate
              </span>

            </div>

            <div class="rate-change">

              <div class="rate old">
                <span>
                  Previous Rate
                </span>

                <strong>
                  {{ money(item.oldRate) }}
                </strong>
              </div>

              <div class="arrow">
                <ArrowRight :size="17" />
              </div>

              <div class="rate new">
                <span>
                  New Rate
                </span>

                <strong>
                  {{ money(item.newRate) }}
                </strong>
              </div>

              <div class="increase">
                <span>
                  Increase
                </span>

                <strong>
                  +{{
                    money(
                      item.newRate -
                      item.oldRate,
                    )
                  }}
                </strong>
              </div>

            </div>

            <div class="meta">

              <span>
                <CalendarDays :size="12" />
                Effective:
                {{ formatDate(item.effectiveDate) }}
              </span>

              <span>
                Approved by:
                {{ item.approvedBy }}
              </span>

              <span v-if="item.wageOrderCode">
                Wage Order:
                {{ item.wageOrderCode }}
              </span>

            </div>

            <p
              v-if="item.remarks"
              class="remarks"
            >
              {{ item.remarks }}
            </p>

          </div>

        </div>

      </div>

      <div
        v-else
        class="empty"
      >
        <History :size="35" />

        <strong>
          No compensation history yet
        </strong>

        <span>
          Salary changes will appear here once connected to backend records.
        </span>
      </div>

    </article>

  </section>
</template>

<style scoped>
.page {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--primary);
  font-family: inherit;
  font-size: 10px;
  font-weight: 650;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.history-card {
  padding: 17px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
}

.history-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
}

.history-header p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.timeline {
  position: relative;
  margin-top: 20px;
}

.timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 38px 1fr;
  gap: 12px;
  padding-bottom: 17px;
}

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  top: 35px;
  bottom: 0;
  left: 18px;
  width: 1px;
  background: var(--border);
}

.timeline-marker {
  position: relative;
  z-index: 2;
  display: flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--primary-soft);
  color: var(--primary);
}

.timeline-card {
  padding: 14px;
  border: 1px solid var(--border-soft);
  border-radius: 10px;
  background: var(--bg-card-soft);
}

.timeline-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
}

.timeline-top strong {
  display: block;
  margin-top: 4px;
  color: var(--text-primary);
  font-size: 11px;
}

.reason {
  color: var(--primary);
  font-size: 9px;
  font-weight: 700;
}

.salary-type {
  padding: 5px 8px;
  border-radius: 20px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 8px;
  font-weight: 650;
}

.rate-change {
  display: grid;
  grid-template-columns:
    1fr
    auto
    1fr
    1fr;
  gap: 10px;
  align-items: center;
  margin-top: 13px;
}

.rate,
.increase {
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card);
}

.rate span,
.rate strong,
.increase span,
.increase strong {
  display: block;
}

.rate span,
.increase span {
  color: var(--text-muted);
  font-size: 8px;
}

.rate strong,
.increase strong {
  margin-top: 3px;
  color: var(--text-primary);
  font-size: 11px;
}

.rate.new {
  background: var(--green-soft);
}

.rate.new strong,
.increase strong {
  color: var(--green);
}

.arrow {
  color: var(--primary);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 12px;
  color: var(--text-muted);
  font-size: 9px;
}

.meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.remarks {
  margin: 10px 0 0;
  padding-top: 10px;
  border-top: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 9.5px;
}

.empty {
  display: flex;
  min-height: 260px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: var(--text-muted);
}

.empty strong {
  color: var(--text-primary);
}

@media (max-width: 800px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .rate-change {
    grid-template-columns: 1fr;
  }

  .arrow {
    transform: rotate(90deg);
  }
}
</style>