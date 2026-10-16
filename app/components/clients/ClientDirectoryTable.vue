<script setup lang="ts">
import {
  Building2,
  Users,
  Eye,
  Pencil,
} from 'lucide-vue-next'

import type {
  Client,
} from '~/types/client'

defineProps<{
  clients: Client[]
}>()

const emit = defineEmits<{
  view: [client: Client]
  edit: [client: Client]
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
    new Date(
      `${value}T00:00:00`,
    ),
  )
}
</script>

<template>
  <article class="client-table-card">

    <div class="table-heading">
      <div>
        <h3>
          Client Directory
        </h3>

        <p>
          Manage client accounts, contracts
          and employee assignments.
        </p>
      </div>
    </div>

    <div
      v-if="clients.length"
      class="table-scroll"
    >
      <table class="client-table">

        <thead>
          <tr>
            <th>Client</th>
            <th>Contact Person</th>
            <th>Branches</th>
            <th>Employees</th>
            <th>Contract End</th>
            <th>Contract</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="client in clients"
            :key="client.id"
          >

            <td>
              <div class="client-cell">

                <div class="client-icon">
                  <Building2 :size="16" />
                </div>

                <div>
                  <strong>
                    {{ client.name }}
                  </strong>

                  <span>
                    {{ client.code }}

                    <template v-if="client.industry">
                      · {{ client.industry }}
                    </template>
                  </span>
                </div>

              </div>
            </td>

            <td>
              <div class="contact-cell">
                <strong>
                  {{ client.contactPerson }}
                </strong>

                <span>
                  {{ client.email || 'No email' }}
                </span>
              </div>
            </td>

            <td>
              {{ client.branches }}
            </td>

            <td>
              <div class="employee-count">
                <Users :size="13" />

                <strong>
                  {{ client.assignedEmployees }}
                </strong>
              </div>
            </td>

            <td>
              {{ formatDate(client.contractEnd) }}
            </td>

            <td>
              <StatusBadge
                :status="client.contractStatus"
              />
            </td>

            <td>
              <StatusBadge
                :status="client.status"
              />
            </td>

            <td>
              <div class="row-actions">

                <button
                  type="button"
                  title="View client"
                  @click="
                    emit(
                      'view',
                      client,
                    )
                  "
                >
                  <Eye :size="14" />
                </button>

                <button
                  type="button"
                  title="Edit client"
                  @click="
                    emit(
                      'edit',
                      client,
                    )
                  "
                >
                  <Pencil :size="14" />
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
      <Building2 :size="25" />

      <strong>
        No clients found
      </strong>

      <span>
        Try changing your filters.
      </span>
    </div>

  </article>
</template>

<style scoped>
.client-table-card {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.table-heading {
  padding: 13px 15px;

  border-bottom:
    1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 11px;
}

.table-heading p {
  margin: 3px 0 0;

  color: var(--text-muted);

  font-size: 8px;
}

.table-scroll {
  overflow-x: auto;
}

.client-table {
  width: 100%;
  min-width: 1100px;

  border-collapse: collapse;
}

.client-table th {
  padding: 10px 12px;

  border-bottom:
    1px solid var(--border);

  background: var(--bg-card-soft);

  color: var(--text-secondary);

  font-size: 8px;
  font-weight: 650;

  text-align: left;
  text-transform: uppercase;
}

.client-table td {
  padding: 11px 12px;

  border-bottom:
    1px solid var(--border-soft);

  color: var(--text-secondary);

  font-size: 9px;
}

.client-table tbody tr:last-child td {
  border-bottom: 0;
}

.client-table tbody tr:hover {
  background: var(--bg-card-soft);
}

.client-cell {
  display: flex;
  align-items: center;

  gap: 8px;
}

.client-icon {
  display: flex;

  width: 34px;
  height: 34px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: var(--primary-soft);
  color: var(--primary);
}

.client-cell strong,
.client-cell span,
.contact-cell strong,
.contact-cell span {
  display: block;
}

.client-cell strong,
.contact-cell strong {
  color: var(--text-primary);

  font-size: 9px;
}

.client-cell span,
.contact-cell span {
  margin-top: 2px;

  color: var(--text-muted);

  font-size: 7px;
}

.employee-count {
  display: flex;
  align-items: center;

  gap: 5px;
}

.employee-count strong {
  color: var(--text-primary);
}

.row-actions {
  display: flex;
  align-items: center;

  gap: 5px;
}

.row-actions button {
  display: flex;

  width: 29px;
  height: 29px;

  align-items: center;
  justify-content: center;

  border: 1px solid var(--border);
  border-radius: 6px;

  background: transparent;

  color: var(--text-secondary);

  cursor: pointer;
}

.row-actions button:hover {
  background: var(--primary-soft);
  color: var(--primary);
}

.empty-state {
  display: flex;

  min-height: 240px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 7px;

  color: var(--text-muted);
}

.empty-state strong {
  color: var(--text-primary);
}
</style>