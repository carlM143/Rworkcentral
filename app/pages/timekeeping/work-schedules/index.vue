<script setup lang="ts">
import {
  Plus,
  RotateCcw,
} from 'lucide-vue-next'

import AddWorkScheduleModal from '~/components/timekeeping/work-schedules/AddWorkScheduleModal.vue'

import AssignEmployeesModal from '~/components/timekeeping/work-schedules/AssignEmployeesModal.vue'

import ManageRestDaysModal from '~/components/timekeeping/work-schedules/ManageRestDaysModal.vue'

import EditWorkScheduleModal from '~/components/timekeeping/work-schedules/EditWorkScheduleModal.vue'

import type {
  WorkSchedule,
  WorkScheduleFormData,
} from '~/types/workSchedule'

/* =========================================================
   WORK SCHEDULES
========================================================= */

const {
  schedules,

  search,
  type,
  status,

  filteredSchedules,

  stats,
  scheduleSummary,
  recentActivity,

  resetFilters,
} = useWorkSchedules()

/* =========================================================
   EMPLOYEES
========================================================= */

const {
  employees,
} = useEmployees()

/* =========================================================
   TOAST
========================================================= */

const {
  info,
  success,
} = useToast()

/* =========================================================
   MODALS
========================================================= */

const addScheduleOpen =
  ref(false)

const assignEmployeesOpen =
  ref(false)

const manageRestDaysOpen =
  ref(false)

const editScheduleOpen =
  ref(false)

/* =========================================================
   SELECTED SCHEDULES
========================================================= */

const selectedScheduleForEdit =
  ref<WorkSchedule | null>(
    null,
  )

const selectedScheduleForAction =
  ref<WorkSchedule | null>(
    null,
  )

/* =========================================================
   SCHEDULE ORDER FOR ACTION MODALS
========================================================= */

const actionModalSchedules =
  computed(() => {
    const selected =
      selectedScheduleForAction
        .value

    if (!selected) {
      return schedules.value
    }

    return [
      selected,

      ...schedules.value.filter(
        schedule =>
          schedule.id !==
          selected.id,
      ),
    ]
  })

/* =========================================================
   LOCAL DATE
========================================================= */

const getToday = () => {
  const now =
    new Date()

  const local =
    new Date(
      now.getTime() -
      now.getTimezoneOffset() *
        60000,
    )

  return local
    .toISOString()
    .slice(0, 10)
}

/* =========================================================
   MOCK EMPLOYEE ASSIGNMENTS
========================================================= */

const createInitialAssignments =
  () => {
    const assignments:
      Record<
        number,
        number | null
      > = {}

    let employeeIndex =
      0

    schedules.value.forEach(
      schedule => {
        for (
          let index = 0;
          index <
          schedule.employeeCount;
          index++
        ) {
          const employee =
            employees.value[
              employeeIndex
            ]

          if (!employee) {
            break
          }

          assignments[
            employee.id
          ] =
            schedule.id

          employeeIndex++
        }
      },
    )

    employees.value.forEach(
      employee => {
        if (
          assignments[
            employee.id
          ] === undefined
        ) {
          assignments[
            employee.id
          ] = null
        }
      },
    )

    return assignments
  }

const employeeScheduleAssignments =
  ref<
    Record<
      number,
      number | null
    >
  >(
    createInitialAssignments(),
  )

/* =========================================================
   FILTER OPTIONS
========================================================= */

const scheduleTypes = [
  'Regular',
  'Morning Shift',
  'Night Shift',
  'Flexible',
]

const statusOptions = [
  'Active',
  'Inactive',
]

/* =========================================================
   ADD SCHEDULE
========================================================= */

const handleAddSchedule = () => {
  addScheduleOpen.value =
    true
}

/* =========================================================
   SUGGESTED SCHEDULE CODE
========================================================= */

const suggestedScheduleCode =
  computed(() => {
    const highestNumber =
      schedules.value.reduce(
        (
          highest,
          schedule,
        ) => {
          const number =
            Number(
              schedule.code.replace(
                'WS-',
                '',
              ),
            )

          return Number.isNaN(
            number,
          )
            ? highest
            : Math.max(
                highest,
                number,
              )
        },
        0,
      )

    return `WS-${String(
      highestNumber + 1,
    ).padStart(
      3,
      '0',
    )}`
  })

/* =========================================================
   TIME FORMAT
========================================================= */

const formatTimeForDisplay = (
  value?: string,
) => {
  if (!value) {
    return undefined
  }

  const [
    hours = '0',
    minutes = '00',
  ] =
    value.split(':')

  const hour =
    Number(hours)

  const period =
    hour >= 12
      ? 'PM'
      : 'AM'

  const displayHour =
    hour % 12 || 12

  return `${String(
    displayHour,
  ).padStart(
    2,
    '0',
  )}:${minutes} ${period}`
}

