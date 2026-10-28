<script setup lang="ts">
import {
  ShieldCheck,
  Check,
  Eye,
  UserRound,
  X,
  Settings2,
} from 'lucide-vue-next'

import type {
  PermissionLevel,
  PermissionMatrixRow,
} from '~/types/rolePermission'

import type {
  SystemUserRole,
} from '~/types/userAccess'

defineProps<{
  rows:
    PermissionMatrixRow[]
}>()

const roleColumns:
  SystemUserRole[] = [
    'Administrator',
    'HR Administrator',
    'Supervisor',
    'Employee',
  ]

const permissionClass = (
  permission:
    PermissionLevel,
) => {
  return permission
    .toLowerCase()
    .replace(/\s+/g, '-')
}

const iconFor = (
  permission:
    PermissionLevel,
) => {
  switch (permission) {
    case 'Full Access':
      return ShieldCheck

    case 'Manage':
      return Settings2

    case 'Approve':
      return Check

    case 'View':
      return Eye

    case 'Self Only':
      return UserRound

    default:
      return X
  }
}
</script>

<template>
  <article class="matrix-card">

    <div class="card-heading">

      <div>
        <h3>
          Permission Matrix
        </h3>

        <p>
          Compare module access across system roles.
        </p>
      </div>

    </div>

    <div class="matrix-scroll">

      <table class="permission-table">

        <thead>
          <tr>
            <th>
              Module
            </th>

            <th
              v-for="role in roleColumns"
              :key="role"
            >
              {{ role }}
            </th>
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="row in rows"
            :key="row.id"
          >
            <td>
              <strong>
                {{ row.module }}
              </strong>
            </td>

            <td
              v-for="role in roleColumns"
              :key="role"
            >

              <span
                class="permission-badge"
                :class="
                  permissionClass(
                    row.permissions[
                      role
                    ],
                  )
                "
              >

                <component
                  :is="
                    iconFor(
                      row.permissions[
                        role
                      ],
                    )
                  "
                  :size="13"
                />

                {{
                  row.permissions[
                    role
                  ]
                }}

              </span>

            </td>
          </tr>

        </tbody>

      </table>

    </div>

  </article>
</template>

<style scoped>
.matrix-card {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.card-heading {
  padding: 15px 16px;

  border-bottom:
    1px solid var(--border-soft);
}

.card-heading h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 14px;
  font-weight: 700;
}

.card-heading p {
  margin: 5px 0 0;

  color: var(--text-muted);

  font-size: 11px;
}

.matrix-scroll {
  overflow-x: auto;
}

.permission-table {
  width: 100%;

  min-width: 920px;

  border-collapse: collapse;
}

.permission-table th {
  padding: 12px 14px;

  border-bottom:
    1px solid var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 10px;
  font-weight: 700;

  text-align: left;

  white-space: nowrap;
}

.permission-table td {
  padding: 12px 14px;

  border-bottom:
    1px solid var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 11px;

  vertical-align: middle;
}

.permission-table tbody tr:last-child td {
  border-bottom: 0;
}

.permission-table tbody tr:hover {
  background: var(--bg-card-soft);
}

.permission-table td:first-child strong {
  color: var(--text-primary);

  font-size: 11px;
}

.permission-badge {
  display: inline-flex;

  min-height: 27px;

  align-items: center;

  gap: 5px;

  padding: 4px 8px;

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

.permission-badge.full-access {
  background: var(--green-soft);
  color: var(--green);
}

.permission-badge.manage {
  background: var(--primary-soft);
  color: var(--primary);
}

.permission-badge.approve {
  background: var(--purple-soft);
  color: var(--purple);
}

.permission-badge.view {
  background: var(--bg-card-soft);
  color: var(--text-secondary);
}

.permission-badge.self-only {
  background: var(--orange-soft);
  color: var(--orange);
}

.permission-badge.no-access {
  background: var(--red-soft);
  color: var(--red);
}
</style>