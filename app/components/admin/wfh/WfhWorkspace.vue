<script setup lang="ts">
import { computed, ref } from 'vue'
import { FileImage, FileText, Upload, Download, Eye, Ellipsis, Check, X, History, Search, ClipboardCheck, CalendarDays, Paperclip, ArrowLeft, ShieldCheck } from 'lucide-vue-next'
import type { WfhEntry, WfhStatus, WfhDocument, WfhDocType } from '~/composables/admin/useWfhDemo'

const props = defineProps<{ page: 'requests' | 'list' | 'documents' }>()
const { entries, review, addDocument } = useWfhDemo()
const search = ref('')
const statusFilter = ref('All')
const departmentFilter = ref('All')
const pageNum = ref(1)
const size = 6
const title = computed(() => ({ requests: 'WFH Requests', list: 'WFH List', documents: 'WFH Attach Documents' })[props.page])
const subtitle = computed(() => ({ requests: 'Review employee WFH requests and their submitted forms before deciding.', list: 'Monitor all employee work-from-home requests and decisions.', documents: 'Inspect photographed application forms and manage demo supporting documents.' })[props.page])
const departments = computed(() => ['All', ...new Set(entries.value.map(r => r.department))])
const filtered = computed(() => entries.value.filter(r => {
  if (props.page === 'requests' && !['Pending', 'For Review'].includes(r.status)) return false
  const q = search.value.trim().toLowerCase()
  const match = [r.id, r.employee, r.employeeNo, r.department, r.reason].join(' ').toLowerCase().includes(q)
  return match && (statusFilter.value === 'All' || r.status === statusFilter.value) && (departmentFilter.value === 'All' || r.department === departmentFilter.value)
}))
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / size)))
const rows = computed(() => filtered.value.slice((Math.min(pageNum.value, pages.value) - 1) * size, Math.min(pageNum.value, pages.value) * size))
const stats = computed(() => ({ all: entries.value.length, pending: entries.value.filter(r=>['Pending','For Review'].includes(r.status)).length, approved: entries.value.filter(r=>r.status==='Approved').length, documents: entries.value.reduce((n,r)=>n+r.documents.length,0) }))
const actionId = ref<string | null>(null)
const activeItem = computed(() => entries.value.find(r => r.id === actionId.value))
const menuStyle = ref<Record<string, string>>({})
const selected = ref<WfhEntry | null>(null)
const modal = ref<'details' | 'review' | 'decision' | 'history' | 'upload' | 'document' | null>(null)
const decision = ref<'Approved' | 'Rejected'>('Approved')
const note = ref('')
const file = ref<File | null>(null)
const fileKind = ref<WfhDocType>('WFH Application Form')
const previewDoc = ref<WfhDocument | null>(null)
const alert = ref('')
const choose = (item: WfhEntry, mode: NonNullable<typeof modal.value>) => { selected.value = item; modal.value = mode; actionId.value = null; note.value = ''; file.value = null; alert.value = ''; decision.value = 'Approved' }
const close = () => { modal.value = null; selected.value = null; file.value = null; previewDoc.value = null; alert.value = '' }
const openMenu = (event: MouseEvent, id: string) => {
  if (actionId.value === id) { actionId.value = null; return }
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const height = props.page === 'requests' ? 194 : 158
  menuStyle.value = {
    position: 'fixed', zIndex: '12000',
    top: `${rect.bottom + height + 8 < window.innerHeight ? rect.bottom + 6 : Math.max(8, rect.top - height - 6)}px`,
    left: `${Math.max(8, Math.min(rect.right - 188, window.innerWidth - 196))}px`,
  }
  actionId.value = id
}
const decide = () => {
  if (!selected.value) return
  if (decision.value === 'Rejected' && !note.value.trim()) { alert.value = 'Please enter a reason for rejection.'; return }
  review(selected.value.id, decision.value, note.value.trim() || 'Reviewed in frontend demo')
  close()
}
const selectFile = (event: Event) => { file.value = (event.target as HTMLInputElement).files?.[0] || null; alert.value = '' }
const upload = async () => {
  if (!selected.value || !file.value) { alert.value = 'Choose a file first.'; return }
  if (!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.value.type)) { alert.value = 'Only JPG, PNG, WEBP, and PDF are supported.'; return }
  if (file.value.size > 4 * 1024 * 1024) { alert.value = 'Maximum file size is 4 MB.'; return }
  const currentFile = file.value
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(currentFile)
  }).catch(() => '')
  if (!dataUrl) { alert.value = 'Cannot read file.'; return }
  addDocument(selected.value.id, { id: `upload-${Date.now()}`, name: currentFile.name, kind: fileKind.value, mime: currentFile.type, url: dataUrl, uploadedAt: new Date().toLocaleString('en-PH') })
  close()
}
const viewDoc = (item: WfhEntry, doc: WfhDocument) => { selected.value = item; previewDoc.value = doc; modal.value = 'document'; actionId.value = null }
const dateText = (v: string) => { const d = new Date(`${v}T00:00:00`); return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
const csvEscape = (v: unknown) => { const s = String(v ?? ''); const safe = /^[\s]*[=+@\-]/.test(s) ? `'${s}` : s; return `"${safe.replace(/"/g, '""')}"` }
const exportCsv = () => {
  const dataset = [['Reference','Employee','Department','WFH Type','From','To','Status','Documents'], ...filtered.value.map(r => [r.id,r.employee,r.department,r.type,r.start,r.end,r.status,String(r.documents.length)])]
  const csv = dataset.map(r=>r.map(csvEscape).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['\uFEFF',csv],{type:'text/csv;charset=utf-8;'}))
  const a = document.createElement('a'); a.href = url; a.download = 'wfh-demo-records.csv'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000)
}
</script>

