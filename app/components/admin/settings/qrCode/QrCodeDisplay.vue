<!-- Attendance QR: live, auto-rotating QR code for the active session. -->
<script setup lang="ts">
import { Ban, Maximize2, Minimize2, QrCode, RefreshCw, X } from 'lucide-vue-next'
import type { QrSessionToken } from '~/types/qrCode/qrCode'

const props = defineProps<{
  token: QrSessionToken | null
  svg: string
  secondsLeft: number
  error?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  revoke: [sessionId: number]
  close: []
}>()

const rootRef = ref<HTMLElement | null>(null)
const isFullscreen = ref(false)

const ttl = computed(() => Number(props.token?.ttl) || 60)
const progress = computed(() => Math.min(100, Math.max(0, (props.secondsLeft / ttl.value) * 100)))

const formatDateTime = (value: string | null | undefined) => {
  const date = new Date(String(value ?? ''))
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const toggleFullscreen = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await rootRef.value?.requestFullscreen()
  } catch {
    // Fullscreen not allowed (e.g. iframe); the normal view still works.
  }
}

const onFullscreenChange = () => {
  isFullscreen.value = document.fullscreenElement === rootRef.value
}

onMounted(() => document.addEventListener('fullscreenchange', onFullscreenChange))
onBeforeUnmount(() => document.removeEventListener('fullscreenchange', onFullscreenChange))
</script>

<template>
  <article ref="rootRef" class="qr-card" :class="{ fullscreen: isFullscreen }">
    <div class="card-heading">
      <div>
        <h3>{{ token ? token.name : 'Live QR Code' }}</h3>
        <p v-if="token">Active {{ formatDateTime(token.starts_at) }} – {{ formatDateTime(token.ends_at) }}</p>
        <p v-else>Generate a session or open a saved one to display its QR code.</p>
      </div>
      <div v-if="token" class="heading-actions">
        <button type="button" class="icon-button" :title="isFullscreen ? 'Exit full screen' : 'Full screen'" @click="toggleFullscreen">
          <component :is="isFullscreen ? Minimize2 : Maximize2" :size="15" />
        </button>
        <button v-if="!isFullscreen" type="button" class="icon-button" title="Hide QR code" @click="emit('close')">
          <X :size="15" />
        </button>
      </div>
    </div>

    <div class="card-body">
      <template v-if="token">
        <!-- SVG is generated locally by uqr from the payload string. -->
        <div class="qr-frame" v-html="svg" />

        <div class="countdown">
          <div class="countdown-label">
            <RefreshCw :size="13" />
            <span>New code in <strong>{{ secondsLeft }}s</strong></span>
          </div>
          <div class="countdown-bar"><span :style="{ width: `${progress}%` }" /></div>
        </div>

        <p class="note">
          The code changes every {{ ttl }} seconds, so screenshots or printouts stop working. Keep this screen open where employees scan.
        </p>

        <AppButton v-if="!isFullscreen" variant="danger" :icon="Ban" :disabled="loading" @click="emit('revoke', token.session_id)">
          Revoke Session
        </AppButton>
      </template>

      <div v-else class="empty-state">
        <QrCode :size="44" />
        <p v-if="error" class="error-text" role="alert">{{ error }}</p>
        <p v-else>No QR code is being displayed.</p>
      </div>
    </div>
  </article>
</template>

<style scoped>
.qr-card{overflow:hidden;border:1px solid var(--border);border-radius:11px;background:var(--bg-card);box-shadow:var(--shadow)}
.card-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:15px 16px;border-bottom:1px solid var(--border-soft)}
.card-heading h3{margin:0;color:var(--text-primary);font-size:14px;font-weight:700}
.card-heading p{margin:5px 0 0;color:var(--text-muted);font-size:11px;line-height:1.5}
.heading-actions{display:flex;gap:6px}
.icon-button{display:grid;place-items:center;width:32px;height:32px;border:1px solid var(--border-soft);border-radius:8px;background:var(--bg-card-soft);color:var(--text-secondary);cursor:pointer}
.icon-button:hover{border-color:var(--primary);color:var(--primary)}
.card-body{display:grid;justify-items:center;gap:14px;padding:18px 16px}
.qr-frame{width:min(100%,280px);aspect-ratio:1;padding:10px;box-sizing:border-box;border-radius:12px;background:#fff}
.qr-frame :deep(svg){display:block;width:100%;height:100%}
.countdown{display:grid;gap:7px;width:min(100%,280px)}
.countdown-label{display:flex;align-items:center;gap:6px;color:var(--text-secondary);font-size:11px}
.countdown-label strong{color:var(--text-primary)}
.countdown-bar{height:5px;border-radius:999px;background:var(--bg-card-soft);overflow:hidden}
.countdown-bar span{display:block;height:100%;border-radius:inherit;background:var(--primary);transition:width 1s linear}
.note{max-width:320px;margin:0;color:var(--text-muted);font-size:10px;line-height:1.5;text-align:center}
.empty-state{display:grid;justify-items:center;gap:8px;padding:28px 0;color:var(--text-muted)}
.empty-state p{margin:0;font-size:11px;text-align:center}
.error-text{color:var(--red,#ef4444)}

/* Full screen kiosk view for a wall display or tablet */
.qr-card.fullscreen{display:flex;flex-direction:column;border:0;border-radius:0}
.qr-card.fullscreen .card-heading{justify-content:center;text-align:center;border:0;padding-top:32px}
.qr-card.fullscreen .card-heading h3{font-size:26px}
.qr-card.fullscreen .card-heading p{font-size:14px}
.qr-card.fullscreen .heading-actions{position:absolute;top:16px;right:16px}
.qr-card.fullscreen .card-body{flex:1;align-content:center}
.qr-card.fullscreen .qr-frame{width:min(70vh,80vw)}
.qr-card.fullscreen .countdown{width:min(70vh,80vw)}
.qr-card.fullscreen .countdown-label{justify-content:center;font-size:15px}
</style>
