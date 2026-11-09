// Employee attendance QR scan types.
// Backend: EmployeeAttendanceController::scan (POST /employee/attendance/scan)
// First accepted scan of the day = time in, the next one = time out.

export type AttendanceScanAction = 'time_in' | 'time_out'

export type AttendanceScannerState =
  | 'idle'        // camera off
  | 'starting'    // asking for camera permission
  | 'scanning'    // camera on, looking for a QR code
  | 'submitting'  // QR found, sending to the API
  | 'success'
  | 'error'

export interface AttendanceScanPayload {
  // Raw text from the QR code: {"s": <session id>, "t": "<token>"}
  qr_payload: string
}

// Datetimes are "YYYY-MM-DD HH:mm:ss" in the server's timezone (no offset).
export interface AttendanceScanResult {
  action: AttendanceScanAction
  time_log_id: number
  work_date: string | null
  time_in: string | null
  time_out: string | null
  scheduled_time_in: string | null
  scheduled_time_out: string | null
  late_minutes: number | null
  chargeable_late_minutes: number | null
  undertime_minutes: number | null
  worked_minutes: number | null
  status: string | null
}

export interface AttendanceScanResponse {
  success: boolean
  message: string
  data: AttendanceScanResult
}
