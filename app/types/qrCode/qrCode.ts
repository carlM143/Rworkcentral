// Attendance QR code types.
// Backend: GenerateQrCodeController (POST /admin/attendance-qr/sessions/...)

export type QrSessionStatus = 'active' | 'scheduled' | 'expired' | 'revoked'

// Body for POST /admin/attendance-qr/sessions
export interface QrSessionPayload {
  name: string
  starts_at: string // ISO 8601 with zone (API runs in UTC)
  ends_at: string
}

// `data` returned by store() and refresh().
// `qr_payload` is the exact string to encode in the QR image; it contains the
// plain token, which the backend never returns again (DB keeps only the hash).
export interface QrSessionToken {
  session_id: number
  name: string
  starts_at: string
  ends_at: string
  expires_at: string
  ttl: number
  qr_payload: string
}

export interface QrApiResponse<T> {
  success?: boolean
  message?: string
  data: T
}

// Session kept on this device so it can be resumed or revoked later.
// The API has no "list sessions" endpoint yet, so the list is local.
export interface QrSessionRecord {
  id: number
  name: string
  starts_at: string
  ends_at: string
  created_at: string
  revoked: boolean
}
