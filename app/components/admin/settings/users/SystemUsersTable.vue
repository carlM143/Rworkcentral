<script setup lang="ts">
import {
  UserRound,
  Eye,
  Pencil,
  ShieldCheck,
  ShieldOff,
} from 'lucide-vue-next'

import type {
  SystemUser,
} from '~/types/userAccess'

defineProps<{
  users: SystemUser[]
}>()

const emit = defineEmits<{
  view: [user: SystemUser]
  edit: [user: SystemUser]
}>()

const formatLogin = (
  value?: string,
) => {
  if (!value) {
    return 'Never'
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    },
  ).format(
    new Date(value),
  )
}

const getInitials = (
  name: string,
) => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(
      part =>
        part.charAt(0),
    )
    .join('')
    .toUpperCase()
}
</script>

<template>
  <article class="users-card">

    <div class="table-heading">
      <div>
        <h3>
          System Users
        </h3>

        <p>
          Manage HRIS users, roles,
          account status and security access.
        </p>
      </div>
    </div>

    <div
      v-if="users.length"
      class="table-scroll"
    >
      <table class="users-table">

        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Department</th>
            <th>Status</th>
            <th>2FA</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="user in users"
            :key="user.id"
          >

            <td>
              <div class="user-cell">

                <div class="user-avatar">
                  {{
                    getInitials(
                      user.name,
                    )
                  }}
                </div>

                <div>
                  <strong>
                    {{ user.name }}
                  </strong>

                  <span>
                    {{ user.email }}
                  </span>

                  <small
                    v-if="
                      user.employeeNumber
                    "
                  >
                    {{ user.employeeNumber }}
                  </small>
                </div>

              </div>
            </td>

            <td>
              <span class="role-badge">
                {{ user.role }}
              </span>
            </td>

            <td>
              {{
                user.department ||
                'System'
              }}
            </td>

            <td>
              <StatusBadge
                :status="user.status"
              />
            </td>

            <td>
              <div
                class="security-status"
                :class="{
                  enabled:
                    user.twoFactorEnabled,
                }"
              >

                <component
                  :is="
                    user.twoFactorEnabled
                      ? ShieldCheck
                      : ShieldOff
                  "
                  :size="15"
                />

                <span>
                  {{
                    user.twoFactorEnabled
                      ? 'Enabled'
                      : 'Not Enabled'
                  }}
                </span>

              </div>
            </td>

            <td>
              {{
                formatLogin(
                  user.lastLogin,
                )
              }}
            </td>

            <td>
              <div class="row-actions">

                <button
                  type="button"
                  title="View user"
                  @click="
                    emit(
                      'view',
                      user,
                    )
                  "
                >
                  <Eye :size="15" />
                </button>

                <button
                  v-if="user.employeeId"
                  type="button"
                  title="Edit user"
                  @click="
                    emit(
                      'edit',
                      user,
                    )
                  "
                >
                  <Pencil :size="15" />
                </button>

              </div>
            </td>

          </tr>
        </tbody>

      </table>
    </div>

    <div
      v-else
      class="empty-state"
    >
      <UserRound :size="26" />

      <strong>
        No system users found
      </strong>

      <span>
        Try changing your search or filters.
      </span>
    </div>

  </article>
</template>

<style scoped>
.users-card {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

/* HEADER */

.table-heading {
  padding: 15px 16px;

  border-bottom: 1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 14px;
  font-weight: 700;
}

.table-heading p {
  margin: 5px 0 0;

  color: var(--text-muted);

  font-size: 11px;
  line-height: 1.5;
}

/* TABLE */

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.users-table {
  width: 100%;
  min-width: 1150px;

  border-collapse: collapse;
}

.users-table th {
  padding: 12px 14px;

  border-bottom: 1px solid var(--border);

  background: var(--bg-card-soft);
  color: var(--text-secondary);

  font-size: 10px;
  font-weight: 700;

  text-align: left;
  text-transform: uppercase;

  white-space: nowrap;
}

.users-table td {
  padding: 13px 14px;

  border-bottom: 1px solid var(--border-soft);

  color: var(--text-secondary);

  font-size: 11px;

  vertical-align: middle;
}

.users-table tbody tr:last-child td {
  border-bottom: 0;
}

.users-table tbody tr:hover {
  background: var(--bg-card-soft);
}

/* USER */

.user-cell {
  display: flex;

  min-width: 245px;

  align-items: center;

  gap: 10px;
}

.user-avatar {
  display: flex;

  width: 38px;
  height: 38px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: var(--primary-soft);
  color: var(--primary);

  font-size: 10px;
  font-weight: 700;
}

.user-cell strong,
.user-cell span,
.user-cell small {
  display: block;
}

.user-cell strong {
  color: var(--text-primary);

  font-size: 12px;
  font-weight: 650;
}

.user-cell span {
  margin-top: 3px;

  color: var(--text-muted);

  font-size: 9px;
}

.user-cell small {
  margin-top: 2px;

  color: var(--primary);

  font-size: 8px;
}

/* ROLE */

.role-badge {
  display: inline-flex;

  min-height: 26px;

  align-items: center;

  padding: 4px 9px;

  border-radius: 20px;

  background: var(--purple-soft);
  color: var(--purple);

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

/* STATUS */

.users-card :deep(.status-badge) {
  min-height: 27px;

  padding: 4px 10px;

  font-size: 10px;

  white-space: nowrap;
}

/* SECURITY */

.security-status {
  display: inline-flex;

  align-items: center;

  gap: 6px;

  color: var(--orange);

  font-size: 10px;

  white-space: nowrap;
}

.security-status.enabled {
  color: var(--green);
}

/* ACTIONS */

.row-actions {
  display: flex;

  gap: 5px;
}

.row-actions button {
  display: flex;

  width: 32px;
  height: 32px;

  align-items: center;
  justify-content: center;

  border: 1px solid var(--border);
  border-radius: 7px;

  background: transparent;
  color: var(--text-secondary);

  cursor: pointer;
}

.row-actions button:hover {
  border-color: var(--primary);

  background: var(--primary-soft);
  color: var(--primary);
}

/* EMPTY */

.empty-state {
  display: flex;

  min-height: 250px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 8px;

  color: var(--text-muted);
}

.empty-state strong {
  color: var(--text-primary);

  font-size: 13px;
}

.empty-state span {
  font-size: 10px;
}
</style>
