<script setup lang="ts">
<<<<<<< Updated upstream
import {
  BriefcaseBusiness,
  Building2,
  MoreHorizontal,
  Users,
} from 'lucide-vue-next'
=======
import { BriefcaseBusiness, Building2 } from 'lucide-vue-next'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import PositionActions from '~/components/departments/positions/PositionActions.vue'
import type { Position } from '~/types/position'
>>>>>>> Stashed changes

defineProps<{ positions: Position[] }>()
const emit = defineEmits<{ edit: [position: Position]; delete: [position: Position] }>()

<<<<<<< Updated upstream
defineProps<{
  positions:
    Position[]
}>()

const formatCurrency = (
  value?: number,
) => {
  if (
    value === undefined
  ) {
    return '—'
  }

  return new Intl.NumberFormat(
    'en-PH',
    {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    },
  ).format(value)
}

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

const levelClass = (
  level:
    PositionLevel,
) => {
  if (
    level ===
    'Manager' ||
    level ===
    'Executive'
  ) {
    return 'manager'
  }

  if (
    level ===
    'Supervisor'
  ) {
    return 'supervisor'
  }

  if (
    level ===
    'Senior'
  ) {
    return 'senior'
  }

  if (
    level ===
    'Entry Level'
  ) {
    return 'entry'
  }

  return 'staff'
}

const statusClass = (
  status:
    PositionStatus,
) => {
  return status ===
    'Active'
    ? 'active'
    : 'inactive'
}

const vacancyCount = (
  item: Position,
) => {
  return Math.max(
    0,
    item.approvedHeadcount -
      item.currentHeadcount,
  )
}
=======
const formatDate = (value: string) => value
  ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  : '—'
>>>>>>> Stashed changes
</script>

<template>
  <BaseDataTable
    title="Positions & Designations"
    description="Manage job positions, their departments, descriptions and availability."
    :has-rows="positions.length > 0"
    min-width="950px"
    empty-title="No positions found"
    empty-description="Try changing your position filters."
  >
    <template #headers>
      <th>Position</th>
      <th>Department</th>
      <th>Description</th>
      <th>Status</th>
      <th>Last Updated</th>
      <th class="action-column" />
    </template>

    <template #rows>
      <tr v-for="item in positions" :key="item.id">
        <td>
          <div class="position-cell">
            <div class="position-info">
              <strong>{{ item.name }}</strong>
            </div>
          </div>
        </td>

        <td>
          <div class="department-cell">
            <Building2 :size="13" />
            <strong>{{ item.department }}</strong>
          </div>
        </td>

        <td><p class="description">{{ item.description }}</p></td>

        <td>
          <span class="status-badge" :class="item.status === 'Active' ? 'active' : 'inactive'">
            <span class="status-dot" />{{ item.status }}
          </span>
        </td>

        <td><span class="updated-date">{{ formatDate(item.updatedAt) }}</span></td>

        <td class="action-column">
          <PositionActions :position="item" @edit="emit('edit', $event)" @delete="emit('delete', $event)" />
        </td>
      </tr>
    </template>

    <template #empty>
      <div class="position-empty">
        <BriefcaseBusiness :size="34" />
        <strong>No positions found</strong>
        <span>Try changing your position filters.</span>
      </div>
<<<<<<< Updated upstream

    </div>

    <!-- TABLE -->

    <div
      v-if="
        positions.length
      "
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Position</th>
            <th>Department</th>
            <th>Level</th>
            <th>Description</th>
            <th>Headcount</th>
            <th>Approved Slots</th>
            <th>Vacancies</th>
            <th>Salary Range</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              item in positions
            "
            :key="
              item.id
            "
          >

            <!-- POSITION -->

            <td>

              <div class="position-cell">

                <div class="position-icon">

                  <BriefcaseBusiness
                    :size="16"
                  />

                </div>

                <div>

                  <strong>
                    {{
                      item.name
                    }}
                  </strong>

                  <span>
                    {{
                      item.code
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- DEPARTMENT -->

            <td>

              <div class="department-cell">

                <Building2
                  :size="13"
                />

                <strong>
                  {{
                    item.department
                  }}
                </strong>

              </div>

            </td>

            <!-- LEVEL -->

            <td>

              <span
                class="level-badge"
                :class="
                  levelClass(
                    item.level,
                  )
                "
              >
                {{
                  item.level
                }}
              </span>

            </td>

            <!-- DESCRIPTION -->

            <td>

              <p class="description">
                {{
                  item.description
                }}
              </p>

            </td>

            <!-- CURRENT -->

            <td>

              <div class="headcount-cell">

                <Users
                  :size="13"
                />

                <strong>
                  {{
                    item.currentHeadcount
                  }}
                </strong>

                <span>
                  employees
                </span>

              </div>

            </td>

            <!-- APPROVED -->

            <td>

              <strong class="approved-headcount">
                {{
                  item.approvedHeadcount
                }}
              </strong>

            </td>

            <!-- VACANCIES -->

            <td>

              <span
                class="vacancy-badge"
                :class="{
                  available:
                    vacancyCount(
                      item,
                    ) > 0,
                  full:
                    vacancyCount(
                      item,
                    ) === 0,
                }"
              >

                {{
                  vacancyCount(
                    item,
                  )
                }}

                {{
                  vacancyCount(
                    item,
                  ) === 1
                    ? 'vacancy'
                    : 'vacancies'
                }}

              </span>

            </td>

            <!-- SALARY -->

            <td>

              <div class="salary-cell">

                <strong>
                  {{
                    formatCurrency(
                      item.minimumSalary,
                    )
                  }}
                </strong>

                <span>
                  to
                </span>

                <strong>
                  {{
                    formatCurrency(
                      item.maximumSalary,
                    )
                  }}
                </strong>

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

                {{
                  item.status
                }}

              </span>

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
                title="Actions will be added later"
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

      <BriefcaseBusiness
        :size="34"
      />

      <strong>
        No positions found
      </strong>

      <span>
        Try changing your position filters.
      </span>

    </div>

  </article>
=======
    </template>
  </BaseDataTable>
>>>>>>> Stashed changes
</template>

<style scoped>
.position-cell{display:flex;min-width:190px;align-items:center;gap:9px}
.position-icon{display:flex;width:35px;height:35px;flex-shrink:0;align-items:center;justify-content:center;border-radius:8px;background:var(--primary-soft);color:var(--primary)}
.position-info{min-width:0}
.position-info strong,.position-info span{display:block}
.position-info strong{color:var(--text-primary);font-size:10px}
.position-info span{margin-top:3px;color:var(--primary);font-size:9px;font-weight:600}
.department-cell{display:flex;align-items:center;gap:6px;min-width:145px;color:var(--text-primary)}
.department-cell svg{color:var(--text-muted)}
.description{max-width:460px;margin:0;color:var(--text-secondary);font-size:10px;line-height:1.5}
.status-badge{display:inline-flex;align-items:center;gap:5px;padding:5px 8px;border-radius:20px;font-size:9px;font-weight:650;white-space:nowrap}
.status-dot{width:5px;height:5px;border-radius:50%;background:currentColor}
.status-badge.active{background:var(--green-soft);color:var(--green)}
.status-badge.inactive{background:var(--red-soft);color:var(--red)}
.updated-date{white-space:nowrap;font-size:10px}
.action-column{width:65px;text-align:right!important}
.position-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--text-muted)}
.position-empty strong{color:var(--text-primary);font-size:12px}
.position-empty span{font-size:10px}
</style>