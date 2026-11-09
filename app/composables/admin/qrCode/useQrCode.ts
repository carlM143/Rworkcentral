// Attendance QR code generation and management for admin settings.
// Endpoints (routes/api/admin.php):
//   POST /admin/attendance-qr/sessions                 create session + first token
//   POST /admin/attendance-qr/sessions/{id}/refresh    rotate token (every `ttl` seconds)
//   POST /admin/attendance-qr/sessions/{id}/revoke     revoke session and all tokens
import { renderSVG } from 'uqr'

import type {
  QrApiResponse,
  QrSessionPayload,
  QrSessionRecord,
  QrSessionStatus,
  QrSessionToken,
} from '~/types/qrCode/qrCode'

const STORAGE_KEY = 'rworkcentral:attendance-qr-sessions'
const MAX_SAVED_SESSIONS = 30
// Rotate this many seconds before the token expires so a scan never lands on a dead code.
const REFRESH_LEAD_SECONDS = 5

const readSaved = (): QrSessionRecord[] => {
  if (!import.meta.client) return []
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeSaved = (records: QrSessionRecord[]) => {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, MAX_SAVED_SESSIONS)))
  } catch {
    // Storage blocked/full: the list just won't survive a reload.
  }
}

export const qrErrorMessage = (problem: unknown, fallback: string): string => {
  const err = problem as { data?: { message?: string; errors?: Record<string, string[]> }; message?: string }
  return String(Object.values(err?.data?.errors ?? {}).flat()[0] ?? err?.data?.message ?? err?.message ?? fallback)
}

export const qrSessionStatus = (record: QrSessionRecord, now = Date.now()): QrSessionStatus => {
  if (record.revoked) return 'revoked'
  if (now < new Date(record.starts_at).getTime()) return 'scheduled'
  if (now > new Date(record.ends_at).getTime()) return 'expired'
  return 'active'
}

export const useQrCode = () => {
  const { $api } = useNuxtApp()

  // Owned by the page that calls this (it also owns the rotation timers);
  // child components receive these as props. Call stopDisplay() on unmount.
  const sessions = ref<QrSessionRecord[]>([])
  const current = ref<QrSessionToken | null>(null)
  const receivedAt = ref(0)
  const secondsLeft = ref(0)
  const loading = ref(false)
  const displayError = ref('')

  let refreshTimer: ReturnType<typeof setTimeout> | null = null
  let countdownTimer: ReturnType<typeof setInterval> | null = null

  /* ---------------- local session list ---------------- */

  const loadSaved = () => {
    sessions.value = readSaved()
  }

  const upsertSession = (record: QrSessionRecord) => {
    sessions.value = [record, ...sessions.value.filter(item => item.id !== record.id)]
    writeSaved(sessions.value)
  }

  const markRevoked = (id: number) => {
    sessions.value = sessions.value.map(item => item.id === id ? { ...item, revoked: true } : item)
    writeSaved(sessions.value)
  }

  const removeSession = (id: number) => {
    sessions.value = sessions.value.filter(item => item.id !== id)
    writeSaved(sessions.value)
  }

  /* ---------------- live QR rotation ---------------- */

  const qrSvg = computed(() =>
    current.value
      ? renderSVG(current.value.qr_payload, { ecc: 'M', border: 2, blackColor: '#000', whiteColor: '#fff' })
      : '',
  )

  const clearTimers = () => {
    if (refreshTimer) clearTimeout(refreshTimer)
    if (countdownTimer) clearInterval(countdownTimer)
    refreshTimer = null
    countdownTimer = null
  }

  const stopDisplay = () => {
    clearTimers()
    current.value = null
    secondsLeft.value = 0
  }

  // Countdown and next refresh use the local clock + `ttl`, so clock drift
  // between the browser and the server does not matter.
  const showToken = (token: QrSessionToken) => {
    clearTimers()
    current.value = token
    displayError.value = ''
    receivedAt.value = Date.now()

    const ttl = Math.max(Number(token.ttl) || 60, REFRESH_LEAD_SECONDS + 5)
    const tick = () => {
      secondsLeft.value = Math.max(0, Math.ceil(ttl - (Date.now() - receivedAt.value) / 1000))
    }
    tick()
    countdownTimer = setInterval(tick, 1000)
    refreshTimer = setTimeout(() => { void rotate(token.session_id) }, (ttl - REFRESH_LEAD_SECONDS) * 1000)
  }

  const requestToken = (sessionId: number) =>
    $api<QrApiResponse<QrSessionToken>>(`/admin/attendance-qr/sessions/${sessionId}/refresh`, { method: 'POST' })

  // Automatic rotation: on failure (revoked / outside time window) stop showing a dead code.
  const rotate = async (sessionId: number) => {
    try {
      const response = await requestToken(sessionId)
      if (current.value?.session_id === sessionId) showToken(response.data)
    } catch (problem) {
      if (current.value?.session_id !== sessionId) return
      stopDisplay()
      displayError.value = qrErrorMessage(problem, 'The QR code could not be refreshed.')
    }
  }

  /* ---------------- API actions ---------------- */

  const createSession = async (payload: QrSessionPayload) => {
    loading.value = true
    try {
      const response = await $api<QrApiResponse<QrSessionToken>>('/admin/attendance-qr/sessions', {
        method: 'POST',
        body: payload,
      })
      const token = response.data
      upsertSession({
        id: token.session_id,
        name: token.name,
        starts_at: token.starts_at,
        ends_at: token.ends_at,
        created_at: new Date().toISOString(),
        revoked: false,
      })
      showToken(token)
      return response
    } finally {
      loading.value = false
    }
  }

  // Show an existing session again (issues a fresh token; old tokens are revoked by the API).
  const openSession = async (sessionId: number) => {
    loading.value = true
    try {
      const response = await requestToken(sessionId)
      showToken(response.data)
      return response
    } finally {
      loading.value = false
    }
  }

  const revokeSession = async (sessionId: number) => {
    loading.value = true
    try {
      const response = await $api<{ message?: string }>(`/admin/attendance-qr/sessions/${sessionId}/revoke`, {
        method: 'POST',
      })
      markRevoked(sessionId)
      if (current.value?.session_id === sessionId) stopDisplay()
      return response
    } finally {
      loading.value = false
    }
  }

  return {
    sessions,
    current,
    secondsLeft,
    loading,
    displayError,
    qrSvg,
    loadSaved,
    removeSession,
    createSession,
    openSession,
    revokeSession,
    stopDisplay,
  }
}
