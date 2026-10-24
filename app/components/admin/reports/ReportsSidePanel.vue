<script setup lang="ts">
import {
  BarChart3,
  FileText,
  ArrowRight,
} from 'lucide-vue-next'

import type {
  AnalyticsSummary,
} from '~/types/report'

defineProps<{
  analytics: AnalyticsSummary[]

  frequentReports: {
    label: string
    route: string
  }[]
}>()

const emit = defineEmits<{
  openReport: [route: string]
}>()
</script>

<template>
  <aside class="reports-side">

    <!-- ANALYTICS -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon purple">
          <BarChart3 :size="16" />
        </div>

        <div>
          <h3>
            Key Analytics
          </h3>

          <p>
            Current HRIS operational metrics.
          </p>
        </div>

      </div>

      <div class="analytics-list">

        <div
          v-for="item in analytics"
          :key="item.label"
          class="analytics-row"
        >
          <div>
            <span>
              {{ item.label }}
            </span>

            <small>
              {{ item.description }}
            </small>
          </div>

          <strong>
            {{ item.value }}
          </strong>
        </div>

      </div>

    </article>

    <!-- FREQUENT -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon blue">
          <FileText :size="16" />
        </div>

        <div>
          <h3>
            Frequently Used
          </h3>

          <p>
            Quick access to common reports.
          </p>
        </div>

      </div>

      <div class="quick-list">

        <button
          v-for="item in frequentReports"
          :key="item.route"
          type="button"
          @click="
            emit(
              'openReport',
              item.route,
            )
          "
        >
          <span>
            {{ item.label }}
          </span>

          <ArrowRight :size="13" />
        </button>

      </div>

    </article>

  </aside>
</template>

<style scoped>
.reports-side {
  display: flex;

  flex-direction: column;

  gap: 12px;
}

.side-card {
  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

.side-heading {
  display: flex;

  align-items: center;

  gap: 9px;

  padding: 12px 13px;

  border-bottom:
    1px solid var(--border-soft);
}

.side-icon {
  display: flex;

  width: 34px;
  height: 34px;

  align-items: center;
  justify-content: center;

  border-radius: 8px;
}

.side-icon.purple {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.side-icon.blue {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.side-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 10px;
}

.side-heading p {
  margin: 3px 0 0;

  color:
    var(--text-muted);

  font-size: 7px;
}

/* ANALYTICS */

.analytics-list {
  padding:
    5px 13px 9px;
}

.analytics-row {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding: 10px 0;

  border-bottom:
    1px solid var(--border-soft);
}

.analytics-row:last-child {
  border-bottom: 0;
}

.analytics-row span,
.analytics-row small {
  display: block;
}

.analytics-row span {
  color:
    var(--text-primary);

  font-size: 8px;
}

.analytics-row small {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7px;
}

.analytics-row strong {
  flex-shrink: 0;

  color:
    var(--primary);

  font-size: 10px;
}

/* QUICK */

.quick-list {
  padding: 7px;
}

.quick-list button {
  display: flex;

  width: 100%;
  min-height: 38px;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding: 0 9px;

  border: 0;
  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);

  font-size: 8px;

  text-align: left;
}

.quick-list button:hover {
  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}
</style>