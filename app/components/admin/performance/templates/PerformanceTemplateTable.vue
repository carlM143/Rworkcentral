<script setup lang="ts">
import {
  ClipboardList,
  Layers3,
  ListChecks,
  MoreHorizontal,
  Star,
  Users,
} from 'lucide-vue-next'

import type {
  PerformanceTemplate,
  PerformanceTemplateStatus,
  PerformanceTemplateType,
} from '~/types/performanceTemplate'

defineProps<{
  templates:
    PerformanceTemplate[]
}>()

const formatDate = (
  value: string,
) => {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  ).format(
    new Date(value),
  )
}

const typeClass = (
  type:
    PerformanceTemplateType,
) => {
  if (
    type ===
    'General Review'
  ) {
    return 'general'
  }

  if (
    type ===
    'Probationary Review'
  ) {
    return 'probationary'
  }

  if (
    type ===
    'Leadership Review'
  ) {
    return 'leadership'
  }

  if (
    type ===
    'Technical Review'
  ) {
    return 'technical'
  }

  return 'driver'
}

const statusClass = (
  status:
    PerformanceTemplateStatus,
) => {
  if (
    status ===
    'Active'
  ) {
    return 'active'
  }

  if (
    status ===
    'Draft'
  ) {
    return 'draft'
  }

  if (
    status ===
    'Inactive'
  ) {
    return 'inactive'
  }

  return 'archived'
}
</script>

<template>
  <article class="table-card">

    <!-- HEADER -->

    <div class="table-heading">

      <div>

        <h3>
          Evaluation Templates
        </h3>

        <p>
          Manage reusable performance evaluation
          forms, criteria, scoring rules and
          employee applicability.
        </p>

      </div>

    </div>

    <!-- TABLE -->

    <div
      v-if="templates.length"
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Template</th>
            <th>Template Type</th>
            <th>Employee Scope</th>
            <th>Description</th>
            <th>Sections</th>
            <th>Criteria</th>
            <th>Scoring Scale</th>
            <th>Passing Score</th>
            <th>Total Weight</th>
            <th>Usage</th>
            <th>Status</th>
            <th>Created By</th>
            <th>Last Updated</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="item in templates"
            :key="item.id"
          >

            <!-- TEMPLATE -->

            <td>

              <div class="template-cell">

                <div class="template-icon">

                  <ClipboardList
                    :size="16"
                  />

                </div>

                <div>

                  <strong>
                    {{ item.name }}
                  </strong>

                  <span>
                    {{ item.templateCode }}
                  </span>

                </div>

              </div>

            </td>

            <!-- TYPE -->

            <td>

              <span
                class="type-badge"
                :class="
                  typeClass(
                    item.type,
                  )
                "
              >
                {{ item.type }}
              </span>

            </td>

            <!-- SCOPE -->

            <td>

              <div class="scope-cell">

                <Users
                  :size="13"
                />

                <strong>
                  {{ item.scope }}
                </strong>

              </div>

            </td>

            <!-- DESCRIPTION -->

            <td>

              <p class="description">
                {{ item.description }}
              </p>

            </td>

            <!-- SECTIONS -->

            <td>

              <div class="count-cell">

                <Layers3
                  :size="13"
                />

                <strong>
                  {{ item.sectionCount }}
                </strong>

                <span>
                  sections
                </span>

              </div>

            </td>

            <!-- CRITERIA -->

            <td>

              <div class="count-cell">

                <ListChecks
                  :size="13"
                />

                <strong>
                  {{ item.criteriaCount }}
                </strong>

                <span>
                  criteria
                </span>

              </div>

            </td>

            <!-- SCALE -->

            <td>

              <span class="score-scale">

                <Star
                  :size="12"
                />

                {{ item.scoringScale }}

              </span>

            </td>

            <!-- PASSING -->

            <td>

              <strong class="passing-score">
                {{ item.passingScore }} / 5
              </strong>

            </td>

            <!-- WEIGHT -->

            <td>

              <div class="weight-cell">

                <strong>
                  {{ item.totalWeight }}%
                </strong>

                <div class="weight-track">

                  <div
                    class="weight-bar"
                    :style="{
                      width:
                        `${Math.min(
                          item.totalWeight,
                          100,
                        )}%`,
                    }"
                  />

                </div>

              </div>

            </td>

            <!-- USAGE -->

            <td>

              <div class="usage-cell">

                <strong>
                  {{ item.usageCount }}
                </strong>

                <span>
                  evaluations
                </span>

              </div>

            </td>

            <!-- STATUS -->

            <td>

              <span
                class="status-badge"
                :class="
                  statusClass(
                    item.status,
                  )
                "
              >

                <span class="status-dot" />

                {{ item.status }}

              </span>

            </td>

            <!-- CREATED BY -->

            <td>

              <strong class="created-by">
                {{ item.createdBy }}
              </strong>

            </td>

            <!-- UPDATED -->

            <td>

              <span class="updated-date">
                {{
                  formatDate(
                    item.updatedAt,
                  )
                }}
              </span>

            </td>

            <!-- ACTION -->

            <td>

              <button
                type="button"
                class="action-button"
                title="Template actions will be added later"
              >

                <MoreHorizontal
                  :size="18"
                />

              </button>

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

      <ClipboardList
        :size="34"
      />

      <strong>
        No evaluation templates found
      </strong>

      <span>
        Try changing your template filters.
      </span>

    </div>

  </article>
