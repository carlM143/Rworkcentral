
<script setup lang="ts">


import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
} from 'vue'

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
  House,
} from 'lucide-vue-next'


import type {
  WfhApproval,
} from '~/types/wfhApproval'


const props = defineProps<{
  open: boolean
  requests: WfhApproval[]
}>()

const emit = defineEmits<{
  close: []
}>()

const today = new Date()

const displayedMonth = ref(
  new Date(today.getFullYear(), today.getMonth(), 1),
)

const selectedDate = ref(
  [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-'),
)

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const approvedRequests = computed(() => {
  return props.requests.filter(
    request => request.status === 'Approved',
  )
})

const monthTitle = computed(() => {
  return displayedMonth.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
})

const dateKey = (date: Date) => {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

const calendarDays = computed(() => {
  const year = displayedMonth.value.getFullYear()
  const month = displayedMonth.value.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days: Array<string | null> = []

  for (let i = 0; i < firstWeekday; i++) {
    days.push(null)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(dateKey(new Date(year, month, day)))
  }

  while (days.length % 7 !== 0) {
    days.push(null)
  }

  return days
})

const requestsOnDate = (date: string) => {
  return approvedRequests.value.filter(
    request =>
      request.startDate <= date &&
      request.endDate >= date,
  )
}

const selectedRequests = computed(() => {
  return requestsOnDate(selectedDate.value)
})

const isToday = (date: string) => {
  return date === dateKey(new Date())
}

const changeMonth = (offset: number) => {
  displayedMonth.value = new Date(
    displayedMonth.value.getFullYear(),
    displayedMonth.value.getMonth() + offset,
    1,
  )
}

const formatDate = (date: string) => {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    },
  )
}

const close = () => {
  emit('close')
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.open) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="schedule-overlay"
      @click.self="close"
    >
      <section
        class="schedule-modal"
        role="dialog"
        aria-modal="true"
        aria-label="WFH Schedule"
      >
        <header class="schedule-header">
          <div class="heading">
            <div class="heading-icon">
              <CalendarDays :size="19" />
            </div>

            <div>
              <h2>WFH Schedule</h2>
              <p>View approved employee remote-work schedules.</p>
            </div>
          </div>

          <button
            type="button"
            class="icon-button"
            aria-label="Close schedule"
            @click="close"
          >
            <X :size="18" />
          </button>
        </header>

        <div class="schedule-content">
          <div class="calendar-panel">
            <div class="calendar-navigation">
              <h3>{{ monthTitle }}</h3>

              <div class="navigation-actions">
                <button
                  type="button"
                  aria-label="Previous month"
                  @click="changeMonth(-1)"
                >
                  <ChevronLeft :size="17" />
                </button>

                <button
                  type="button"
                  aria-label="Next month"
                  @click="changeMonth(1)"
                >
                  <ChevronRight :size="17" />
                </button>
              </div>
            </div>

            <div class="calendar-grid">
              <span
                v-for="weekday in weekdays"
                :key="weekday"
                class="weekday"
              >
                {{ weekday }}
              </span>

              <template
                v-for="(date, index) in calendarDays"
                :key="date ?? `empty-${index}`"
              >
                <button
                  v-if="date"
                  type="button"
                  class="calendar-day"
                  :class="{
                    selected: selectedDate === date,
                    today: isToday(date),
                    'has-requests': requestsOnDate(date).length > 0,
                  }"
                  @click="selectedDate = date"
                >
                  <span>{{ Number(date.slice(-2)) }}</span>

                  <small
                    v-if="requestsOnDate(date).length"
                    class="request-indicator"
                  >
                    {{ requestsOnDate(date).length }}
                  </small>
                </button>

                <span v-else class="calendar-empty" />
              </template>
            </div>
          </div>

          <div class="schedule-details">
            <div class="details-heading">
              <h3>{{ formatDate(selectedDate) }}</h3>
              <p>
                {{ selectedRequests.length }} approved WFH
                {{ selectedRequests.length === 1 ? 'request' : 'requests' }}
              </p>
            </div>

            <div class="request-list">
              <article
                v-for="request in selectedRequests"
                :key="request.id"
                class="schedule-request"
              >
                <div class="request-icon">
                  <House :size="16" />
                </div>

                <div class="request-content">
                  <strong>{{ request.employeeName }}</strong>
                  <span>{{ request.department }} · {{ request.position }}</span>
                  <small>{{ request.requestType }}</small>
                  <p>{{ request.workLocation }}</p>
                </div>
              </article>

              <div
                v-if="!selectedRequests.length"
                class="empty-schedule"
              >
                <CalendarDays :size="24" />
                <strong>No approved WFH requests</strong>
                <p>No scheduled WFH requests for this date.</p>
              </div>
            </div>
          </div>
        </div>

        <footer class="schedule-footer">
          <span>
            Only approved WFH requests are displayed.
          </span>

          <button type="button" @click="close">
            Close
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.schedule-overlay {
  position: fixed;
  inset: 0;
  z-index: 10050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(3, 9, 23, 0.76);
  backdrop-filter: blur(5px);
}

