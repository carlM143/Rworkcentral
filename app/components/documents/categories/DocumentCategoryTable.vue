<script setup lang="ts">
import {
  CalendarClock,
  FileKey2,
  Files,
  FolderOpen,
  MoreHorizontal,
  ShieldCheck,
} from 'lucide-vue-next'

import type {
  DocumentCategory,
  DocumentCategoryScope,
  DocumentCategoryStatus,
} from '~/types/documentCategory'

defineProps<{
  categories:
    DocumentCategory[]
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

const scopeClass = (
  scope:
    DocumentCategoryScope,
) => {
  if (
    scope ===
    'Employee'
  ) {
    return 'employee'
  }

  if (
    scope ===
    'Company'
  ) {
    return 'company'
  }

  return 'both'
}

const statusClass = (
  status:
    DocumentCategoryStatus,
) => {
  return status ===
    'Active'
    ? 'active'
    : 'inactive'
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Document Categories
        </h3>

        <p>
          Configure document classifications,
          requirements, expiration tracking and
          document scope.
        </p>

      </div>

    </div>

    <div
      v-if="
        categories.length
      "
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Category</th>
            <th>Scope</th>
            <th>Description</th>
            <th>Documents</th>
            <th>Required</th>
            <th>Expiry Tracking</th>
            <th>Document No.</th>
            <th>Status</th>
            <th>Created By</th>
            <th>Last Updated</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              item in categories
            "
            :key="
              item.id
            "
          >

            <!-- CATEGORY -->

            <td>

              <div class="category-cell">

                <div class="category-icon">

                  <FolderOpen
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

            <!-- SCOPE -->

            <td>

              <span
                class="scope-badge"
                :class="
                  scopeClass(
                    item.scope,
                  )
                "
              >
                {{
                  item.scope
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

            <!-- DOCUMENT COUNT -->

            <td>

              <div class="document-count">

                <Files
                  :size="14"
                />

                <strong>
                  {{
                    item.documentCount
                  }}
                </strong>

                <span>
                  files
                </span>

              </div>

            </td>

            <!-- REQUIRED -->

            <td>

              <span
                class="rule-badge"
                :class="
                  item.isRequired
                    ? 'required'
                    : 'optional'
                "
              >

                <ShieldCheck
                  :size="12"
                />

                {{
                  item.isRequired
                    ? 'Required'
                    : 'Optional'
                }}

              </span>

            </td>

            <!-- EXPIRY -->

            <td>

              <span
                class="feature-value"
                :class="{
                  enabled:
                    item.requiresExpiryDate,
                }"
              >

                <CalendarClock
                  :size="13"
                />

                {{
                  item.requiresExpiryDate
                    ? 'Tracked'
                    : 'Not Required'
                }}

              </span>

            </td>

            <!-- DOCUMENT NUMBER -->

            <td>

              <span
                class="feature-value"
                :class="{
                  enabled:
                    item.requiresDocumentNumber,
                }"
              >

                <FileKey2
                  :size="13"
                />

                {{
                  item.requiresDocumentNumber
                    ? 'Required'
                    : 'Optional'
                }}

              </span>

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

            <!-- CREATED BY -->

            <td>

              <strong class="created-by">
                {{
                  item.createdBy
                }}
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

    <div
      v-else
      class="empty-state"
    >

      <FolderOpen
        :size="34"
      />

      <strong>
        No document categories found
      </strong>

      <span>
        Try changing your document category filters.
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

  min-width: 1850px;

  border-collapse:
    collapse;
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

  text-transform:
    uppercase;

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

/* CATEGORY */

.category-cell {
  display: flex;

  min-width: 215px;

  align-items: center;

  gap: 9px;
}

.category-icon {
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

.category-cell strong,
.category-cell span {
  display: block;
}

.category-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.category-cell span {
  margin-top: 3px;

  color:
    var(--primary);

  font-size: 9px;
  font-weight: 650;
}

/* SCOPE */

.scope-badge {
  display: inline-flex;

  padding:
    5px 9px;

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

.scope-badge.employee {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.scope-badge.company {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.scope-badge.both {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

/* DESCRIPTION */

.description {
  width: 275px;

  margin: 0;

  color:
    var(--text-secondary);

  font-size: 10px;

  line-height: 1.45;
}

/* COUNT */

.document-count {
  display: flex;

  align-items: center;

  gap: 5px;

  white-space: nowrap;
}

.document-count svg {
  color:
    var(--primary);
}

.document-count strong {
  color:
    var(--text-primary);

  font-size: 11px;
}

.document-count span {
  color:
    var(--text-muted);

  font-size: 9px;
}

/* REQUIRED */

.rule-badge {
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

.rule-badge.required {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.rule-badge.optional {
  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);
}

/* FEATURES */

.feature-value {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  color:
    var(--text-muted);

  font-size: 9px;

  white-space: nowrap;
}

.feature-value.enabled {
  color:
    var(--green);
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

.status-badge.inactive {
  background:
    var(--red-soft);

  color:
    var(--red);
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