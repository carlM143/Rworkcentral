const fs = require('node:fs')
const read = path => fs.readFileSync(path, 'utf8')
const write = (path, source) => fs.writeFileSync(path, source)
const append = (source, template) => {
  const index = source.lastIndexOf('  </section>', source.lastIndexOf('</template>'))
  if (index < 0) throw new Error('Missing section')
  return source.slice(0, index) + template + '\n' + source.slice(index)
}
{
  const path = 'app/pages/admin/approvals/index.vue'
  let source = read(path)
  source = source.replace('  approveRequest,\r\n  rejectRequest,\r\n', '')
  const start = source.indexOf('const {\r\n  success,')
  if (start < 0) throw new Error('Overview action block not found')
  source = source.slice(0, start) + `const exportOpen = ref(false)
const requestOpen = ref(false)
const requestMode = ref('view')
const selectedRequest = ref<ApprovalRequest | null>(null)
const openRequest = (mode: string, request: ApprovalRequest) => { selectedRequest.value = request; requestMode.value = mode; requestOpen.value = true }
const handleExport = () => { exportOpen.value = true }
const handleView = (request: ApprovalRequest) => openRequest('view', request)
const handleApprove = (request: ApprovalRequest) => openRequest('approve', request)
const handleReject = (request: ApprovalRequest) => openRequest('reject', request)
` + source.slice(source.indexOf('</script>'))
  source = append(source, `    <PayrollExportDialog :open="exportOpen" title="Approval Center Requests" :records="filteredRequests" :sample="false" :filters="{ Search: search, Type: type, Department: department, Priority: priority }" @close="exportOpen = false" />
    <ApprovalRequestDialog :open="requestOpen" kind="Overview" :mode="requestMode" :request="selectedRequest" @close="requestOpen = false" />`)
  write(path, source)
  const tablePath = 'app/components/admin/approvals/ApprovalRequestsTable.vue'
  let table = read(tablePath)
  for (const action of ['View', 'Approve', 'Reject']) table = table.replace('title="' + action + ' request"', 'title="' + action + ' request" aria-label="' + action + ' request"')
  write(tablePath, table)
}
for (const [slug, kind, title, tableName, recordType, filters] of [
  ['leaves', 'Leave', 'Leave Approvals', 'LeaveApprovalTable', 'LeaveApproval', 'Search: search, Department: department, Type: leaveType, Status: status'],
  ['overtime', 'Overtime', 'OT Approvals', 'OvertimeApprovalTable', 'OvertimeApproval', 'Search: search, Department: department, Type: overtimeType, Status: status'],
]) {
  const path = `app/pages/admin/approvals/${slug}/index.vue`
  let source = read(path)
  source = source.replace(/const \{\s*info,\s*\} = useToast\(\)/, `const exportOpen = ref(false)
const requestOpen = ref(false)
const requestMode = ref('view')
const selectedRequest = ref<Record<string, any> | null>(null)
const openRequest = (mode: string, request: Record<string, any>) => { selectedRequest.value = request; requestMode.value = mode; requestOpen.value = true }`)
  source = source.replace(/const handleExport = \(\) => \{[\s\S]*?\n\}/, 'const handleExport = () => { exportOpen.value = true }')
  source = source.replace('<' + tableName, '<' + tableName + ' @action="openRequest"')
  source = append(source, `    <PayrollExportDialog :open="exportOpen" title="${title}" :records="filteredRequests" :sample="false" :date-from="dateFrom" :date-to="dateTo" :filters="{ ${filters} }" @close="exportOpen = false" />
    <ApprovalRequestDialog :open="requestOpen" kind="${kind}" :mode="requestMode" :request="selectedRequest" @close="requestOpen = false" />`)
  write(path, source)
  const tablePath = `app/components/admin/approvals/${slug}/${tableName}.vue`
  let table = read(tablePath).replace('  MoreHorizontal,\r\n', '')
  table = table.replace('const formatDate =', `const emit = defineEmits<{ action: [mode: string, request: ${recordType}] }>()\n\nconst formatDate =`)
  table = table.replace(/<button\s+type="button"\s+class="action-button"\s+title="Approval actions will be added later"[\s\S]*?<\/button>/, `<ApprovalRowActions :request="request" @action="(mode, item) => emit('action', mode, item as ${recordType})" />`)
  write(tablePath, table)
}
{
  const path = 'app/pages/admin/approvals/wfh/index.vue'
  let source = read(path)
  source = source.replace('  approveRequest,\r\n  rejectRequest,\r\n  getApprovedRequests,\r\n', '')
  const actionStart = source.indexOf('const handleApprove =')
  const actionEnd = source.indexOf('/* =========================================\r\n   WFH SCHEDULE', actionStart)
  if (actionStart < 0 || actionEnd < 0) throw new Error('WFH action block not found')
  source = source.slice(0, actionStart) + `const ui = useApprovalUi()
const historyOpen = ref(false)
const historyRequest = ref<WfhApproval | null>(null)
const getApprovedRequests = computed(() => requests.value.filter(request => request.status === 'Approved'))
const handleRowAction = (mode: string, request: WfhApproval) => {
  if (mode === 'history') { historyRequest.value = request; historyOpen.value = true; return }
  openApprovalModal(mode as ModalMode, request)
}
const prepareDecision = (decision: 'approve' | 'reject', request: WfhApproval, remarks: string) => {
  try {
    ui.prepare('WFH', request, decision, remarks)
    success('Decision Preview Prepared', 'The source request and table status remain unchanged. No backend update was sent.')
    closeApprovalModal()
  } catch (problem) { warning('Check Decision', problem instanceof Error ? problem.message : 'Unable to prepare the decision.') }
}
const handleApprove = (request: WfhApproval, remarks: string) => prepareDecision('approve', request, remarks)
const handleReject = (request: WfhApproval, remarks: string) => prepareDecision('reject', request, remarks)

` + source.slice(actionEnd)
  source = source.replace(/@view="openApprovalModal\('view', \$event\)"\s*@review="openApprovalModal\('review', \$event\)"\s*@approve="openApprovalModal\('approve', \$event\)"\s*@reject="openApprovalModal\('reject', \$event\)"/, '@action="handleRowAction"')
  source = source.replace('<WfhApprovalModal', '<WfhApprovalModal :ui-only="true"')
  source = append(source, `    <ApprovalRequestDialog :open="historyOpen" kind="WFH" mode="history" :request="historyRequest" @close="historyOpen = false" />`)
  write(path, source)
  const tablePath = 'app/components/admin/approvals/wfh/WfhApprovalTable.vue'
  let table = read(tablePath).replace('  MoreHorizontal,\r\n', '')
  table = table.replace('const formatDate =', 'const emit = defineEmits<{ action: [mode: string, request: WfhApproval] }>()\n\nconst formatDate =')
  table = table.replace(/<button\s+type="button"\s+class="action-button"\s+title="Approval actions will be added later"[\s\S]*?<\/button>/, `<ApprovalRowActions :request="request" @action="(mode, item) => emit('action', mode, item as WfhApproval)" />`)
  write(tablePath, table)
}