<template>
  <section class="wfh-workspace" @click="actionId = null">
    <div class="head">
      <div><p class="eyebrow">EMPLOYEE WORK ARRANGEMENTS <span>FRONTEND DEMO</span></p><h1>{{ title }}</h1><p class="muted">{{ subtitle }}</p></div>
      <div class="head-buttons"><button class="btn ghost" @click="exportCsv"><Download :size="15" /> Export CSV</button><NuxtLink v-if="page !== 'requests'" class="btn primary" to="/admin/wfh/requests"><ClipboardCheck :size="15" /> Review Requests</NuxtLink></div>
    </div>
    <div class="stats">
      <div class="stat"><span class="stat-icon blue"><FileText :size="20" /></span><div><small>Total Requests</small><strong>{{ stats.all }}</strong><p>Demo applications</p></div></div>
      <div class="stat"><span class="stat-icon amber"><CalendarDays :size="20" /></span><div><small>Pending Review</small><strong>{{ stats.pending }}</strong><p>Awaiting HR action</p></div></div>
      <div class="stat"><span class="stat-icon green"><ShieldCheck :size="20" /></span><div><small>Approved</small><strong>{{ stats.approved }}</strong><p>Accepted applications</p></div></div>
      <div class="stat"><span class="stat-icon violet"><Paperclip :size="20" /></span><div><small>Attachments</small><strong>{{ stats.documents }}</strong><p>Forms and documents</p></div></div>
    </div>
    <div class="filters"><div class="search"><Search :size="16" /><input v-model="search" @input="pageNum=1" placeholder="Search employee, request no. or reason..." /></div><select v-model="departmentFilter" @change="pageNum=1"><option v-for="d in departments" :key="d" :value="d">{{ d === 'All' ? 'All Departments' : d }}</option></select><select v-model="statusFilter" @change="pageNum=1"><option value="All">All Status</option><option v-for="s in ['Pending','For Review','Approved','Rejected']" :key="s">{{ s }}</option></select><button class="btn ghost" @click="search='';departmentFilter='All';statusFilter='All';pageNum=1">Reset</button></div>
    <div class="table-card">
      <div class="table-head"><div><h2>{{ page === 'requests' ? 'WFH Requests for HR Review' : page === 'list' ? 'All WFH Applications' : 'Uploaded Application Forms' }}</h2><p>{{ page === 'documents' ? 'Sample photographed forms are labeled as previews until actual files are uploaded.' : 'Click the three-dots menu to review supporting documents and request information.' }}</p></div><span>{{ filtered.length }} records</span></div>
      <div class="table-scroll"><table><thead><tr><th>Request / Employee</th><th>Department</th><th>WFH Period</th><th>WFH Type</th><th>{{ page === 'documents' ? 'Attachments' : 'Work Location' }}</th><th>Status</th><th>Actions</th></tr></thead><tbody><tr v-for="r in rows" :key="r.id"><td><span class="reference">{{ r.id }}</span><div class="person">{{ r.employee }}</div><small>{{ r.employeeNo }}</small></td><td>{{ r.department }}</td><td>{{ dateText(r.start) }}<template v-if="r.start !== r.end"> – {{ dateText(r.end) }}</template></td><td>{{ r.type }}</td><td><template v-if="page === 'documents'"><button class="text-action" @click.stop="choose(r,'details')"><Paperclip :size="13" /> {{ r.documents.length }} attachments</button></template><template v-else>{{ r.location }}</template></td><td><span class="pill" :class="r.status.toLowerCase().replace(' ','-')">{{ r.status }}</span></td><td><button class="dots" :class="{ 'dots-open': actionId === r.id }" :aria-expanded="actionId === r.id" :aria-label="`More actions for ${r.employee}`" title="More actions" @click.stop="openMenu($event,r.id)"><Ellipsis :size="18" /></button></td></tr><tr v-if="!rows.length"><td colspan="7" class="empty">No WFH records match your filters.</td></tr></tbody></table></div>
    </div>
    <div class="footer"><span>Showing {{ rows.length ? ((Math.min(pageNum,pages)-1)*size)+1 : 0 }}–{{ Math.min(Math.min(pageNum,pages)*size,filtered.length) }} of {{ filtered.length }} records</span><div><button :disabled="pageNum<=1" class="btn ghost" @click="pageNum--">Previous</button><span>{{ Math.min(pageNum,pages) }} / {{ pages }}</span><button :disabled="pageNum>=pages" class="btn ghost" @click="pageNum++">Next</button></div></div>
    <Teleport to="body">
      <div v-if="actionId" class="menu-shade" @click="actionId = null">
        <div class="dropdown" :style="menuStyle" role="menu" @click.stop>
          <template v-if="activeItem && page === 'requests'">
            <button type="button" role="menuitem" @click="choose(activeItem, 'details')"><Eye :size="15" /> View Application</button>
            <button v-if="['Pending', 'For Review'].includes(activeItem.status)" type="button" role="menuitem" class="review-action" @click="choose(activeItem, 'review')"><ClipboardCheck :size="15" /> Review &amp; Decide</button>
            <button type="button" role="menuitem" @click="choose(activeItem, 'details')"><Paperclip :size="15" /> View Attachments</button>
            <button type="button" role="menuitem" @click="choose(activeItem, 'history')"><History :size="15" /> View History</button>
          </template>
          <template v-else-if="activeItem && page === 'list'">
            <button type="button" role="menuitem" @click="choose(activeItem, 'details')"><Eye :size="15" /> View Details</button>
            <button v-if="activeItem.reviewedAt" type="button" role="menuitem" @click="choose(activeItem, 'decision')"><ClipboardCheck :size="15" /> View Decision</button>
            <button type="button" role="menuitem" @click="choose(activeItem, 'details')"><Paperclip :size="15" /> View Attachments</button>
            <button type="button" role="menuitem" @click="choose(activeItem, 'history')"><History :size="15" /> View History</button>
          </template>
          <template v-else-if="activeItem && page === 'documents'">
            <button type="button" role="menuitem" @click="choose(activeItem, 'details')"><Eye :size="15" /> Preview Documents</button>
            <button type="button" role="menuitem" @click="choose(activeItem, 'upload')"><Upload :size="15" /> Attach Document</button>
            <button type="button" role="menuitem" @click="choose(activeItem, 'details')"><FileText :size="15" /> View Request</button>
            <button type="button" role="menuitem" @click="choose(activeItem, 'history')"><History :size="15" /> View History</button>
          </template>
        </div>
      </div>
    </Teleport>
    <Teleport to="body"><div v-if="modal && selected" class="overlay" @click.self="close"><article class="modal" role="dialog" aria-modal="true" :aria-label="title"><div class="modal-head"><div><p class="eyebrow">{{ selected.id }}</p><h2>{{ modal === 'details' ? 'WFH Application Details' : modal === 'review' ? 'HR Review & Decision' : modal === 'decision' ? 'HR Decision Details' : modal === 'upload' ? 'Attach WFH Document' : modal === 'history' ? 'Request Activity History' : 'Document Preview' }}</h2><p>{{ selected.employee }} · {{ selected.department }}</p></div><button class="close" aria-label="Close" @click="close"><X :size="19" /></button></div>
      <div class="modal-content">
        <template v-if="modal === 'details'"><div class="info-grid"><div><small>Employee No.</small><strong>{{ selected.employeeNo }}</strong></div><div><small>WFH Type</small><strong>{{ selected.type }}</strong></div><div><small>Dates</small><strong>{{ dateText(selected.start) }} – {{ dateText(selected.end) }}</strong></div><div><small>Work Location</small><strong>{{ selected.location }}</strong></div><div><small>Supervisor</small><strong>{{ selected.supervisor }}</strong></div><div><small>Status</small><strong>{{ selected.status }}</strong></div></div><h3>Reason for WFH</h3><p class="detail-text">{{ selected.reason }}</p><h3>Planned Work</h3><p class="detail-text">{{ selected.workPlan }}</p><h3>Submitted Documents</h3><div class="doc-row" v-for="d in selected.documents" :key="d.id"><FileImage :size="18" /><div><strong>{{ d.name }}</strong><small>{{ d.kind }} · {{ d.sample ? 'Sample only' : d.uploadedAt }}</small></div><button class="btn ghost" @click="viewDoc(selected!,d)">Preview</button></div><div class="modal-actions"><button v-if="['Pending','For Review'].includes(selected.status)" class="btn primary" @click="choose(selected!,'review')">Review Request</button><button class="btn ghost" @click="choose(selected!,'upload')">Attach File</button></div></template>
        <template v-else-if="modal==='review'"><div class="review-note">HR can review the uploaded application form before deciding. Actions update demo state only.</div><div class="doc-row" v-for="d in selected.documents" :key="d.id"><FileImage :size="18" /><div><strong>{{ d.name }}</strong><small>{{ d.kind }}</small></div><button class="btn ghost" @click="viewDoc(selected!,d)">Preview</button></div><label>Decision</label><div class="choice"><button class="btn" :class="decision==='Approved'?'approved-choice':'ghost'" @click="decision='Approved'"><Check :size="15" /> Approve</button><button class="btn" :class="decision==='Rejected'?'rejected-choice':'ghost'" @click="decision='Rejected'"><X :size="15" /> Reject</button></div><label>HR Remarks {{ decision==='Rejected'?'(required)':'(optional)' }}</label><textarea v-model="note" rows="4" placeholder="Add review notes or reason for rejection..." /><p v-if="alert" class="error">{{ alert }}</p><div class="modal-actions"><button class="btn ghost" @click="close">Cancel</button><button class="btn primary" @click="decide">Confirm {{ decision }}</button></div></template>
        <template v-else-if="modal === 'decision'">
          <div class="info-grid">
            <div><small>Decision</small><strong>{{ selected.status }}</strong></div>
            <div><small>Reviewed By</small><strong>{{ selected.reviewedBy || 'Not yet reviewed' }}</strong></div>
            <div><small>Decision Date</small><strong>{{ selected.reviewedAt || '—' }}</strong></div>
            <div><small>Request Reference</small><strong>{{ selected.id }}</strong></div>
          </div>
          <h3>HR Remarks</h3><p class="detail-text">{{ selected.reviewNotes || 'No remarks recorded.' }}</p>
          <div class="modal-actions"><button class="btn ghost" @click="choose(selected!, 'details')">View Application</button><button class="btn primary" @click="close">Close</button></div>
        </template>
        <template v-else-if="modal==='upload'"><div class="review-note">Frontend demo upload. The file is kept only in browser state and is not sent to a server.</div><label>Document Type</label><select v-model="fileKind"><option>WFH Application Form</option><option>Supporting Document</option><option>Identification</option></select><label>Choose image or PDF (max 4 MB)</label><input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" @change="selectFile" /><p v-if="file">Selected: {{ file.name }}</p><p v-if="alert" class="error">{{ alert }}</p><div class="modal-actions"><button class="btn ghost" @click="close">Cancel</button><button class="btn primary" @click="upload"><Upload :size="15" /> Attach Document</button></div></template>
        <template v-else-if="modal==='history'"><div class="timeline" v-for="(h,i) in selected.history" :key="i"><strong>{{ h.action }}</strong><p>{{ h.when }} · {{ h.actor }}</p><small>{{ h.notes }}</small></div></template>
        <template v-else-if="modal==='document' && previewDoc"><div v-if="previewDoc.sample" class="paper"><p class="paper-kicker">SAMPLE FORM PREVIEW · NOT A REAL UPLOADED PHOTO</p><h2>WORK FROM HOME REQUEST</h2><div class="paper-line"><strong>Employee</strong><span>{{ selected.employee }}</span></div><div class="paper-line"><strong>Employee ID</strong><span>{{ selected.employeeNo }}</span></div><div class="paper-line"><strong>Requested Date</strong><span>{{ dateText(selected.start) }} – {{ dateText(selected.end) }}</span></div><div class="paper-line"><strong>Work Location</strong><span>{{ selected.location }}</span></div><div class="paper-line"><strong>Reason</strong><span>{{ selected.reason }}</span></div><div class="paper-line"><strong>Work Plan</strong><span>{{ selected.workPlan }}</span></div><div class="paper-signature">Employee Signature: ___________________</div></div><img v-else-if="previewDoc.url && previewDoc.mime.startsWith('image/')" class="preview-image" :src="previewDoc.url" alt="Uploaded WFH document preview" /><iframe v-else-if="previewDoc.url && previewDoc.mime==='application/pdf'" class="preview-pdf" :src="previewDoc.url" title="Document PDF preview" /><p v-else>Preview unavailable.</p><div class="modal-actions"><button class="btn ghost" @click="choose(selected!,'details')"><ArrowLeft :size="15" /> Back to Details</button></div></template>
      </div>
    </article></div></Teleport>
  </section>
