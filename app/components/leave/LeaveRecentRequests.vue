<script setup lang="ts">
import {
  ArrowRight,
  CalendarDays,
  UserRound,
} from 'lucide-vue-next'

import type {
  LeaveRequest,
} from '~/types/leave'

defineProps<{
  requests:
    LeaveRequest[]
}>()

const emit =
  defineEmits<{
    viewAll: []
  }>()

const formatDate = (
  value: string,
) => {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
    },
  ).format(
    new Date(
      `${value}T00:00:00`,
    ),
  )
}
</script>

<template>
  <article class="recent-card">

    <!-- HEADER -->

    <div class="recent-header">

      <div>

        <h3>
          Recent Leave Requests
        </h3>

        <p>
          Latest employee leave requests
          filed in the system.
        </p>

      </div>

      <button
        type="button"
        class="view-all-button"
        @click="
          emit('viewAll')
        "
      >
        View All Requests

        <ArrowRight
          :size="13"
        />
      </button>

    </div>

    <!-- LIST -->

    <div
      v-if="
        requests.length
      "
      class="request-list"
    >

      <div
        v-for="
          request in requests
        "
        :key="
          request.id
        "
        class="request-row"
      >

        <!-- EMPLOYEE -->

        <div class="employee-area">

          <div class="employee-icon">

            <UserRound
              :size="15"
            />

          </div>

          <div class="employee-info">

            <strong>
              {{ request.employeeName }}
            </strong>

            <span>
              {{ request.employeeNumber }}
              ·
              {{ request.department }}
            </span>

          </div>

        </div>

        <!-- LEAVE TYPE -->

        <div class="leave-info">

          <span class="label">
            Leave Type
          </span>

          <strong>
            {{ request.leaveType }}
          </strong>

        </div>

        <!-- DATE -->

        <div class="date-info">

          <span class="label">
            Leave Period
          </span>

          <div>

            <CalendarDays
              :size="12"
            />

            <strong>
              {{
                formatDate(
                  request.dateFrom,
                )
              }}

              <template
                v-if="
                  request.dateFrom !==
                  request.dateTo
                "
              >
                –
                {{
                  formatDate(
                    request.dateTo,
                  )
                }}
              </template>
            </strong>

          </div>

        </div>

        <!-- DAYS -->

        <div class="days-info">

          <span class="label">
            Days
          </span>

          <strong>
            {{ request.days }}

            day<span
              v-if="
                request.days !== 1
              "
            >s</span>
          </strong>

        </div>

        <!-- STATUS -->

        <div class="status-area">

          <StatusBadge
            :status="
              request.status
            "
          />

        </div>

      </div>

    </div>

    <!-- EMPTY -->

    <div
      v-else
      class="empty-state"
    >

      <div class="empty-icon">

        <CalendarDays
          :size="23"
        />

      </div>

      <strong>
        No recent leave requests
      </strong>

      <span>
        New leave requests will appear here.
      </span>

    </div>

  </article>
</template>

<style scoped>
.recent-card {
  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

/* =========================================
   HEADER
========================================= */

.recent-header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 15px;

  padding:
    13px 15px;

  border-bottom:
    1px solid var(--border-soft);
}

.recent-header h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 11px;
  font-weight: 700;
}

.recent-header p {
  margin:
    3px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.view-all-button {
  display: inline-flex;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  gap: 5px;

  padding:
    7px 9px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--primary);

  font-family: inherit;

  font-size: 8px;
  font-weight: 600;

  cursor: pointer;
}

.view-all-button:hover {
  border-color:
    var(--primary);

  background:
    var(--primary-soft);
}

/* =========================================
   ROWS
========================================= */

.request-list {
  display: flex;

  flex-direction: column;
}

.request-row {
  display: grid;

  grid-template-columns:
    minmax(210px, 1.4fr)
    minmax(120px, 0.8fr)
    minmax(145px, 0.9fr)
    75px
    105px;

  align-items: center;

  gap: 14px;

  padding:
    11px 13px;

  border-bottom:
    1px solid var(--border-soft);
}

.request-row:last-child {
  border-bottom: 0;
}

.request-row:hover {
  background:
    var(--bg-card-soft);
}

/* =========================================
   EMPLOYEE
========================================= */

.employee-area {
  display: flex;

  min-width: 0;

  align-items: center;

  gap: 8px;
}

.employee-icon {
  display: flex;

  width: 32px;
  height: 32px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.employee-info {
  min-width: 0;
}

.employee-info strong,
.employee-info span {
  display: block;
}

.employee-info strong {
  overflow: hidden;

  color:
    var(--text-primary);

  font-size: 9px;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.employee-info span {
  overflow: hidden;

  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7px;

  white-space: nowrap;
  text-overflow: ellipsis;
}

/* =========================================
   INFO
========================================= */

.leave-info,
.date-info,
.days-info {
  min-width: 0;
}

.label {
  display: block;

  margin-bottom: 3px;

  color:
    var(--text-muted);

  font-size: 6.5px;

  text-transform: uppercase;

  letter-spacing: 0.25px;
}

.leave-info strong,
.date-info strong,
.days-info strong {
  color:
    var(--text-primary);

  font-size: 8px;
  font-weight: 600;
}

.date-info > div {
  display: flex;

  align-items: center;

  gap: 4px;

  color:
    var(--text-muted);

  white-space: nowrap;
}

.days-info strong {
  white-space: nowrap;
}

.status-area {
  display: flex;

  justify-content: flex-end;
}

/* =========================================
   EMPTY
========================================= */

.empty-state {
  display: flex;

  min-height: 210px;

  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 6px;

  padding: 25px;

  text-align: center;
}

.empty-icon {
  display: flex;

  width: 45px;
  height: 45px;

  align-items: center;
  justify-content: center;

  margin-bottom: 3px;

  border-radius: 11px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.empty-state strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.empty-state span {
  color:
    var(--text-muted);

  font-size: 8px;
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 900px) {
  .request-row {
    grid-template-columns:
      minmax(180px, 1fr)
      minmax(110px, 0.8fr)
      minmax(120px, 0.8fr)
      70px
      100px;

    overflow-x: auto;
  }
}

@media (max-width: 650px) {
  .recent-header {
    align-items: flex-start;

    flex-direction: column;
  }

  .view-all-button {
    width: 100%;
  }

  .request-row {
    grid-template-columns:
      1fr;

    gap: 8px;
  }

  .status-area {
    justify-content: flex-start;
  }
}
</style>