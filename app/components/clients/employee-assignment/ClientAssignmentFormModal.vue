<script setup lang="ts">
import {
  Building2,
  CalendarDays,
  Save,
  UserPlus,
  UserRound,
  X,
} from 'lucide-vue-next'

import type {
  Employee,
} from '~/types/employee'

import type {
  ClientDirectoryRecord,
} from '~/composables/useClientDirectory'

import type {
  ClientAssignmentFormData,
  ClientEmployeeAssignment,
} from '~/types/clientEmployeeAssignment'

const props =
  defineProps<{
    open: boolean

    assignment:
      ClientEmployeeAssignment |
      null

    employees:
      Employee[]

    clients:
      ClientDirectoryRecord[]
  }>()

const emit =
  defineEmits<{
    close: []

    save: [
      data:
        ClientAssignmentFormData,
    ]
  }>()

const isEditing =
  computed(() => {
    return Boolean(
      props.assignment,
    )
  })

const today = () => {
  return new Date()
    .toISOString()
    .slice(
      0,
      10,
    )
}

const form =
  reactive<ClientAssignmentFormData>({
    employeeId: 0,

    clientId: 0,

    assignmentDate:
      today(),

    endDate:
      undefined,

    assignmentType:
      'Primary',

    status:
      'Pending',

    remarks:
      '',
  })

const selectedEmployee =
  computed(() => {
    return props.employees.find(
      employee =>
        employee.id ===
        Number(
          form.employeeId,
        ),
    )
  })

const selectedClient =
  computed(() => {
    return props.clients.find(
      client =>
        client.id ===
        Number(
          form.clientId,
        ),
    )
  })

const resetForm = () => {
  form.employeeId =
    props.assignment?.employeeId ??
    0

  form.clientId =
    props.assignment?.clientId ??
    0

  form.assignmentDate =
    props.assignment?.assignmentDate ??
    today()

  form.endDate =
    props.assignment?.endDate

  form.assignmentType =
    props.assignment?.assignmentType ??
    'Primary'

  form.status =
    props.assignment?.status ??
    'Pending'

  form.remarks =
    props.assignment?.remarks ??
    ''
}

watch(
  [
    () =>
      props.open,

    () =>
      props.assignment,
  ],
  () => {
    if (
      props.open
    ) {
      resetForm()
    }
  },
  {
    immediate: true,
  },
)

const handleSubmit = () => {
  if (
    !form.employeeId ||
    !form.clientId ||
    !form.assignmentDate
  ) {
    return
  }

  emit(
    'save',
    {
      ...form,

      employeeId:
        Number(
          form.employeeId,
        ),

      clientId:
        Number(
          form.clientId,
        ),

      endDate:
        form.endDate ||
        undefined,

      remarks:
        form.remarks?.trim() ||
        undefined,
    },
  )
}
</script>

