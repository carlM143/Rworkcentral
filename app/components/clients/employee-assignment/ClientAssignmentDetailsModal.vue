<script setup lang="ts">
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Pencil,
  SquareUserRound,
  UserRound,
  X,
  XCircle,
} from 'lucide-vue-next'

import type {
  ClientEmployeeAssignment,
} from '~/types/clientEmployeeAssignment'

defineProps<{
  open: boolean

  assignment:
    ClientEmployeeAssignment |
    null
}>()

const emit =
  defineEmits<{
    close: []

    edit: [
      assignment:
        ClientEmployeeAssignment,
    ]

    employee: [
      assignment:
        ClientEmployeeAssignment,
    ]

    activate: [
      assignment:
        ClientEmployeeAssignment,
    ]

    end: [
      assignment:
        ClientEmployeeAssignment,
    ]
  }>()

const formatDate = (
  value?: string,
) => {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month:
        'short',

      day:
        'numeric',

      year:
        'numeric',
    },
  ).format(
    new Date(
      `${value}T00:00:00`,
    ),
  )
}
</script>

<template>
  <Teleport to="body">

    <Transition name="modal-fade">

      <div
        v-if="
          open &&
          assignment
        "
        class="modal-overlay"
        @click.self="
          emit('close')
        "
      >

        <article class="modal-card">

          <header class="modal-header">

            <div class="header-main">

              <div class="header-icon">

                <SquareUserRound
                  :size="18"
                />

              </div>

              <div>

                <h2>
                  Employee Assignment
                </h2>

                <p>
                  Assignment #{{ assignment.id }}
                </p>

              </div>

            </div>

            <button
              type="button"
              class="close-button"
              @click="
                emit('close')
              "
            >

              <X :size="18" />

            </button>

          </header>

          <div class="modal-body">

            <!-- STATUS -->

            <div class="status-bar">

              <div>

                <span>
                  STATUS
                </span>

                <StatusBadge
                  :status="
                    assignment.status
                  "
                />

              </div>

              <div>

                <span>
                  TYPE
                </span>

                <strong>
                  {{ assignment.assignmentType }}
                </strong>

              </div>

            </div>

            <!-- EMPLOYEE -->

            <section>

              <h3>
                Employee
              </h3>

              <div class="profile-card">

                <div class="profile-icon blue">

                  <UserRound
                    :size="18"
                  />

                </div>

                <div>

                  <strong>
                    {{ assignment.employeeName }}
                  </strong>

                  <span>
                    {{ assignment.employeeNumber }}
                    ·
                    {{ assignment.department }}
                    ·
                    {{ assignment.position }}
                  </span>

                </div>

              </div>

            </section>

            <!-- CLIENT -->

            <section>

              <h3>
                Assigned Client
              </h3>

              <div class="profile-card">

                <div class="profile-icon purple">

                  <Building2
                    :size="18"
                  />

                </div>

                <div>

                  <strong>
                    {{ assignment.clientName }}
                  </strong>

                  <span>
                    {{ assignment.clientCode }}
                  </span>

                </div>

              </div>

            </section>

            <!-- DATES -->

            <section>

              <h3>
                Assignment Period
              </h3>

              <div class="date-grid">

                <div>

                  <CalendarDays
                    :size="15"
                  />

                  <span>
                    Assignment Date
                  </span>

                  <strong>
                    {{
                      formatDate(
                        assignment.assignmentDate,
                      )
                    }}
                  </strong>

                </div>

                <div>

                  <CalendarDays
                    :size="15"
                  />

                  <span>
                    End Date
                  </span>

                  <strong>
                    {{
                      formatDate(
                        assignment.endDate,
                      )
                    }}
                  </strong>

                </div>

              </div>

            </section>

            <!-- META -->

            <section>

              <h3>
                Assignment Information
              </h3>

              <div class="meta-grid">

                <div>

                  <span>
                    Assigned By
                  </span>

                  <strong>
                    {{ assignment.assignedBy }}
                  </strong>

                </div>

                <div>

                  <span>
                    Remarks
                  </span>

                  <strong>
                    {{
                      assignment.remarks ||
                      'No remarks'
                    }}
                  </strong>

                </div>

              </div>

            </section>

          </div>

          <footer class="modal-footer">

            <AppButton
              variant="secondary"
              :icon="UserRound"
              @click="
                emit(
                  'employee',
                  assignment,
                )
              "
            >
              View Employee
            </AppButton>

            <AppButton
              variant="secondary"
              :icon="Pencil"
              @click="
                emit(
                  'edit',
                  assignment,
                )
              "
            >
              Edit
            </AppButton>

            <AppButton
              v-if="
                assignment.status ===
                'Pending'
              "
              :icon="CheckCircle2"
              @click="
                emit(
                  'activate',
                  assignment,
                )
              "
            >
              Activate
            </AppButton>

            <AppButton
              v-if="
                assignment.status ===
                'Active'
              "
              variant="secondary"
              :icon="XCircle"
              @click="
                emit(
                  'end',
                  assignment,
                )
              "
            >
              End Assignment
            </AppButton>

          </footer>

        </article>

      </div>

    </Transition>

  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  z-index: 99990;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background:
    rgba(3, 10, 24, 0.78);

  backdrop-filter:
    blur(4px);
}

.modal-card {
  width: 100%;
  max-width: 620px;

  border:
    1px solid var(--border);

  border-radius: 14px;

  background:
    var(--bg-card);

  box-shadow:
    0 25px 70px
    rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 16px 18px;

  border-bottom:
    1px solid var(--border);
}

.header-main {
  display: flex;

  align-items: center;

  gap: 10px;
}

.header-icon {
  display: flex;

  width: 39px;
  height: 39px;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.modal-header h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

.modal-header p {
  margin: 3px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.close-button {
  display: flex;

  width: 31px;
  height: 31px;

  align-items: center;
  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);
}

.modal-body {
  padding: 17px 18px;
}

.status-bar {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 8px;

  margin-bottom: 18px;
}

.status-bar > div {
  padding: 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.status-bar span {
  display: block;

  margin-bottom: 5px;

  color:
    var(--text-muted);

  font-size: 6.5px;
}

.status-bar strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

section + section {
  margin-top: 17px;
}

section h3 {
  margin:
    0 0 7px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.profile-card {
  display: flex;

  align-items: center;

  gap: 9px;

  padding: 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.profile-icon {
  display: flex;

  width: 36px;
  height: 36px;

  align-items: center;
  justify-content: center;

  border-radius: 8px;
}

.profile-icon.blue {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.profile-icon.purple {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.profile-card strong,
.profile-card span {
  display: block;
}

.profile-card strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.profile-card span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 7px;
}

.date-grid,
.meta-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.date-grid > div,
.meta-grid > div {
  padding: 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.date-grid svg {
  margin-bottom: 5px;

  color:
    var(--primary);
}

.date-grid span,
.date-grid strong,
.meta-grid span,
.meta-grid strong {
  display: block;
}

.date-grid span,
.meta-grid span {
  color:
    var(--text-muted);

  font-size: 7px;
}

.date-grid strong,
.meta-grid strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 8px;
}

.modal-footer {
  display: flex;

  justify-content: flex-end;

  flex-wrap: wrap;

  gap: 7px;

  padding: 13px 18px;

  border-top:
    1px solid var(--border);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition:
    opacity 0.18s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 650px) {
  .status-bar,
  .date-grid,
  .meta-grid {
    grid-template-columns:
      1fr;
  }
}
</style>