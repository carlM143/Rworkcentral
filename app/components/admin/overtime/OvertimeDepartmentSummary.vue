<script setup lang="ts">
import {
  Building2,
} from 'lucide-vue-next'

import type {
  OvertimeDepartmentSummary,
} from '~/types/overtime'

defineProps<{
  departments: OvertimeDepartmentSummary[]
}>()
</script>

<template>
  <article class="department-card">

    <div class="card-heading">

      <div class="card-icon">
        <Building2 :size="17" />
      </div>

      <div>
        <h3>
          OT by Department
        </h3>

        <p>
          Overtime activity by department.
        </p>
      </div>

    </div>

    <div class="department-list">

      <div
        v-for="item in departments"
        :key="item.department"
        class="department-row"
      >

        <div>
          <strong>
            {{ item.department }}
          </strong>

          <span>
            {{ item.employees }}
            employee<span v-if="item.employees !== 1">s</span>

            ·

            {{ item.requests }}
            request<span v-if="item.requests !== 1">s</span>
          </span>
        </div>

        <strong class="hours">
          {{ item.approvedHours }}
          hrs
        </strong>

      </div>

    </div>

  </article>
</template>

<style scoped>
.department-card {
  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

.card-heading {
  display: flex;
  align-items: center;

  gap: 9px;

  padding: 12px 13px;

  border-bottom:
    1px solid var(--border-soft);
}

.card-icon {
  display: flex;

  width: 34px;
  height: 34px;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.card-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 10px;
}

.card-heading p {
  margin: 3px 0 0;

  color:
    var(--text-muted);

  font-size: 7px;
}

.department-list {
  padding: 5px 13px 9px;
}

.department-row {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding: 10px 0;

  border-bottom:
    1px solid var(--border-soft);
}

.department-row:last-child {
  border-bottom: 0;
}

.department-row strong,
.department-row span {
  display: block;
}

.department-row > div strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.department-row span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 7px;
}

.department-row .hours {
  color:
    var(--primary);

  font-size: 9px;
}
</style>