<template>
  <Teleport to="body">

    <Transition name="modal-fade">

      <div
        v-if="open"
        class="modal-overlay"
        @click.self="
          emit('close')
        "
      >

        <article class="modal-card">

          <!-- HEADER -->

          <header class="modal-header">

            <div class="header-main">

              <div class="header-icon">

                <UserPlus
                  :size="18"
                />

              </div>

              <div>

                <h2>
                  {{
                    isEditing
                      ? 'Edit Employee Assignment'
                      : 'Assign Employee'
                  }}
                </h2>

                <p>
                  {{
                    isEditing
                      ? 'Update the employee deployment information.'
                      : 'Assign an RWorkCentral employee to an external client.'
                  }}
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

          <!-- BODY -->

          <div class="modal-body">

            <!-- EMPLOYEE -->

            <section class="form-section">

              <div class="section-heading">

                <UserRound :size="15" />

                <div>

                  <h3>
                    Employee
                  </h3>

                  <p>
                    Select the employee to deploy.
                  </p>

                </div>

              </div>

              <label class="field">

                <span>
                  Employee *
                </span>

                <select
                  v-model.number="
                    form.employeeId
                  "
                >

                  <option
                    :value="0"
                    disabled
                  >
                    Select employee
                  </option>

                  <option
                    v-for="
                      employee in employees
                    "
                    :key="
                      employee.id
                    "
                    :value="
                      employee.id
                    "
                  >
                    {{ employee.employeeNumber }}
                    -
                    {{ employee.firstName }}
                    {{ employee.lastName }}
                  </option>

                </select>

              </label>

              <div
                v-if="
                  selectedEmployee
                "
                class="selection-card"
              >

                <div class="selection-icon blue">

                  <UserRound
                    :size="16"
                  />

                </div>

                <div>

                  <strong>
                    {{ selectedEmployee.firstName }}
                    {{ selectedEmployee.lastName }}
                  </strong>

                  <span>
                    {{ selectedEmployee.employeeNumber }}
                    ·
                    {{ selectedEmployee.department }}
                    ·
                    {{ selectedEmployee.position }}
                  </span>

                </div>

              </div>

            </section>

            <!-- CLIENT -->

            <section class="form-section">

              <div class="section-heading">

                <Building2 :size="15" />

                <div>

                  <h3>
                    Client Assignment
                  </h3>

                  <p>
                    Choose where the employee will be deployed.
                  </p>

                </div>

              </div>

              <label class="field">

                <span>
                  Client *
                </span>

                <select
                  v-model.number="
                    form.clientId
                  "
                >

                  <option
                    :value="0"
                    disabled
                  >
                    Select client
                  </option>

                  <option
                    v-for="
                      item in clients
                    "
                    :key="
                      item.id
                    "
                    :value="
                      item.id
                    "
                  >
                    {{ item.code }}
                    -
                    {{ item.name }}
                  </option>

                </select>

              </label>

              <div
                v-if="
                  selectedClient
                "
                class="selection-card"
              >

                <div class="selection-icon purple">

                  <Building2
                    :size="16"
                  />

                </div>

                <div>

                  <strong>
                    {{ selectedClient.name }}
                  </strong>

                  <span>
                    {{ selectedClient.code }}
                    ·
                    {{ selectedClient.address }}
                  </span>

                </div>

              </div>

            </section>

            <!-- DETAILS -->

            <section class="form-section">

              <div class="section-heading">

                <CalendarDays
                  :size="15"
                />

                <div>

                  <h3>
                    Assignment Details
                  </h3>

                  <p>
                    Configure deployment date, type and status.
                  </p>

                </div>

              </div>

              <div class="form-grid">

                <label class="field">

                  <span>
                    Assignment Date *
                  </span>

                  <input
                    v-model="
                      form.assignmentDate
                    "
                    type="date"
                  >

                </label>

                <label class="field">

                  <span>
                    End Date
                  </span>

                  <input
                    v-model="
                      form.endDate
                    "
                    type="date"
                  >

                </label>

                <label class="field">

                  <span>
                    Assignment Type *
                  </span>

                  <select
                    v-model="
                      form.assignmentType
                    "
                  >

                    <option value="Primary">
                      Primary
                    </option>

                    <option value="Temporary">
                      Temporary
                    </option>

                    <option value="Reliever">
                      Reliever
                    </option>

                    <option value="Project-Based">
                      Project-Based
                    </option>

                  </select>

                </label>

                <label class="field">

                  <span>
                    Status *
                  </span>

                  <select
                    v-model="
                      form.status
                    "
                  >

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Active">
                      Active
                    </option>

                    <option value="Ended">
                      Ended
                    </option>

                    <option value="Transferred">
                      Transferred
                    </option>

                  </select>

                </label>

              </div>

              <label class="field remarks">

                <span>
                  Remarks
                </span>

                <textarea
                  v-model="
                    form.remarks
                  "
                  rows="4"
                  placeholder="Enter assignment remarks..."
                />

              </label>

            </section>

          </div>

          <!-- FOOTER -->

          <footer class="modal-footer">

            <AppButton
              variant="secondary"
              @click="
                emit('close')
              "
            >
              Cancel
            </AppButton>

            <AppButton
              :icon="Save"
              @click="
                handleSubmit
              "
            >
              {{
                isEditing
                  ? 'Save Changes'
                  : 'Assign Employee'
              }}
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
  max-width: 720px;

  max-height:
    calc(100vh - 40px);

  overflow-y: auto;

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
  position: sticky;
  z-index: 5;
  top: 0;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding: 16px 18px;

  border-bottom:
    1px solid var(--border);

  background:
    var(--bg-card);
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

  flex-shrink: 0;

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

  cursor: pointer;
}

.modal-body {
  padding: 17px 18px;
}

.form-section + .form-section {
  margin-top: 18px;
}

.section-heading {
  display: flex;

  align-items: center;

  gap: 8px;

  margin-bottom: 9px;

  color:
    var(--primary);
}

.section-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 10px;
}

.section-heading p {
  margin: 2px 0 0;

  color:
    var(--text-muted);

  font-size: 7px;
}

.field {
  display: flex;

  flex-direction: column;

  gap: 5px;
}

.field span {
  color:
    var(--text-secondary);

  font-size: 8px;
  font-weight: 600;
}

.field input,
.field select,
.field textarea {
  box-sizing: border-box;

  width: 100%;

  border:
    1px solid var(--border);

  border-radius: 7px;

  outline: 0;

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);

  font-family:
    inherit;

  font-size: 9px;
}

.field input,
.field select {
  height: 39px;

  padding:
    0 10px;
}

.field textarea {
  padding: 10px;

  resize: vertical;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color:
    var(--primary);
}

.selection-card {
  display: flex;

  align-items: center;

  gap: 9px;

  margin-top: 8px;

  padding: 9px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.selection-icon {
  display: flex;

  width: 34px;
  height: 34px;

  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 8px;
}

.selection-icon.blue {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.selection-icon.purple {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.selection-card strong,
.selection-card span {
  display: block;
}

.selection-card strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.selection-card span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7px;
}

.form-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 10px;
}

.remarks {
  margin-top: 10px;
}

.modal-footer {
  position: sticky;
  z-index: 5;
  bottom: 0;

  display: flex;
  justify-content: flex-end;

  gap: 7px;

  padding: 13px 18px;

  border-top:
    1px solid var(--border);

  background:
    var(--bg-card);
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
  .form-grid {
    grid-template-columns:
      1fr;
  }

  .modal-footer {
    align-items: stretch;

    flex-direction:
      column-reverse;
  }
}
</style>