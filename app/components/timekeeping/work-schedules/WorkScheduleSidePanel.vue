<script setup lang="ts">
import {
  Clock3,
  Plus,
  Users,
} from 'lucide-vue-next'

defineProps<{
  summary: {
    name: string
    employees: number
  }[]
}>()

const emit = defineEmits<{
  add: []
  assign: []
}>()
</script>

<template>
  <aside class="schedule-side">

    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon purple">
          <Clock3 :size="17" />
        </div>

        <div>
          <h3>
            Schedule Summary
          </h3>

          <p>
            Employee assignment by schedule.
          </p>
        </div>

      </div>

      <div class="summary-list">

        <div
          v-for="item in summary"
          :key="item.name"
          class="summary-row"
        >
          <span>
            {{ item.name }}
          </span>

          <strong>
            {{ item.employees }}
          </strong>
        </div>

      </div>

    </article>

    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon blue">
          <Clock3 :size="17" />
        </div>

        <div>
          <h3>
            Quick Actions
          </h3>

          <p>
            Common schedule management tasks.
          </p>
        </div>

      </div>

      <div class="quick-list">

        <button
          type="button"
          @click="emit('add')"
        >
          <Plus :size="15" />
          Add Work Schedule
        </button>

        <button
          type="button"
          @click="emit('assign')"
        >
          <Users :size="15" />
          Assign Employees
        </button>

      </div>

    </article>

  </aside>
</template>

<style scoped>
.schedule-side {
  display: flex;

  flex-direction: column;

  gap: 14px;
}

.side-card {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.side-heading {
  display: flex;

  align-items: center;

  gap: 10px;

  padding: 14px;

  border-bottom:
    1px solid var(--border-soft);
}

.side-icon {
  display: flex;

  width: 38px;
  height: 38px;

  align-items: center;
  justify-content: center;

  border-radius: 9px;
}

.side-icon.purple {
  background: var(--purple-soft);
  color: var(--purple);
}

.side-icon.blue {
  background: var(--primary-soft);
  color: var(--primary);
}

.side-heading h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 13px;
}

.side-heading p {
  margin: 4px 0 0;

  color: var(--text-muted);

  font-size: 10px;
}

.summary-list {
  padding: 5px 14px 10px;
}

.summary-row {
  display: flex;

  min-height: 43px;

  align-items: center;
  justify-content: space-between;

  border-bottom:
    1px solid var(--border-soft);
}

.summary-row:last-child {
  border-bottom: 0;
}

.summary-row span {
  color: var(--text-secondary);

  font-size: 10px;
}

.summary-row strong {
  color: var(--primary);

  font-size: 11px;
}

.quick-list {
  padding: 8px;
}

.quick-list button {
  display: flex;

  width: 100%;
  min-height: 44px;

  align-items: center;

  gap: 10px;

  padding: 0 11px;

  border: 0;
  border-radius: 7px;

  background: transparent;

  color: var(--text-secondary);

  font-size: 10px;

  text-align: left;
}

.quick-list button:hover {
  background: var(--bg-card-soft);
  color: var(--primary);
}

@media (max-width: 1100px) {
  .schedule-side {
    display: grid;

    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .schedule-side {
    grid-template-columns: 1fr;
  }
}
</style>