/* =========================================================
   SAVE NEW SCHEDULE
========================================================= */

const handleSaveSchedule = (
  data:
    WorkScheduleFormData,
) => {
  const nextId =
    schedules.value.length
      ? Math.max(
          ...schedules.value.map(
            schedule =>
              schedule.id,
          ),
        ) + 1
      : 1

  const baseSchedule = {
    id:
      nextId,

    code:
      data.code,

    name:
      data.name,

    type:
      data.type,

    workHours:
      data.workHours,

    gracePeriod:
      data.gracePeriod,

    restDays: [
      ...data.restDays,
    ],

    employeeCount:
      0,

    status:
      data.status,
  }

  const newSchedule:
    WorkSchedule =
      data.type ===
      'Flexible'
        ? {
            ...baseSchedule,
          }
        : {
            ...baseSchedule,

            timeIn:
              formatTimeForDisplay(
                data.timeIn,
              ),

            timeOut:
              formatTimeForDisplay(
                data.timeOut,
              ),

            breakStart:
              formatTimeForDisplay(
                data.breakStart,
              ),

            breakEnd:
              formatTimeForDisplay(
                data.breakEnd,
              ),
          }

  schedules.value.unshift(
    newSchedule,
  )

  addScheduleOpen.value =
    false

  recentActivity.value.unshift({
    id:
      Date.now(),

    title:
      `${newSchedule.name} Created`,

    description:
      `New ${newSchedule.type} work schedule was created.`,

    performedBy:
      'Maria Santos',

    date:
      getToday(),
  })

  success(
    'Work Schedule Added',
    `${newSchedule.name} has been added to the schedule directory.`,
  )
}

/* =========================================================
   VIEW SCHEDULE
========================================================= */

const handleViewSchedule = (
  schedule:
    WorkSchedule,
) => {
  const workingHours =
    schedule.timeIn &&
    schedule.timeOut
      ? `${schedule.timeIn} - ${schedule.timeOut}`
      : 'Flexible'

  info(
    schedule.name,
    `${schedule.code} · ${workingHours} · ${schedule.employeeCount} employee(s) assigned.`,
  )
}

/* =========================================================
   EDIT SCHEDULE
========================================================= */

const handleEditSchedule = (
  schedule: WorkSchedule,
) => {
  selectedScheduleForEdit.value =
    schedule

  editScheduleOpen.value =
    true
}

const closeEditSchedule = () => {
  editScheduleOpen.value =
    false

  selectedScheduleForEdit.value =
    null
}

/* =========================================================
   SAVE EDITED SCHEDULE
========================================================= */

const handleSaveEditedSchedule = (
  payload: {
    scheduleId: number

    data:
      WorkScheduleFormData
  },
) => {
  const schedule =
    schedules.value.find(
      item =>
        item.id ===
        payload.scheduleId,
    )

  if (!schedule) {
    info(
      'Schedule Not Found',
      'The selected work schedule could not be found.',
    )

    return
  }

  const data =
    payload.data

  schedule.code =
    data.code

  schedule.name =
    data.name

  schedule.type =
    data.type

  schedule.workHours =
    data.workHours

  schedule.gracePeriod =
    data.gracePeriod

  schedule.restDays = [
    ...data.restDays,
  ]

  schedule.status =
    data.status

  if (
    data.type ===
    'Flexible'
  ) {
    delete schedule.timeIn

    delete schedule.timeOut

    delete schedule.breakStart

    delete schedule.breakEnd
  }
  else {
    schedule.timeIn =
      formatTimeForDisplay(
        data.timeIn,
      )

    schedule.timeOut =
      formatTimeForDisplay(
        data.timeOut,
      )

    schedule.breakStart =
      formatTimeForDisplay(
        data.breakStart,
      )

    schedule.breakEnd =
      formatTimeForDisplay(
        data.breakEnd,
      )
  }

  recentActivity.value.unshift({
    id:
      Date.now(),

    title:
      `${schedule.name} Updated`,

    description:
      'Work schedule information and configuration were updated.',

    performedBy:
      'Maria Santos',

    date:
      getToday(),
  })

  editScheduleOpen.value =
    false

  selectedScheduleForEdit
    .value =
    null

  success(
    'Schedule Updated',
    `${schedule.name} has been updated successfully.`,
  )
}

/* =========================================================
   QUICK ACTION — ASSIGN EMPLOYEES
========================================================= */

const handleAssignEmployees =
  () => {
    selectedScheduleForAction
      .value =
      null

    assignEmployeesOpen.value =
      true
  }

/* =========================================================
   ROW ACTION — ASSIGN EMPLOYEES
========================================================= */

const handleScheduleAssign = (
  schedule:
    WorkSchedule,
) => {
  selectedScheduleForAction
    .value =
    schedule

  assignEmployeesOpen.value =
    true
}

