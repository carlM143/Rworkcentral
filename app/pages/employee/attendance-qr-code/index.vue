<script setup lang="ts">
import { AlertCircle, Camera, CameraOff, CheckCircle2, LogIn, LogOut, RotateCcw, ScanLine } from 'lucide-vue-next'
import { useAttendanceQrCode } from '~/composables/employee/attendance-scan-qr/useAttendanceQrCode'

definePageMeta({ layout: false, middleware: 'employee' })
useHead({ title: 'Scan Attendance QR | RWorkCentral' })

const { success: toastSuccess } = useToast()
const { state, result, message, hint, start, stop, reset } = useAttendanceQrCode()

const videoRef = ref<HTMLVideoElement | null>(null)

const cameraOn = computed(() => state.value === 'starting' || state.value === 'scanning')
const isTimeOut = computed(() => result.value?.action === 'time_out')

// API datetimes are "YYYY-MM-DD HH:mm:ss" with no offset; show them as-is.
const formatTime = (value: string | null | undefined) => {
  const match = String(value ?? '').match(/(\d{1,2}):(\d{2})/)
  if (!match) return '—'
  const hours = Number(match[1])
  return `${hours % 12 || 12}:${match[2]} ${hours >= 12 ? 'PM' : 'AM'}`
}

const formatDate = (value: string | null | undefined) => {
  const match = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return '—'
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

const formatMinutes = (value: number | null | undefined) => {
  const minutes = Math.max(0, Number(value) || 0)
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return hours ? `${hours}h ${rest}m` : `${rest}m`
}

const startScan = () => start(videoRef.value)
const scanAgain = () => {
  reset()
  void nextTick(startScan)
}

watch(state, value => {
  if (value === 'success' && message.value) toastSuccess(isTimeOut.value ? 'Timed Out' : 'Timed In', message.value)
})

// Release the camera when the employee switches tabs or leaves the page.
const onVisibilityChange = () => {
  if (document.hidden && cameraOn.value) stop()
}
onMounted(() => document.addEventListener('visibilitychange', onVisibilityChange))
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange)
  stop()
})
</script>

<template>
  <section class="scan-page">
    <header class="heading">
      <div>
        <h1>Scan Attendance QR</h1>
        <p>Scan the QR code on the office screen. Your first scan today is <strong>Time In</strong>, the next one is <strong>Time Out</strong>.</p>
      </div>
    </header>

    <div class="scan-layout">
      <!-- CAMERA -->
      <article class="panel camera-panel">
        <div class="viewfinder" :class="{ live: state === 'scanning' }">
          <!-- Kept in the DOM so the camera stream has somewhere to attach. -->
          <video ref="videoRef" class="video" :class="{ hidden: !cameraOn }" playsinline muted />

          <div v-if="state === 'scanning'" class="frame" aria-hidden="true"><span class="laser" /></div>

          <div v-if="!cameraOn" class="placeholder">
            <template v-if="state === 'submitting'">
              <span class="spinner" aria-hidden="true" />
              <p>Recording your attendance...</p>
            </template>
            <template v-else>
              <ScanLine :size="46" />
              <p>Camera is off</p>
            </template>
          </div>

          <p v-if="state === 'starting'" class="overlay-text">Starting camera...</p>
          <p v-if="hint" class="overlay-text warn" role="status">{{ hint }}</p>
        </div>

        <div class="camera-actions">
          <button v-if="state === 'idle'" type="button" class="btn primary" @click="startScan">
            <Camera :size="18" /> Start Scanning
          </button>
          <button v-else-if="cameraOn" type="button" class="btn" @click="stop">
            <CameraOff :size="18" /> Stop Camera
          </button>
          <button v-else-if="state === 'success' || state === 'error'" type="button" class="btn primary" @click="scanAgain">
            <RotateCcw :size="18" /> Scan Again
          </button>
        </div>

        <p v-if="state === 'scanning'" class="tip">Hold your phone steady and fit the whole QR code inside the frame.</p>
      </article>

      <!-- RESULT -->
      <article class="panel result-panel" aria-live="polite">
        <template v-if="state === 'success' && result">
          <div class="result-banner" :class="isTimeOut ? 'out' : 'in'">
            <component :is="isTimeOut ? LogOut : LogIn" :size="26" />
            <div>
              <strong>{{ isTimeOut ? 'Timed Out' : 'Timed In' }}</strong>
              <span>{{ message }}</span>
            </div>
          </div>

          <dl class="details">
            <div><dt>Date</dt><dd>{{ formatDate(result.work_date) }}</dd></div>
            <div><dt>Status</dt><dd><span class="badge">{{ result.status || '—' }}</span></dd></div>
            <div><dt>Time In</dt><dd>{{ formatTime(result.time_in) }}</dd></div>
            <div><dt>Time Out</dt><dd>{{ formatTime(result.time_out) }}</dd></div>
            <div>
              <dt>Schedule</dt>
              <dd>
                <template v-if="result.scheduled_time_in">{{ formatTime(result.scheduled_time_in) }} – {{ formatTime(result.scheduled_time_out) }}</template>
                <template v-else>No schedule</template>
              </dd>
            </div>
            <div v-if="Number(result.chargeable_late_minutes) > 0">
              <dt>Late</dt><dd class="warn-text">{{ formatMinutes(result.chargeable_late_minutes) }}</dd>
            </div>
            <div v-if="isTimeOut && Number(result.undertime_minutes) > 0">
              <dt>Undertime</dt><dd class="warn-text">{{ formatMinutes(result.undertime_minutes) }}</dd>
            </div>
            <div v-if="isTimeOut">
              <dt>Worked</dt><dd>{{ formatMinutes(result.worked_minutes) }}</dd>
            </div>
          </dl>

          <NuxtLink to="/employee/attendance" class="link">View my attendance</NuxtLink>
        </template>

        <div v-else-if="state === 'error'" class="result-banner error" role="alert">
          <AlertCircle :size="26" />
          <div>
            <strong>Scan not recorded</strong>
            <span>{{ message }}</span>
          </div>
        </div>

        <div v-else class="steps">
          <h2>How it works</h2>
          <ol>
            <li><CheckCircle2 :size="16" /> Tap <strong>Start Scanning</strong> and allow camera access.</li>
            <li><CheckCircle2 :size="16" /> Point your camera at the QR code on the office screen.</li>
            <li><CheckCircle2 :size="16" /> Your time in or time out is recorded automatically.</li>
          </ol>
          <p class="note">The code on the screen changes every minute, so a photo or screenshot of it will not work.</p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.scan-page{display:grid;gap:16px;width:100%;max-width:1100px;margin:0 auto}