</template>

<style scoped>
.table-card {
  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

.table-heading {
  padding:
    16px 17px;

  border-bottom:
    1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 15px;
}

.table-heading p {
  margin:
    5px 0 0;

  color:
    var(--text-muted);

  font-size: 10px;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;

  min-width: 2250px;

  border-collapse: collapse;
}

th {
  padding:
    12px 13px;

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

td {
  padding:
    13px;

  border-top:
    1px solid var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 10px;

  vertical-align: middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

/* TEMPLATE */

.template-cell {
  display: flex;

  min-width: 250px;

  align-items: center;

  gap: 9px;
}

.template-icon {
  display: flex;

  width: 36px;
  height: 36px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.template-cell strong,
.template-cell span {
  display: block;
}

.template-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.template-cell span {
  margin-top: 3px;

  color:
    var(--primary);

  font-size: 9px;
  font-weight: 650;
}

/* TYPE */

.type-badge {
  display: inline-flex;

  padding:
    5px 9px;

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

.type-badge.general {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.type-badge.probationary {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.type-badge.leadership {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.type-badge.technical {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.type-badge.driver {
  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);
}

/* SCOPE */

.scope-cell {
  display: flex;

  min-width: 125px;

  align-items: center;

  gap: 5px;

  color:
    var(--text-primary);
}

.scope-cell svg {
  color:
    var(--primary);
}

/* DESCRIPTION */

.description {
  width: 285px;

  margin: 0;

  color:
    var(--text-secondary);

  font-size: 10px;

  line-height: 1.45;
}

/* COUNTS */

.count-cell {
  display: flex;

  min-width: 95px;

  align-items: center;

  gap: 4px;

  white-space: nowrap;
}

.count-cell svg {
  color:
    var(--primary);
}

.count-cell strong {
  color:
    var(--text-primary);

  font-size: 11px;
}

.count-cell span {
  color:
    var(--text-muted);

  font-size: 9px;
}

/* SCORE */

.score-scale {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding:
    5px 8px;

  border:
    1px solid var(--border);

  border-radius: 6px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

.score-scale svg {
  color:
    var(--orange);
}

.passing-score {
  color:
    var(--text-primary);

  white-space: nowrap;
}

/* WEIGHT */

.weight-cell {
  width: 120px;
}

.weight-cell strong {
  display: block;

  margin-bottom: 5px;

  color:
    var(--text-primary);

  font-size: 10px;
}

.weight-track {
  overflow: hidden;

  height: 5px;

  border-radius: 20px;

  background:
    var(--border-soft);
}

.weight-bar {
  height: 100%;

  border-radius: inherit;

  background:
    var(--green);
}

/* USAGE */

.usage-cell {
  min-width: 85px;
}

.usage-cell strong,
.usage-cell span {
  display: block;
}

.usage-cell strong {
  color:
    var(--text-primary);

  font-size: 11px;
}

.usage-cell span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 9px;
}

/* STATUS */

.status-badge {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

.status-dot {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background:
    currentColor;
}

.status-badge.active {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.status-badge.draft {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.status-badge.inactive {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.status-badge.archived {
  background:
    var(--bg-card-soft);

  color:
    var(--text-muted);
}

.created-by {
  color:
    var(--text-primary);

  white-space: nowrap;
}

.updated-date {
  white-space: nowrap;
}

/* ACTION */

.action-button {
  display: flex;

  width: 32px;
  height: 32px;

  align-items: center;
  justify-content: center;

  border:
    1px solid transparent;

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);
}

.action-button:hover {
  border-color:
    var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}

/* EMPTY */

.empty-state {
  display: flex;

  min-height: 260px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 8px;

  color:
    var(--text-muted);
}

.empty-state strong {
  color:
    var(--text-primary);

  font-size: 12px;
}

.empty-state span {
  font-size: 10px;
}
</style>