// Employee attendance: scan the admin's QR code with the camera to time in / time out.
// API: POST /employee/attendance/scan  { qr_payload }
//   - first accepted scan = time in, next scan = time out (decided by the server)
//   - codes rotate every ~60s on the admin screen, so scan the live code, not a photo
import type {
  AttendanceScannerState,
  AttendanceScanResponse,
  AttendanceScanResult,
} from '~/types/employee/attendanceQrCode/attendanceQrCode'

type JsQr = typeof import('jsqr').default

// Decode at most ~6 frames per second on a downscaled copy: fast enough to feel
// instant, light enough for low-end phones.
const SCAN_INTERVAL_MS = 160
const MAX_DECODE_WIDTH = 640
const INVALID_HINT_MS = 2500

// The admin QR contains {"s": session id, "t": token}. Checking the shape first
// avoids sending every random QR code (URLs, Wi-Fi codes...) to the API.
const isAttendancePayload = (text: string) => {
  try {
    const value = JSON.parse(text)
    return Boolean(value && typeof value === 'object' && value.s && typeof value.t === 'string')
  } catch {
    return false
  }
}

const apiErrorMessage = (problem: unknown): string => {
  const err = problem as { data?: { message?: string; errors?: Record<string, string[]> }; message?: string }
  return String(
    Object.values(err?.data?.errors ?? {}).flat()[0]
    ?? err?.data?.message
    ?? err?.message
    ?? 'Attendance could not be recorded. Please try again.',
  )
}

const cameraErrorMessage = (problem: unknown): string => {
  const name = (problem as { name?: string })?.name
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'Camera access was blocked. Allow camera permission for this site in your browser settings, then try again.'
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'No camera was found on this device.'
  if (name === 'NotReadableError') return 'The camera is being used by another app. Close it and try again.'
  return 'The camera could not be started.'
}

export const useAttendanceQrCode = () => {
  const { $api } = useNuxtApp()

  const state = ref<AttendanceScannerState>('idle')
  const result = ref<AttendanceScanResult | null>(null)
  const message = ref('')
  const hint = ref('') // short non-blocking notice while scanning

  let video: HTMLVideoElement | null = null
  let stream: MediaStream | null = null
  let canvas: HTMLCanvasElement | null = null
  let jsQR: JsQr | null = null
  let frame = 0
  let lastDecode = 0
  let hintTimer: ReturnType<typeof setTimeout> | null = null

  const cameraSupported = () =>
    import.meta.client && Boolean(navigator.mediaDevices?.getUserMedia)

  const showHint = (text: string) => {
    hint.value = text
    if (hintTimer) clearTimeout(hintTimer)
    hintTimer = setTimeout(() => { hint.value = '' }, INVALID_HINT_MS)
  }

  const stopCamera = () => {
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    stream?.getTracks().forEach(track => track.stop())
    stream = null
    if (video) video.srcObject = null
  }

  /* ---------------- API ---------------- */

  const submit = async (qrPayload: string) => {
    state.value = 'submitting'
    message.value = ''
    try {
      const response = await $api<AttendanceScanResponse>('/employee/attendance/scan', {
        method: 'POST',
        body: { qr_payload: qrPayload },
      })
      result.value = response.data
      message.value = response.message
      state.value = 'success'
    } catch (problem) {
      result.value = null
      message.value = apiErrorMessage(problem)
      state.value = 'error'
    }
  }

  /* ---------------- camera + decoding ---------------- */

  const decodeFrame = (time: number) => {
    frame = requestAnimationFrame(decodeFrame)
    if (state.value !== 'scanning' || !video || !jsQR || time - lastDecode < SCAN_INTERVAL_MS) return
    if (video.readyState < video.HAVE_ENOUGH_DATA || !video.videoWidth) return
    lastDecode = time

    const scale = Math.min(1, MAX_DECODE_WIDTH / video.videoWidth)
    const width = Math.round(video.videoWidth * scale)
    const height = Math.round(video.videoHeight * scale)

    canvas ??= document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return

    context.drawImage(video, 0, 0, width, height)
    const image = context.getImageData(0, 0, width, height)
    const code = jsQR(image.data, width, height, { inversionAttempts: 'dontInvert' })
    if (!code?.data) return

    if (!isAttendancePayload(code.data)) {
      showHint('This is not an attendance QR code.')
      return
    }

    // Stop immediately so the same code is never submitted twice.
    stopCamera()
    void submit(code.data)
  }

  const start = async (videoElement: HTMLVideoElement | null) => {
    if (!videoElement || state.value === 'starting' || state.value === 'scanning') return

    result.value = null
    message.value = ''
    hint.value = ''

    if (!cameraSupported()) {
      state.value = 'error'
      message.value = window.isSecureContext
        ? 'This browser cannot access the camera. Try Chrome or Safari.'
        : 'The camera only works on a secure (https) connection.'
      return
    }

    state.value = 'starting'
    video = videoElement

    try {
      jsQR ??= (await import('jsqr')).default
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      video.srcObject = stream
      video.setAttribute('playsinline', 'true') // iOS: keep the preview inline
      video.muted = true
      await video.play()

      state.value = 'scanning'
      lastDecode = 0
      frame = requestAnimationFrame(decodeFrame)
    } catch (problem) {
      stopCamera()
      state.value = 'error'
      message.value = cameraErrorMessage(problem)
    }
  }

  const stop = () => {
    stopCamera()
    if (hintTimer) clearTimeout(hintTimer)
    hint.value = ''
    if (state.value === 'starting' || state.value === 'scanning') state.value = 'idle'
  }

  const reset = () => {
    stop()
    state.value = 'idle'
    result.value = null
    message.value = ''
  }

  return {
    state,
    result,
    message,
    hint,
    cameraSupported,
    start,
    stop,
    reset,
  }
}
