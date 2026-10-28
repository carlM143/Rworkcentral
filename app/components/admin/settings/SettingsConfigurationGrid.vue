<script setup lang="ts">
import {
  Building2,
  Users,
  Clock3,
  WalletCards,
  CalendarDays,
  Workflow,
  Bell,
  Settings2,
  ArrowRight,
} from 'lucide-vue-next'

import type {
  SettingsModule,
} from '~/types/settings'

defineProps<{
  modules: SettingsModule[]
}>()

const emit = defineEmits<{
  open: [
    module:
      SettingsModule,
  ]
}>()

const iconFor = (
  category: string,
) => {
  switch (category) {
    case 'Company':
      return Building2

    case 'Users':
      return Users

    case 'Timekeeping':
      return Clock3

    case 'Payroll':
      return WalletCards

    case 'Leave & Overtime':
      return CalendarDays

    case 'Approval':
      return Workflow

    case 'Notifications':
      return Bell

    default:
      return Settings2
  }
}

const iconTone = (
  index: number,
) => {
  const tones = [
    'blue',
    'green',
    'orange',
    'purple',
  ]

  return tones[
    index %
    tones.length
  ]
}
</script>

<template>
  <article class="configuration-card">

    <div class="card-heading">

      <div>
        <h3>
          Configuration
        </h3>

        <p>
          Manage HRIS configuration,
          access control and company preferences.
        </p>
      </div>

    </div>

    <div class="configuration-grid">

      <button
        v-for="(
          module,
          index
        ) in modules"
        :key="module.id"
        type="button"
        class="configuration-item"
        @click="
          emit(
            'open',
            module,
          )
        "
      >

        <div
          class="configuration-icon"
          :class="
            iconTone(index)
          "
        >
          <component
            :is="
              iconFor(
                module.category,
              )
            "
            :size="20"
          />
        </div>

        <div class="configuration-content">

          <div class="configuration-title">

            <h4>
              {{ module.title }}
            </h4>

            <ArrowRight :size="16" />

          </div>

          <p>
            {{ module.description }}
          </p>

          <div class="settings-items">

            <span
              v-for="item in module.items"
              :key="item"
            >
              {{ item }}
            </span>

          </div>

          <div class="configuration-footer">

            <span
              class="configuration-status"
              :class="
                module.status
                  .toLowerCase()
                  .replace(/\s+/g, '-')
              "
            >
              {{ module.status }}
            </span>

            <span class="manage-text">
              Manage Settings
            </span>

          </div>

        </div>

      </button>

    </div>

  </article>
</template>

<style scoped>
.configuration-card {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

/* HEADER */

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

  line-height: 1.5;
}

/* GRID */

.configuration-grid {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 12px;

  padding: 14px;
}

.configuration-item {
  display: flex;

  min-width: 0;

  align-items: flex-start;

  gap: 12px;

  padding: 14px;

  border: 1px solid var(--border-soft);
  border-radius: 10px;

  background: var(--bg-card-soft);
  color: inherit;

  text-align: left;

  cursor: pointer;

  transition:
    border-color 0.15s ease,
    transform 0.15s ease,
    background 0.15s ease;
}

.configuration-item:hover {
  border-color: var(--primary);

  background: var(--bg-card);

  transform: translateY(-1px);
}

.configuration-icon {
  display: flex;

  width: 42px;
  height: 42px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 10px;
}

.configuration-icon.blue {
  background: var(--primary-soft);
  color: var(--primary);
}

.configuration-icon.green {
  background: var(--green-soft);
  color: var(--green);
}

.configuration-icon.orange {
  background: var(--orange-soft);
  color: var(--orange);
}

.configuration-icon.purple {
  background: var(--purple-soft);
  color: var(--purple);
}

/* CONTENT */

.configuration-content {
  min-width: 0;

  flex: 1;
}

.configuration-title {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 12px;
}

.configuration-title h4 {
  margin: 0;

  color: var(--text-primary);

  font-size: 13px;
  font-weight: 700;
}

.configuration-title svg {
  flex-shrink: 0;

  color: var(--text-muted);
}

.configuration-content > p {
  margin: 6px 0 0;

  color: var(--text-secondary);

  font-size: 10px;

  line-height: 1.5;
}

/* ITEMS */

.settings-items {
  display: flex;

  flex-wrap: wrap;

  gap: 6px;

  margin-top: 10px;
}

.settings-items span {
  display: inline-flex;

  padding: 4px 7px;

  border: 1px solid var(--border-soft);
  border-radius: 5px;

  background: var(--bg-card);

  color: var(--text-muted);

  font-size: 9px;
}

/* FOOTER */

.configuration-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  margin-top: 12px;
}

.configuration-status {
  display: inline-flex;

  min-height: 26px;

  align-items: center;

  padding: 4px 9px;

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;
}

.configuration-status.complete {
  background: var(--green-soft);
  color: var(--green);
}

.configuration-status.needs-review {
  background: var(--orange-soft);
  color: var(--orange);
}

.configuration-status.not-configured {
  background: var(--red-soft);
  color: var(--red);
}

.manage-text {
  color: var(--primary);

  font-size: 9px;
  font-weight: 600;
}

/* RESPONSIVE */

@media (max-width: 750px) {
  .configuration-grid {
    grid-template-columns: 1fr;
  }
}
</style>