<script setup lang="ts">
import {
  UserRound,
  BriefcaseBusiness,
  Landmark,
  WalletCards,
  Phone,
  Files,
  ClipboardCheck,
  Check,
} from 'lucide-vue-next'

const props = defineProps<{
  currentStep: number
}>()

const emit = defineEmits<{
  change: [step: number]
}>()

const steps = [
  {
    number: 1,
    title: 'Personal',
    description: 'Basic information',
    icon: UserRound,
  },
  {
    number: 2,
    title: 'Employment',
    description: 'Work details',
    icon: BriefcaseBusiness,
  },
  {
    number: 3,
    title: 'Government',
    description: 'Government IDs',
    icon: Landmark,
  },
  {
    number: 4,
    title: 'Payroll',
    description: 'Salary details',
    icon: WalletCards,
  },
  {
    number: 5,
    title: 'Contact',
    description: 'Emergency contact',
    icon: Phone,
  },
  {
    number: 6,
    title: 'Employment Documents',
    description: 'Employment requirements',
    icon: Files,
  },
  {
    number: 7,
    title: 'Review',
    description: 'Review & save',
    icon: ClipboardCheck,
  },
]

const isCompleted = (step: number) => {
  return step < props.currentStep
}

const isActive = (step: number) => {
  return step === props.currentStep
}

const canNavigate = (step: number) => {
  return step <= props.currentStep
}

const selectStep = (step: number) => {
  if (!canNavigate(step)) return

  emit('change', step)
}
</script>

<template>
  <div class="employee-stepper">
    <div
      v-for="(step, index) in steps"
      :key="step.number"
      class="step-wrapper"
    >
      <button
        type="button"
        class="step-item"
        :class="{
          active: isActive(step.number),
          completed: isCompleted(step.number),
          disabled: !canNavigate(step.number),
        }"
        :disabled="!canNavigate(step.number)"
        @click="selectStep(step.number)"
      >
        <div class="step-circle">
          <Check
            v-if="isCompleted(step.number)"
            :size="14"
            :stroke-width="2.5"
          />

          <component
            :is="step.icon"
            v-else
            :size="14"
          />
        </div>

        <div class="step-info">
          <strong>
            {{ step.title }}
          </strong>

          <span>
            {{ step.description }}
          </span>
        </div>
      </button>

      <div
        v-if="index < steps.length - 1"
        class="step-line"
        :class="{
          completed:
            step.number < currentStep,
        }"
      />
    </div>
  </div>
</template>

<style scoped>
.employee-stepper {
  display: flex;
  width: 100%;
  align-items: center;

  margin-bottom: 16px;
  padding: 14px 16px;

  overflow-x: auto;

  border: 1px solid var(--border);
  border-radius: 12px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.step-wrapper {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
}

.step-item {
  display: flex;
  min-width: 105px;
  align-items: center;
  gap: 8px;

  padding: 6px;

  border: 0;
  border-radius: 8px;

  background: transparent;

  text-align: left;
}

.step-item:not(.disabled):hover {
  background: var(--bg-card-soft);
}

.step-item.disabled {
  cursor: default;
}

.step-circle {
  display: flex;
  width: 29px;
  height: 29px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  border: 1px solid var(--border);
  border-radius: 50%;

  background: var(--bg-card-soft);
  color: var(--text-muted);
}

.step-item.active .step-circle {
  border-color: var(--primary);
  background: var(--primary);
  color: white;

  box-shadow:
    0 0 0 4px
    color-mix(
      in srgb,
      var(--primary) 13%,
      transparent
    );
}

.step-item.completed .step-circle {
  border-color: var(--green);
  background: var(--green);
  color: white;
}

.step-info {
  min-width: 0;
}

.step-info strong,
.step-info span {
  display: block;

  white-space: nowrap;
}

.step-info strong {
  color: var(--text-secondary);

  font-size: 9px;
  font-weight: 650;
}

.step-info span {
  margin-top: 2px;

  color: var(--text-muted);

  font-size: 7px;
}

.step-item.active .step-info strong {
  color: var(--text-primary);
}

.step-item.completed .step-info strong {
  color: var(--green);
}

.step-line {
  min-width: 18px;
  height: 1px;
  flex: 1;

  margin: 0 4px;

  background: var(--border);
}

.step-line.completed {
  background: var(--green);
}

@media (max-width: 1100px) {
  .employee-stepper {
    align-items: stretch;
  }

  .step-wrapper {
    min-width: 145px;
  }

  .step-line {
    min-width: 20px;
  }
}
</style>
