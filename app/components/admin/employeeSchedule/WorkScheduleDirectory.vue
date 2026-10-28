<script setup lang="ts">
import WorkScheduleActions from '~/components/admin/employeeSchedule/WorkScheduleActions.vue'

import type {
  WorkSchedule,
} from '~/types/workSchedule'

defineProps<{
  schedules: WorkSchedule[]
}>()

const emit = defineEmits<{
  edit: [schedule: WorkSchedule]
  toggleStatus: [schedule: WorkSchedule]
}>()
</script>

<template>
  <article class="directory-card">

    <!-- HEADER -->
    <div class="card-heading">
      <div>
        <h3>
          Work Schedule Directory
        </h3>

       <p>
          Manage reusable employee shifts,
          working hours and break configurations.
        </p>
      </div>
    </div>

    <!-- TABLE -->
    <div
      v-if="schedules.length"
      class="table-scroll"
    >
      <table class="schedule-table">

        <thead>
          <tr>
            <th>Schedule</th>
            <th>Type</th>
            <th>Working Hours</th>
            <th>Break</th>
            <!-- <th>Rest Day</th> -->
            <th>Grace Period</th>
            <th>Status</th>
            <th class="action-column" />
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="schedule in schedules"
            :key="schedule.id"
          >

            <!-- SCHEDULE -->
            <td>
              <div class="schedule-name">
                <div>
                  <strong>
                    {{ schedule.name }}
                  </strong>

                  <span>
                    {{ schedule.code }}
                  </span>
                </div>

              </div>
            </td>

            <!-- TYPE -->
            <td>
              {{ schedule.type }}
            </td>

            <!-- WORKING HOURS -->
            <td>
              <template
                v-if="
                  schedule.timeIn &&
                  schedule.timeOut
                "
              >
                {{ schedule.timeIn }}
                -
                {{ schedule.timeOut }}
              </template>

              <span v-else>
                Flexible
              </span>
            </td>

            <!-- BREAK -->
            <td>
              <template
                v-if="
                  schedule.breakStart &&
                  schedule.breakEnd
                "
              >
                {{ schedule.breakStart }}
                -
                {{ schedule.breakEnd }}
              </template>

              <span v-else>
                —
              </span>
            </td>

            <!-- GRACE PERIOD -->
            <td>
              {{ schedule.gracePeriod }}
              min
            </td>

            <!-- STATUS -->
            <td>
              <StatusBadge
                :status="schedule.status"
              />
            </td>

            <!-- ACTIONS -->
            <td class="action-column">

              <WorkScheduleActions
                :schedule="schedule"

                @edit="
                  emit(
                    'edit',
                    schedule,
                  )
                "

                @toggle-status="
                  emit(
                    'toggleStatus',
                    schedule,
                  )
                "
              />

            </td>

          </tr>

        </tbody>

      </table>
    </div>

    <!-- EMPTY -->
    <div
      v-else
      class="empty-state"
    >
      No work schedules found.
    </div>

  </article>
</template>

<style scoped>
.directory-card {
  position: relative;

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

.card-heading {
  padding: 15px 16px;

  border-bottom:
    1px solid var(--border-soft);
}

.card-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
  font-weight: 700;
}

.card-heading p {
  margin: 5px 0 0;

  color:
    var(--text-muted);

  font-size: 11px;
}

.table-scroll {
  overflow-x: auto;
}

.schedule-table {
  width: 100%;

  min-width: 1000px;

  border-collapse: collapse;
}

.schedule-table th {
  padding: 12px 13px;

  border-bottom:
    1px solid var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 10px;
  font-weight: 700;

  text-align: left;
  text-transform: uppercase;

  white-space: nowrap;
}

.schedule-table td {
  padding: 13px;

  border-bottom:
    1px solid var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 11px;

  vertical-align: middle;
}

.schedule-table
tbody
tr:last-child
td {
  border-bottom: 0;
}

.schedule-table
tbody
tr:hover {
  background:
    var(--bg-card-soft);
}

.schedule-name {
  display: flex;

  min-width: 190px;

  align-items: center;

  gap: 9px;
}

.schedule-name strong,
.schedule-name span {
  display: block;
}

.schedule-name strong {
  color:
    var(--text-primary);

  font-size: 11px;
}

.schedule-name span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9px;
}

.action-column {
  width: 55px;

  text-align: right;
}

.empty-state {
  padding: 50px;

  color:
    var(--text-muted);

  font-size: 11px;

  text-align: center;
}
</style>
