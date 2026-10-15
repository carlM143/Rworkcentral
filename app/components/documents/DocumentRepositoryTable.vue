<script setup lang="ts">
import {
  FileText,
  Eye,
  Download,
} from 'lucide-vue-next'

import type {
  DocumentRecord,
} from '~/types/document'

defineProps<{
  documents: DocumentRecord[]
}>()

const emit = defineEmits<{
  view: [document: DocumentRecord]
  download: [document: DocumentRecord]
}>()

const formatDate = (
  value?: string,
) => {
  if (!value) {
    return 'No expiry'
  }

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
  <article class="documents-card">

    <div class="table-heading">
      <div>
        <h3>
          Document Repository
        </h3>

        <p>
          Review employee documents,
          verification status and expiration dates.
        </p>
      </div>
    </div>

    <div
      v-if="documents.length"
      class="table-scroll"
    >
      <table class="documents-table">

        <thead>
          <tr>
            <th>Employee</th>
            <th>Document</th>
            <th>Category</th>
            <th>Uploaded</th>
            <th>Expiration</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="document in documents"
            :key="document.id"
          >

            <td>
              <div class="employee-cell">

                <div class="employee-avatar">
                  {{
                    document.employeeName
                      .split(' ')
                      .map(name =>
                        name.charAt(0),
                      )
                      .slice(0, 2)
                      .join('')
                  }}
                </div>

                <div>
                  <strong>
                    {{ document.employeeName }}
                  </strong>

                  <span>
                    {{ document.employeeNumber }}
                    ·
                    {{ document.department }}
                  </span>
                </div>

              </div>
            </td>

            <td>
              <div class="document-cell">

                <div class="document-icon">
                  <FileText :size="16" />
                </div>

                <div>
                  <strong>
                    {{ document.documentType }}
                  </strong>

                  <span>
                    {{ document.fileName }}
                  </span>
                </div>

              </div>
            </td>

            <td>
              <span class="category-badge">
                {{ document.category }}
              </span>
            </td>

            <td>
              {{ formatDate(document.uploadedAt) }}
            </td>

            <td>
              {{ formatDate(document.expiresAt) }}
            </td>

            <td>
              <StatusBadge
                :status="document.status"
              />
            </td>

            <td>
              <div class="row-actions">

                <button
                  type="button"
                  title="View document"
                  @click="
                    emit(
                      'view',
                      document,
                    )
                  "
                >
                  <Eye :size="15" />
                </button>

                <button
                  type="button"
                  title="Download document"
                  @click="
                    emit(
                      'download',
                      document,
                    )
                  "
                >
                  <Download :size="15" />
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
      <FileText :size="25" />

      <strong>
        No documents found
      </strong>

      <span>
        Try changing your search or filters.
      </span>
    </div>

  </article>
</template>

<style scoped>
.documents-card {
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

.documents-table {
  width: 100%;
  min-width: 1100px;

  border-collapse: collapse;
}

.documents-table th {
  padding: 12px 14px;

  border-bottom: 1px solid var(--border);

  background: var(--bg-card-soft);
  color: var(--text-secondary);

  font-size: 10px;
  font-weight: 700;

  text-align: left;
  text-transform: uppercase;

  letter-spacing: 0.2px;

  white-space: nowrap;
}

.documents-table td {
  padding: 13px 14px;

  border-bottom: 1px solid var(--border-soft);

  color: var(--text-secondary);

  font-size: 11px;

  vertical-align: middle;
}

.documents-table tbody tr:last-child td {
  border-bottom: 0;
}

.documents-table tbody tr:hover {
  background: var(--bg-card-soft);
}

/* EMPLOYEE */

.employee-cell,
.document-cell {
  display: flex;

  align-items: center;

  gap: 10px;
}

.employee-avatar,
.document-icon {
  display: flex;

  width: 38px;
  height: 38px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: var(--primary-soft);
  color: var(--primary);
}

.employee-avatar {
  font-size: 10px;
  font-weight: 700;
}

.employee-cell strong,
.document-cell strong {
  display: block;

  color: var(--text-primary);

  font-size: 12px;
  font-weight: 650;
}

.employee-cell span,
.document-cell span {
  display: block;

  margin-top: 4px;

  color: var(--text-muted);

  font-size: 9px;
}

/* CATEGORY */

.category-badge {
  display: inline-flex;

  min-height: 25px;

  align-items: center;

  padding: 4px 9px;

  border-radius: 20px;

  background: var(--purple-soft);
  color: var(--purple);

  font-size: 9px;
  font-weight: 650;
}

/* STATUS */

.documents-card :deep(.status-badge) {
  min-height: 27px;

  padding: 4px 10px;

  font-size: 10px;
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