/* =========================================================
   UPDATE SCHEDULE COUNTS
========================================================= */

const updateScheduleCounts =
  () => {
    const counts:
      Record<
        number,
        number
      > = {}

    schedules.value.forEach(
      schedule => {
        counts[
          schedule.id
        ] = 0
      },
    )

    Object.values(
      employeeScheduleAssignments
        .value,
    ).forEach(
      scheduleId => {
        if (
          scheduleId ===
          null
        ) {
          return
        }

        if (
          counts[
            scheduleId
          ] === undefined
        ) {
          return
        }

        counts[
          scheduleId
        ]++
      },
    )

    schedules.value.forEach(
      schedule => {
        schedule.employeeCount =
          counts[
            schedule.id
          ] ?? 0
      },
    )
  }

/* =========================================================
   SAVE ASSIGNMENTS
========================================================= */

const handleSaveAssignments = (
  data: {
    scheduleId: number

    employeeIds: number[]

    effectiveDate: string
  },
) => {
  data.employeeIds.forEach(
    employeeId => {
      employeeScheduleAssignments
        .value[
          employeeId
        ] =
        data.scheduleId
    },
  )

  updateScheduleCounts()

  const schedule =
    schedules.value.find(
      item =>
        item.id ===
        data.scheduleId,
    )

  assignEmployeesOpen.value =
    false

  selectedScheduleForAction
    .value =
    null

  if (schedule) {
    recentActivity.value.unshift({
      id:
        Date.now(),

      title:
        'Employee Schedule Assigned',

      description:
        `${data.employeeIds.length} employee(s) were assigned to ${schedule.name}.`,

      performedBy:
        'Maria Santos',

      date:
        data.effectiveDate,
    })
  }

  success(
    'Employees Assigned',
    `${data.employeeIds.length} employee(s) successfully assigned to ${schedule?.name ?? 'the selected schedule'}.`,
  )
}

/* =========================================================
   CLOSE ASSIGN MODAL
========================================================= */

const closeAssignEmployees =
  () => {
    assignEmployeesOpen.value =
      false

    selectedScheduleForAction
      .value =
      null
  }

/* =========================================================
   QUICK ACTION — REST DAYS
========================================================= */

const handleRestDays =
  () => {
    selectedScheduleForAction
      .value =
      null

    manageRestDaysOpen.value =
      true
  }

/* =========================================================
   ROW ACTION — REST DAYS
========================================================= */

const handleScheduleRestDays = (
  schedule:
    WorkSchedule,
) => {
  selectedScheduleForAction
    .value =
    schedule

  manageRestDaysOpen.value =
    true
}

/* =========================================================
   SAVE REST DAYS
========================================================= */

const handleSaveRestDays = (
  data: {
    scheduleId: number

    restDays: string[]

    effectiveDate: string
  },
) => {
  const schedule =
    schedules.value.find(
      item =>
        item.id ===
        data.scheduleId,
    )

  if (!schedule) {
    info(
      'Schedule Not Found',
      'The selected work schedule could not be found.',
    )

    return
  }

  schedule.restDays = [
    ...data.restDays,
  ]

  recentActivity.value.unshift({
    id:
      Date.now(),

    title:
      `${schedule.name} Rest Days Updated`,

    description:
      `Default rest day configuration was updated to ${data.restDays.join(', ')}.`,

    performedBy:
      'Maria Santos',

    date:
      data.effectiveDate,
  })

  manageRestDaysOpen.value =
    false

  selectedScheduleForAction
    .value =
    null

  success(
    'Rest Days Updated',
    `${schedule.name} rest day configuration has been updated.`,
  )
}

/* =========================================================
   CLOSE REST DAYS
========================================================= */

const closeManageRestDays =
  () => {
    manageRestDaysOpen.value =
      false

    selectedScheduleForAction
      .value =
      null
  }

/* =========================================================
   VIEW ASSIGNED EMPLOYEES
========================================================= */

const handleViewAssignedEmployees = (
  schedule:
    WorkSchedule,
) => {
  const assignedIds =
    Object.entries(
      employeeScheduleAssignments
        .value,
    )
      .filter(
        (
          [
            ,
            scheduleId,
          ],
        ) =>
          scheduleId ===
          schedule.id,
      )
      .map(
        ([employeeId]) =>
          Number(employeeId),
      )

  const assignedNames =
    employees.value
      .filter(
        employee =>
          assignedIds.includes(
            employee.id,
          ),
      )
      .map(
        employee =>
          `${employee.firstName} ${employee.lastName}`,
      )

  if (!assignedNames.length) {
    info(
      schedule.name,
      'No employees are currently assigned to this schedule.',
    )

    return
  }

  info(
    `${schedule.name} Employees`,
    assignedNames.join(', '),
  )
}