.heading h1{margin:0;color:var(--text-primary);font-size:22px;font-weight:750}
.heading p{margin:6px 0 0;color:var(--text-secondary);font-size:13px;line-height:1.5}
.heading strong{color:var(--text-primary)}
.scan-layout{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:16px;align-items:start}
.panel{display:grid;gap:14px;padding:16px;border:1px solid var(--border);border-radius:14px;background:var(--bg-card);box-shadow:var(--shadow)}

/* Viewfinder */
.viewfinder{position:relative;display:grid;place-items:center;width:100%;aspect-ratio:1;overflow:hidden;border-radius:12px;background:#0b1220}
.video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.video.hidden{visibility:hidden}
.frame{position:absolute;inset:16%;border-radius:14px;box-shadow:0 0 0 999px rgba(0,0,0,.42);outline:3px solid #fff;outline-offset:-3px}
.laser{position:absolute;left:6%;right:6%;top:10%;height:2px;border-radius:2px;background:var(--primary);box-shadow:0 0 10px var(--primary);animation:sweep 1.8s ease-in-out infinite alternate}
@keyframes sweep{to{top:88%}}
.placeholder{position:relative;display:grid;justify-items:center;gap:10px;color:#94a3b8}
.placeholder p{margin:0;font-size:13px}
.overlay-text{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);margin:0;padding:7px 12px;border-radius:999px;background:rgba(15,23,42,.8);color:#fff;font-size:12px;white-space:nowrap}
.overlay-text.warn{background:rgba(180,83,9,.92)}
.spinner{width:34px;height:34px;border:3px solid rgba(148,163,184,.35);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.laser{animation:none;top:50%}.spinner{animation-duration:2s}}

.camera-actions{display:flex}
.btn{display:inline-flex;flex:1;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 16px;border:1px solid var(--border);border-radius:10px;background:var(--bg-card-soft);color:var(--text-primary);font:inherit;font-size:14px;font-weight:650;cursor:pointer}
.btn.primary{border-color:var(--primary);background:var(--primary);color:#fff}
.tip{margin:0;color:var(--text-muted);font-size:12px;text-align:center}

/* Result */
.result-banner{display:flex;align-items:flex-start;gap:12px;padding:14px;border-radius:12px}
.result-banner div{display:grid;gap:3px}
.result-banner strong{font-size:16px}
.result-banner span{font-size:13px;line-height:1.45}
.result-banner.in{background:var(--green-soft);color:var(--green)}
.result-banner.out{background:var(--primary-soft);color:var(--primary)}
.result-banner.error{background:var(--red-soft);color:var(--red)}
.result-banner span{color:var(--text-primary)}
.details{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0}
.details div{padding:10px 12px;border:1px solid var(--border-soft);border-radius:10px;background:var(--bg-card-soft)}
.details dt{color:var(--text-muted);font-size:11px}
.details dd{margin:4px 0 0;color:var(--text-primary);font-size:14px;font-weight:650}
.badge{display:inline-flex;padding:2px 9px;border-radius:999px;background:var(--primary-soft);color:var(--primary);font-size:12px}
.warn-text{color:var(--orange)!important}
.link{justify-self:start;color:var(--primary);font-size:13px;font-weight:600;text-decoration:none}
.steps h2{margin:0 0 10px;color:var(--text-primary);font-size:15px}
.steps ol{display:grid;gap:10px;margin:0;padding:0;list-style:none}
.steps li{display:flex;align-items:flex-start;gap:8px;color:var(--text-secondary);font-size:13px;line-height:1.45}
.steps li svg{flex-shrink:0;margin-top:2px;color:var(--green)}
.note{margin:14px 0 0;color:var(--text-muted);font-size:12px;line-height:1.5}

@media (max-width:820px){
  .scan-layout{grid-template-columns:1fr}
  .heading h1{font-size:19px}
}
</style>
