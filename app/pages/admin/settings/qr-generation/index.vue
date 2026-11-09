<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import type { QrSessionPayload } from '~/types/qrCode/qrCode'
import { qrErrorMessage, useQrCode } from '~/composables/admin/qrCode/useQrCode'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Manage QR Code | RWorkCentral' })

const router = useRouter()
const { success, error: showError } = useToast()

const {
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
} = useQrCode()

const formRef = ref<{ reset: () => void } | null>(null)

onMounted(loadSaved)
// Stop token rotation when leaving the page.
onBeforeUnmount(stopDisplay)

const handleGenerate = async (payload: QrSessionPayload) => {
  try {
    const response = await createSession(payload)
    success('QR Code Generated', response?.message || 'Attendance QR session created.')
    formRef.value?.reset()
  } catch (problem) {
    showError('QR Code Error', qrErrorMessage(problem, 'Could not generate the QR code.'))
  }
}

const handleOpen = async (sessionId: number) => {
  try {
    await openSession(sessionId)
  } catch (problem) {
    showError('QR Code Error', qrErrorMessage(problem, 'Could not display this QR session.'))
  }
}

const handleRevoke = async (sessionId: number) => {
  if (!window.confirm('Revoke this QR session? Employees will no longer be able to scan it.')) return
  try {
    const response = await revokeSession(sessionId)
    success('QR Session Revoked', response?.message || 'QR session revoked.')
  } catch (problem) {
    showError('QR Code Error', qrErrorMessage(problem, 'Could not revoke the QR session.'))
  }
}
</script>

<template>
  <section class="qr-page">
    <button type="button" class="back-button" @click="router.push('/admin/settings')">
      <ArrowLeft :size="15" /> Back to Settings
    </button>

    <PageHeader
      title="Manage QR Code"
      description="Generate attendance QR codes for time in and time out, display them on a kiosk screen, and revoke them when no longer needed."
    />

    <div class="qr-layout">
      <div class="qr-main">
        <QrSessionForm ref="formRef" :loading="loading" @submit="handleGenerate" />
        <QrSessionList
          :sessions="sessions"
          :current-id="current?.session_id ?? null"
          :loading="loading"
          @open="handleOpen"
          @revoke="handleRevoke"
          @remove="removeSession"
        />
      </div>

      <QrCodeDisplay
        :token="current"
        :svg="qrSvg"
        :seconds-left="secondsLeft"
        :error="displayError"
        :loading="loading"
        @revoke="handleRevoke"
        @close="stopDisplay"
      />
    </div>
  </section>
</template>

<style scoped>
.qr-page{width:100%;max-width:1660px;margin:0 auto}
.back-button{display:inline-flex;align-items:center;gap:6px;margin-bottom:10px;padding:0;border:0;background:transparent;color:var(--primary);font:inherit;font-size:11px;font-weight:600;cursor:pointer}
.qr-layout{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:14px;align-items:start}
.qr-main{display:flex;min-width:0;flex-direction:column;gap:14px}
@media(max-width:1100px){.qr-layout{grid-template-columns:1fr}.qr-layout>:last-child{order:-1}}
</style>