.schedule-modal {
  display: flex;
  width: 100%;
  max-width: 950px;
  max-height: 90vh;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
}

.schedule-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 17px;
  border-bottom: 1px solid var(--border);
}

.heading {
  display: flex;
  align-items: center;
  gap: 11px;
}

.heading-icon,
.request-icon {
  display: flex;
  width: 39px;
  height: 39px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--primary);
}

.heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
}

.heading p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.icon-button,
.navigation-actions button {
  display: inline-flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.schedule-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  min-height: 0;
  overflow-y: auto;
}

.calendar-panel {
  min-width: 0;
  padding: 18px;
}

.calendar-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 17px;
}

.calendar-navigation h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 13px;
}

.navigation-actions {
  display: flex;
  gap: 7px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 7px;
}

.weekday {
  padding: 9px 0;
  color: var(--text-muted);
  font-size: 10px;
  text-align: center;
}

.calendar-day,
.calendar-empty {
  display: flex;
  min-height: 62px;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
  padding: 10px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-size: 11px;
}

.calendar-day {
  cursor: pointer;
}

.calendar-day:hover,
.calendar-day.selected {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.calendar-day.today > span {
  color: var(--primary);
  font-weight: 700;
}

.request-indicator {
  display: inline-flex;
  min-width: 19px;
  height: 19px;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border-radius: 5px;
  background: var(--green-soft);
  color: var(--green);
  font-size: 9px;
  font-weight: 700;
}

.schedule-details {
  min-width: 0;
  border-left: 1px solid var(--border);
}

.details-heading {
  padding: 19px 15px;
  border-bottom: 1px solid var(--border-soft);
}

.details-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 12px;
}

.details-heading p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.request-list {
  padding: 12px;
}

.schedule-request {
  display: flex;
  gap: 10px;
  margin-bottom: 9px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
}

.request-icon {
  width: 32px;
  height: 32px;
}

.request-content {
  min-width: 0;
}

.request-content strong,
.request-content span,
.request-content small {
  display: block;
}

.request-content strong {
  color: var(--text-primary);
  font-size: 11px;
}

.request-content span,
.request-content small {
  margin-top: 5px;
  color: var(--text-muted);
  font-size: 9px;
}

.request-content small {
  color: var(--green);
}

.request-content p {
  margin: 6px 0 0;
  color: var(--text-secondary);
  font-size: 10px;
}

.empty-schedule {
  display: flex;
  min-height: 170px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  color: var(--text-muted);
}

.empty-schedule strong {
  color: var(--text-primary);
  font-size: 11px;
}

.empty-schedule p {
  margin: 0;
  font-size: 10px;
}

.schedule-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 18px;
  border-top: 1px solid var(--border);
}

.schedule-footer span {
  color: var(--text-muted);
  font-size: 10px;
}

.schedule-footer button {
  min-height: 34px;
  padding: 0 15px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
}

@media (max-width: 750px) {
  .schedule-content {
    grid-template-columns: 1fr;
  }

  .schedule-details {
    border-top: 1px solid var(--border);
    border-left: 0;
  }

  .calendar-day {
    min-height: 48px;
    padding: 6px;
  }
}
</style>
