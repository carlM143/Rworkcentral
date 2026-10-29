export type WfhStatus = 'Pending' | 'For Review' | 'Approved' | 'Rejected'
export type WfhDocType = 'WFH Application Form' | 'Supporting Document' | 'Identification'
export interface WfhDocument { id: string; name: string; kind: WfhDocType; mime: string; url?: string; uploadedAt: string; sample?: boolean }
export interface WfhEntry {
  id: string; employee: string; employeeNo: string; department: string; type: string
  start: string; end: string; location: string; reason: string; workPlan: string
  supervisor: string; submittedAt: string; status: WfhStatus; reviewedBy?: string
  reviewedAt?: string; reviewNotes?: string; documents: WfhDocument[]
  history: { action: string; actor: string; when: string; notes?: string }[]
}
const demo = [
  ['WFH-2026-001','Carlo Mendoza','EMP-005','Information Technology','Full Day WFH','2026-10-08','2026-10-08','Home','Home internet maintenance appointment','Continue API integration, bug fixes and code review','IT Manager','Pending'],
  ['WFH-2026-002','Mark Lopez','EMP-007','Information Technology','Half Day WFH','2026-10-09','2026-10-09','Home','Personal appointment in the morning','Remote technical support and documentation updates','IT Manager','For Review'],
  ['WFH-2026-003','Maria Santos','EMP-002','Human Resources','Hybrid Schedule','2026-10-12','2026-10-13','Home / Main Office','HR documentation and reporting','Prepare reports and conduct online meetings','General Manager','Approved'],
  ['WFH-2026-004','Pedro Reyes','EMP-003','Finance','Full Day WFH','2026-10-10','2026-10-10','Home','Transportation issue','Payroll reconciliation and reporting','Finance Manager','Rejected'],
  ['WFH-2026-005','Jenny Ramos','EMP-008','Human Resources','Full Day WFH','2026-10-15','2026-10-15','Home','Family-related arrangements','Recruitment screening and record updates','HR Manager','Pending'],
  ['WFH-2026-006','Angela Flores','EMP-006','Billing','Half Day WFH','2026-10-11','2026-10-11','Home','Medical appointment','Billing verification in the afternoon','Billing Supervisor','For Review'],
  ['WFH-2026-007','Joshua Fernandez','EMP-013','Operations','Full Day WFH','2026-10-16','2026-10-16','Home','Temporary transport disruption','Daily coordination and service monitoring','Operations Manager','Pending'],
  ['WFH-2026-008','Nicole Bautista','EMP-014','Human Resources','Full Day WFH','2026-10-19','2026-10-19','Home','Home service appointment','Employee file reconciliation','HR Manager','Pending'],
  ['WFH-2026-009','Kevin Ramos','EMP-015','Information Technology','Half Day WFH','2026-10-20','2026-10-20','Home','Scheduled household errand','Testing and deployment checks','IT Manager','Pending'],
  ['WFH-2026-010','Ana Garcia','EMP-004','Operations','Full Day WFH','2026-10-21','2026-10-21','Home','Temporary family care arrangement','Coordinate remotely with team','Operations Manager','Pending'],
] as const

export const useWfhDemo = () => {
  const entries = useState<WfhEntry[]>('rworkcentral-wfh-demo-v1', () => demo.map((v, index) => ({
    id: v[0], employee: v[1], employeeNo: v[2], department: v[3], type: v[4],
    start: v[5], end: v[6], location: v[7], reason: v[8], workPlan: v[9],
    supervisor: v[10], status: v[11] as WfhStatus, submittedAt: '2026-10-06 09:20',
    reviewedBy: index === 2 ? 'General Manager' : index === 3 ? 'Maria Santos' : undefined,
    reviewedAt: index === 2 || index === 3 ? '2026-10-07 15:00' : undefined,
    reviewNotes: index === 3 ? 'On-site coverage required for this schedule.' : undefined,
    documents: [
      { id: `sample-${index}`, name: `Signed_WFH_Form_${v[2]}.jpg`, kind: 'WFH Application Form' as const, mime: 'image/jpeg', uploadedAt: '2026-10-06 09:20', sample: true },
      ...(index % 3 === 0 ? [{ id: `support-${index}`, name: 'Supporting_Note.pdf', kind: 'Supporting Document' as const, mime: 'application/pdf', uploadedAt: '2026-10-06 09:20', sample: true }] : []),
    ],
    history: [{ action: 'Application submitted', actor: v[1], when: '2026-10-06 09:20', notes: 'Demo record' }],
  })))
  const review = (id: string, status: WfhStatus, notes: string) => {
    const item = entries.value.find(r => r.id === id)
    if (!item) return
    item.status = status
    item.reviewedBy = 'Maria Santos (Demo HR)'
    item.reviewedAt = new Date().toLocaleString('en-PH')
    item.reviewNotes = notes
    item.history.unshift({ action: `Marked ${status}`, actor: 'Maria Santos (Demo HR)', when: item.reviewedAt, notes })
  }
  const addDocument = (id: string, doc: WfhDocument) => {
    const item = entries.value.find(r => r.id === id)
    if (!item) return
    item.documents.push(doc)
    item.history.unshift({ action: 'Document attached', actor: 'Maria Santos (Demo HR)', when: doc.uploadedAt, notes: doc.name })
  }
  return { entries, review, addDocument }
}
