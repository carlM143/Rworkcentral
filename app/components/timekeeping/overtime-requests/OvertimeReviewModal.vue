<script setup lang="ts">
import {
  CheckCircle2,
  Clock3,
  X,
  XCircle,
} from 'lucide-vue-next'

import type {
  OvertimeActionRequest,
  OvertimeReviewPayload,
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

    submit: [
      payload:
        OvertimeReviewPayload,
    ]
  }>()

const decision =
  ref<
    OvertimeReviewPayload['decision']
  >('Approve')

const approvedHours =
  ref(0)

const remarks =
  ref('')

watch(
  () => props.request,
  value => {
    decision.value =
      'Approve'

    approvedHours.value =
      value?.requestedHours ||
      0

    remarks.value = ''
  },
)

const submit = () => {
  if (!props.request) {
    return
  }

  emit(
    'submit',
    {
      decision:
        decision.value,

      approvedHours:
        decision.value ===
        'Approve'
          ? props.request
              .requestedHours

          : decision.value ===
              'Reject'
            ? 0

            : approvedHours.value,

      remarks:
        remarks.value,
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

          <div>
            <span class="eyebrow">
              OVERTIME APPROVAL
            </span>

            <h2>
              Review Overtime Request
            </h2>

            <p>
              {{ request.requestNo }}
              ·
              {{ request.employeeName }}
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

          <div class="summary">

            <div>
              <span>REQUESTED</span>

              <strong>
                {{ request.requestedHours }}
                hrs
              </strong>
            </div>

            <div>
              <span>OT TYPE</span>

              <strong>
                {{ request.otType }}
              </strong>
            </div>

            <div>
              <span>STATUS</span>

              <strong>
                {{ request.status }}
              </strong>
            </div>

          </div>

          <div class="title">
            Select Decision
          </div>

          <div class="decisions">

            <label
              :class="{
                active:
                  decision ===
                  'Approve',
              }"
            >

              <input
                v-model="decision"
                type="radio"
                value="Approve"
              >

              <CheckCircle2
                :size="16"
              />

              <div>
                <strong>
                  Approve Full Request
                </strong>

                <span>
                  Approve all requested OT hours.
                </span>
              </div>

            </label>

            <label
              :class="{
                active:
                  decision ===
                  'Partial',
              }"
            >

              <input
                v-model="decision"
                type="radio"
                value="Partial"
              >

              <Clock3 :size="16" />

              <div>
                <strong>
                  Partial Approval
                </strong>

                <span>
                  Approve only part of the requested hours.
                </span>
              </div>

            </label>

            <label
              :class="{
                active:
                  decision ===
                  'Reject',
              }"
            >

              <input
                v-model="decision"
                type="radio"
                value="Reject"
              >

              <XCircle :size="16" />

              <div>
                <strong>
                  Reject Request
                </strong>

                <span>
                  Do not approve this request.
                </span>
              </div>

            </label>

          </div>

          <label
            v-if="
              decision ===
              'Partial'
            "
            class="field"
          >

            <span>
              Approved Hours
            </span>

            <input
              v-model.number="
                approvedHours
              "
              type="number"
              min="0"
              :max="
                request.requestedHours
              "
              step="0.5"
            >

          </label>

          <label class="field">

            <span>
              Review Remarks
            </span>

            <textarea
              v-model="remarks"
              rows="4"
              placeholder="Enter review remarks..."
            />

          </label>

        </main>

        <footer>

          <AppButton
            variant="secondary"
            @click="emit('close')"
          >
            Cancel
          </AppButton>

          <AppButton
            @click="submit"
          >
            Submit Decision
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
  max-width: 560px;

  border:
    1px solid var(--border);

  border-radius: 13px;

  background:
    var(--bg-card);
}

header,
footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  padding:
    15px 17px;
}

header {
  border-bottom:
    1px solid var(--border);
}

footer {
  justify-content: flex-end;

  gap: 7px;

  border-top:
    1px solid var(--border);
}

.eyebrow {
  color:
    var(--primary);

  font-size: 7px;
  font-weight: 700;
}

h2 {
  margin:
    3px 0 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

header p {
  margin:
    3px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.close {
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

main {
  padding:
    15px 17px;
}

.summary {
  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );

  gap: 7px;
}

.summary div {
  padding: 9px;

  border-radius: 7px;

  background:
    var(--bg-card-soft);
}

.summary span,
.summary strong {
  display: block;
}

.summary span {
  color:
    var(--text-muted);

  font-size: 7px;
}

.summary strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 8.5px;
}

.title {
  margin:
    14px 0 7px;

  color:
    var(--text-primary);

  font-size: 9px;
  font-weight: 700;
}

.decisions {
  display: grid;

  gap: 6px;
}

.decisions label {
  display: flex;

  align-items: flex-start;

  gap: 8px;

  padding: 9px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  cursor: pointer;
}

.decisions label.active {
  border-color:
    var(--primary);

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.decisions input {
  margin-top: 3px;

  accent-color:
    var(--primary);
}

.decisions strong,
.decisions span {
  display: block;
}

.decisions strong {
  color:
    var(--text-primary);

  font-size: 8.5px;
}

.decisions span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7.5px;
}

.field {
  display: block;

  margin-top: 11px;
}

.field > span {
  display: block;

  margin-bottom: 4px;

  color:
    var(--text-secondary);

  font-size: 8px;
}

.field input,
.field textarea {
  width: 100%;

  box-sizing: border-box;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);

  font: inherit;

  font-size: 8.5px;
}

.field input {
  height: 34px;

  padding:
    0 9px;
}

.field textarea {
  padding: 9px;

  resize: vertical;
}

@media (max-width: 550px) {
  .summary {
    grid-template-columns:
      1fr;
  }
}
</style>