/* =========================================================
   ACTIVATE / DEACTIVATE
========================================================= */

const handleToggleScheduleStatus = (
  schedule:
    WorkSchedule,
) => {
  const wasActive =
    schedule.status ===
    'Active'

  schedule.status =
    wasActive
      ? 'Inactive'
      : 'Active'

  recentActivity.value.unshift({
    id:
      Date.now(),

    title:
      `${schedule.name} ${wasActive ? 'Deactivated' : 'Activated'}`,

    description:
      `Work schedule status was changed to ${schedule.status}.`,

    performedBy:
      'Maria Santos',

    date:
      getToday(),
  })

  success(
    wasActive
      ? 'Schedule Deactivated'
      : 'Schedule Activated',

    `${schedule.name} is now ${schedule.status.toLowerCase()}.`,
  )
}
</script>

<template>
  <section class="work-schedules-page">

    <PageHeader
      title="Work Schedules"
      description="Manage employee work schedules, shifts, break times and rest day assignments."
    >

      <AppButton
        :icon="Plus"
        @click="
          handleAddSchedule
        "
      >
        Add Schedule
      </AppButton>

    </PageHeader>

    <WorkScheduleStats
      :stats="stats"
    />

    <!-- FILTER -->

    <div class="schedule-filters">

      <AppInput
        v-model="search"
        searchable
        clearable
        placeholder="Search schedule name or code..."
      />

      <AppSelect
        v-model="type"
        :options="
          scheduleTypes
        "
        placeholder="All Schedule Types"
      />

      <AppSelect
        v-model="status"
        :options="
          statusOptions
        "
        placeholder="All Status"
      />

      <AppButton
        variant="secondary"
        :icon="RotateCcw"
        @click="
          resetFilters
        "
      >
        Reset
      </AppButton>

    </div>

    <!-- CONTENT -->

    <div class="schedule-layout">

      <div class="schedule-main">

        <WorkScheduleDirectory
          :schedules="
            filteredSchedules
          "
          @view="
            handleViewSchedule
          "
          @edit="
            handleEditSchedule
          "
          @assign="
            handleScheduleAssign
          "
          @rest-days="
            handleScheduleRestDays
          "
          @employees="
            handleViewAssignedEmployees
          "
          @toggle-status="
            handleToggleScheduleStatus
          "
        />

        <RecentScheduleActivity
          :activities="
            recentActivity
          "
        />

      </div>

      <WorkScheduleSidePanel
        :summary="
          scheduleSummary
        "
        @add="
          handleAddSchedule
        "
        @assign="
          handleAssignEmployees
        "
        @rest-days="
          handleRestDays
        "
      />

    </div>

    <!-- ADD -->

    <AddWorkScheduleModal
      :open="
        addScheduleOpen
      "
      :suggested-code="
        suggestedScheduleCode
      "
      @close="
        addScheduleOpen =
          false
      "
      @save="
        handleSaveSchedule
      "
    />

    <!-- EDIT -->

    <EditWorkScheduleModal
      :open="editScheduleOpen"
      :schedule="selectedScheduleForEdit"
      @close="closeEditSchedule"
      @save="handleSaveEditedSchedule"
    />

    <!-- ASSIGN -->

    <AssignEmployeesModal
      :open="
        assignEmployeesOpen
      "
      :employees="
        employees
      "
      :schedules="
        actionModalSchedules
      "
      :assignments="
        employeeScheduleAssignments
      "
      @close="
        closeAssignEmployees
      "
      @save="
        handleSaveAssignments
      "
    />

    <!-- REST DAYS -->

    <ManageRestDaysModal
      :open="
        manageRestDaysOpen
      "
      :schedules="
        actionModalSchedules
      "
      @close="
        closeManageRestDays
      "
      @save="
        handleSaveRestDays
      "
    />

  </section>
</template>

<style scoped>
.work-schedules-page {
  width: 100%;

  max-width: 1660px;

  margin:
    0 auto;
}

.schedule-filters {
  display: grid;

  grid-template-columns:
    minmax(
      300px,
      1fr
    )
    220px
    170px
    auto;

  gap: 8px;

  margin-bottom: 14px;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 10px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

.schedule-layout {
  display: grid;

  grid-template-columns:
    minmax(
      0,
      1fr
    )
    310px;

  gap: 14px;
}

.schedule-main {
  display: flex;

  min-width: 0;

  flex-direction:
    column;

  gap: 14px;
}

@media (
  max-width: 1100px
) {
  .schedule-layout {
    grid-template-columns:
      1fr;
  }

  .schedule-filters {
    grid-template-columns:
      repeat(
        2,
        minmax(
          0,
          1fr
        )
      );
  }
}

@media (
  max-width: 650px
) {
  .schedule-filters {
    grid-template-columns:
      1fr;
  }
}
</style>