</template>

<style scoped>
.wfh-workspace{max-width:1700px;margin:0 auto;color:var(--text-primary)}.head{display:flex;justify-content:space-between;gap:15px;align-items:center;margin-bottom:20px}.head h1{font-size:24px;letter-spacing:-.5px;margin:5px 0}.eyebrow{font-size:10px;letter-spacing:1px;color:var(--primary);font-weight:800}.eyebrow span{margin-left:8px;color:var(--orange)}.muted,.head p,.table-head p{color:var(--text-secondary);font-size:12px}.head-buttons{display:flex;gap:8px}.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--border);border-radius:8px;padding:10px 13px;font-size:11px;font-weight:650;white-space:nowrap;cursor:pointer}.btn.ghost{background:var(--bg-card);color:var(--text-primary)}.btn.primary{background:var(--primary);color:#fff;border-color:var(--primary)}.btn:disabled{opacity:.4;cursor:not-allowed}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:13px}.stat{display:flex;gap:13px;align-items:center;border:1px solid var(--border);border-radius:11px;background:var(--bg-card);padding:16px}.stat-icon{width:39px;height:39px;border-radius:9px;display:grid;place-items:center}.blue{color:#3280ff;background:#15315b}.amber{color:#f5a400;background:#433011}.green{color:#24c27a;background:#113b30}.violet{color:#986aff;background:#33244c}.stat small,.stat strong,.stat p{display:block}.stat small{font-size:10px;color:var(--text-secondary)}.stat strong{font-size:22px;margin:2px 0}.stat p{font-size:10px;color:var(--text-muted);margin:0}.filters{display:flex;gap:8px;border:1px solid var(--border);border-radius:11px;padding:10px;background:var(--bg-card);margin-bottom:14px}.search{display:flex;align-items:center;gap:8px;flex:1;min-width:160px;border:1px solid var(--border);border-radius:8px;padding:0 10px;color:var(--text-muted);background:var(--bg-card-soft)}.search input{flex:1;width:100%;min-height:38px;background:transparent;border:0;outline:none;color:var(--text-primary);font-size:11px}.filters select,.modal select,.modal textarea,.modal input[type=file]{background:var(--bg-card-soft);color:var(--text-primary);border:1px solid var(--border);border-radius:8px;padding:9px;font-size:11px;min-width:130px}.table-card{border:1px solid var(--border);background:var(--bg-card);border-radius:11px;overflow:hidden}.table-head{display:flex;align-items:center;justify-content:space-between;padding:16px;border-bottom:1px solid var(--border)}.table-head h2{margin:0;font-size:13px}.table-head p{margin:5px 0 0;font-size:10px}.table-head>span{font-size:10px;color:var(--text-muted)}.table-scroll{overflow:auto}table{border-collapse:collapse;width:100%;min-width:1000px;text-align:left}th{background:var(--bg-card-soft);font-size:9px;text-transform:uppercase;color:var(--text-secondary);letter-spacing:.3px;padding:13px}td{padding:15px 13px;border-top:1px solid var(--border-soft);font-size:11px;color:var(--text-secondary)}.reference,.person{display:block}.reference{font-size:10px;color:var(--primary);font-weight:700}.person{font-size:12px;color:var(--text-primary);font-weight:700;margin:5px 0 3px}td small{color:var(--text-muted)}.pill{display:inline-block;padding:6px 9px;border-radius:22px;font-size:10px;font-weight:700}.pill.pending{background:#473416;color:#fbbf24}.pill.for-review{background:#30244d;color:#b08bff}.pill.approved{background:#103d2d;color:#31d58c}.pill.rejected{background:#4a212a;color:#ff7d8c}.dots{width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:8px;background:var(--bg-card);color:var(--text-secondary);padding:0;cursor:pointer;transition:background .17s ease,border-color .17s ease,color .17s ease,box-shadow .17s ease}.dots:hover,.dots:focus-visible,.dots.dots-open{border-color:#2976ff;background:rgba(37,99,235,.16);color:#448bff;box-shadow:0 0 0 1px rgba(37,99,235,.15);outline:none}.text-action{display:flex;align-items:center;gap:5px;background:transparent;border:0;color:var(--primary);cursor:pointer}.empty{text-align:center;padding:30px}.footer{display:flex;align-items:center;justify-content:space-between;margin-top:12px;font-size:11px;color:var(--text-muted)}.footer>div{display:flex;align-items:center;gap:10px}.menu-shade{position:fixed;inset:0;z-index:11000}.dropdown{width:202px;border:1px solid #2b3c55;border-radius:11px;background:#141d2c;color:#e7eef9;box-shadow:0 18px 42px rgba(0,0,0,.46);padding:6px}.dropdown button{display:flex;gap:10px;align-items:center;width:100%;border:0;background:transparent;color:#e7eef9;font-size:11px;font-weight:550;text-align:left;padding:11px 10px;cursor:pointer;border-radius:7px;transition:background .16s,color .16s}.dropdown button svg{flex-shrink:0;color:#a3b7cf}.dropdown button:hover,.dropdown button:focus-visible{background:#20385b;color:#6aa7ff;outline:none}.dropdown button:hover svg,.dropdown button:focus-visible svg{color:#6aa7ff}.overlay{position:fixed;inset:0;z-index:15000;background:#030a18d9;display:flex;align-items:center;justify-content:center;padding:15px}.modal{width:100%;max-width:680px;max-height:90vh;display:flex;flex-direction:column;background:var(--bg-card);border:1px solid var(--border);border-radius:13px;overflow:hidden}.modal-head{display:flex;justify-content:space-between;align-items:flex-start;padding:20px;border-bottom:1px solid var(--border)}.modal-head h2{margin:5px 0;font-size:17px}.modal-head p{font-size:11px;color:var(--text-muted)}.close{background:transparent;color:var(--text-secondary);border:0;cursor:pointer}.modal-content{overflow:auto;padding:20px}.info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px}.info-grid>div{padding:12px;background:var(--bg-card-soft);border:1px solid var(--border);border-radius:8px}.info-grid small,.info-grid strong{display:block}.info-grid small{font-size:10px;color:var(--text-muted)}.info-grid strong{font-size:11px;margin-top:5px}.modal h3{font-size:12px;margin:20px 0 7px}.detail-text{font-size:12px;color:var(--text-secondary);line-height:1.6}.doc-row{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px}.doc-row>div{flex:1;min-width:0}.doc-row strong,.doc-row small{display:block;overflow-wrap:anywhere}.doc-row strong{font-size:11px}.doc-row small{font-size:10px;color:var(--text-muted);margin-top:4px}.modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px}.review-note{padding:12px;background:var(--primary-soft);color:var(--text-secondary);border-radius:8px;font-size:11px;line-height:1.6;margin-bottom:14px}.modal label{display:block;font-size:11px;font-weight:700;margin:15px 0 8px}.modal textarea{width:100%;resize:vertical;line-height:1.5}.choice{display:flex;gap:8px}.approved-choice{background:#124d34;color:#76ffb9}.rejected-choice{background:#52212b;color:#ffabb1}.error{font-size:11px;color:var(--red)}.timeline{border-left:2px solid var(--primary);padding:3px 15px 15px;margin-left:5px}.timeline strong{font-size:12px}.timeline p,.timeline small{display:block;font-size:10px;color:var(--text-secondary);margin-top:5px}.paper{background:#fff;color:#182132;padding:30px;min-height:400px;border-radius:6px}.paper h2{text-align:center;font-size:17px;margin:22px 0 30px}.paper-kicker{text-align:center;font-size:10px;color:#64748b}.paper-line{display:flex;gap:10px;border-bottom:1px solid #ddd;padding:13px 0;font-size:12px}.paper-line strong{min-width:120px}.paper-signature{margin-top:45px;text-align:right;font-size:11px}.preview-image{display:block;width:auto;max-width:100%;max-height:62vh;margin:auto}.preview-pdf{width:100%;height:60vh;border:0}@media(max-width:950px){.stats{grid-template-columns:repeat(2,1fr)}.filters{flex-wrap:wrap}.head{flex-wrap:wrap}}@media(max-width:550px){.stats{grid-template-columns:1fr}.info-grid{grid-template-columns:1fr}.modal-head,.modal-content{padding:14px}}
</style>
