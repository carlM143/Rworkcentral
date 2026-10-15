<script setup lang="ts">
import {
  AlertTriangle,
  Ban,
  X,
} from 'lucide-vue-next'

import type {
  OvertimeActionRequest,
  OvertimeCancelPayload,
} from '~/types/overtimeActions'

const props =
  defineProps<{
    open: boolean

    request:
      OvertimeActionRequest | null
  }>()

const emit =
  defineEmits<{
    close: []

    confirm: [
      payload:
        OvertimeCancelPayload,
    ]
  }>()

const reason = ref('')

watch(
  () => props.open,
  value => {
    if (value) {
      reason.value = ''
    }
  },
)

const submit = () => {
  if (
    !reason.value.trim()
  ) {
    return
  }

  emit(
    'confirm',
    {
      reason:
        reason.value,
    },
  )

  emit('close')
}
</script>

<template>
  <Teleport to="body">

    <div
      v-if="
        open &&
        request
      "
      class="overlay"
      @click.self="emit('close')"
    >

      <article class="modal">

        <header>

          <div class="warning-icon">
            <AlertTriangle
              :size="20"
            />
          </div>

          <div>
            <h2>
              Cancel Overtime Request?
            </h2>

            <p>
              This action will mark the request as cancelled.
            </p>
          </div>

          <button
            type="button"
            class="close"
            @click="emit('close')"
          >
            <X :size="18" />
          </button>

        </header>

        <main>

          <div class="request-card">

            <strong>
              {{ request.requestNo }}
            </strong>

            <span>
              {{ request.employeeName }}
            </span>

            <span>
              {{ request.otDate }}
              ·
              {{ request.requestedHours }}
              hrs
            </span>

          </div>

          <label class="field">

            <span>
              Reason for Cancellation *
            </span>

            <textarea
              v-model="reason"
              rows="4"
              placeholder="Enter reason for cancelling this OT request..."
            />

          </label>

          <div class="warning-text">

            <AlertTriangle
              :size="14"
            />

            <span>
              Historical information will remain available for audit purposes.
            </span>

          </div>

        </main>

        <footer>

          <AppButton
            variant="secondary"
            @click="emit('close')"
          >
            Back
          </AppButton>

          <AppButton
            :icon="Ban"
            @click="submit"
          >
            Cancel Request
          </AppButton>

        </footer>

      </article>

    </div>

  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  z-index: 99990;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background:
    rgba(3, 10, 24, .76);

  backdrop-filter:
    blur(4px);
}

.modal {
  width: 100%;
  max-width: 500px;

  border:
    1px solid var(--border);

  border-radius: 13px;

  background:
    var(--bg-card);
}

header {
  display: grid;

  grid-template-columns:
    auto 1fr auto;

  gap: 9px;

  align-items: center;

  padding:
    15px 17px;

  border-bottom:
    1px solid var(--border);
}

.warning-icon {
  display: flex;

  width: 38px;
  height: 38px;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    var(--red-soft);

  color:
    var(--red);
}

h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 13px;
}

header p {
  margin:
    3px 0 0;

  color:
    var(--text-muted);

  font-size: 7.5px;
}

.close {
  display: flex;

  width: 30px;
  height: 30px;

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

main {
  padding:
    15px 17px;
}

.request-card {
  padding: 10px;

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.request-card strong,
.request-card span {
  display: block;
}

.request-card strong {
  color:
    var(--primary);

  font-size: 9px;
}

.request-card span {
  margin-top: 3px;

  color:
    var(--text-secondary);

  font-size: 8px;
}

.field {
  display: block;

  margin-top: 13px;
}

.field span {
  display: block;

  margin-bottom: 5px;

  color:
    var(--text-secondary);

  font-size: 8px;
  font-weight: 650;
}

.field textarea {
  width: 100%;

  box-sizing: border-box;

  padding: 9px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);

  font: inherit;

  font-size: 8.5px;

  resize: vertical;
}

.warning-text {
  display: flex;

  gap: 7px;

  margin-top: 10px;

  padding: 9px;

  border-radius: 7px;

  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.warning-text span {
  font-size: 7.5px;

  line-height: 1.45;
}

footer {
  display: flex;

  justify-content: flex-end;

  gap: 7px;

  padding:
    13px 17px;

  border-top:
    1px solid var(--border);
}
</style>