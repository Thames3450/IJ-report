import React, { useMemo, useState } from 'react'
import { Empty, Icon, PageTitle, Pill, Th } from './UI.jsx'

function priorityPill(p) { return <Pill tone={p === 'A' ? 'danger' : p === 'B' ? 'warn' : 'info'}>{p} · {p === 'A' ? 'Critical' : p === 'B' ? 'Warning' : 'Monitor'}</Pill> }
function partsPill(p) { return <Pill tone={p === 'READY' ? 'ok' : p === 'NOT_READY' ? 'warn' : 'info'}>{p === 'READY' ? 'Ready / พร้อม' : p === 'NOT_READY' ? 'Not ready / ยังไม่พร้อม' : 'N/A'}</Pill> }

export default function Defects({ machines, defects, onAdd, onComplete, onReopen }) {
  const [status, setStatus] = useState('OPEN')
  const [priority, setPriority] = useState('ALL')
  const [query, setQuery] = useState('')
  const machineMap = useMemo(() => Object.fromEntries(machines.map((m) => [m.name, m])), [machines])
  const filtered = useMemo(() => defects.filter((d) => {
    const asset = machineMap[d.machine]
    const haystack = `${d.machine} ${asset?.label || ''} ${d.problem} ${d.component} ${d.location} ${d.resolutionAction || ''} ${d.resolutionResult || ''}`.toLowerCase()
    return (status === 'ALL' || d.status === status) && (priority === 'ALL' || d.priority === priority) && haystack.includes(query.toLowerCase())
  }).sort((a,b) => ({A:0,B:1,C:2}[a.priority]-({A:0,B:1,C:2}[b.priority]) || new Date(b.created)-new Date(a.created))), [defects, machineMap, status, priority, query])

  return <>
    <PageTitle title="Defect Backlog" th="รายการปัญหาและงานค้าง" right={<button className="btn primary" onClick={onAdd}><Icon name="Add-Circle--Streamline-Core.png" />Add Defect <Th className="light">เพิ่มปัญหา</Th></button>} />
    <div className="evidence-rule card compact"><div><b>Evidence rule / กติกาหลักฐาน</b><small>เปิด Defect ต้องมีรูปก่อนแก้ · ปิดงานต้องมีรูปหลังแก้ + Action + Result</small></div><div className="evidence-rule-tags"><Pill tone="warn">Before required</Pill><Pill tone="ok">After required</Pill></div></div>
    <div className="toolbar card compact"><div className="field grow"><label>Search / ค้นหา</label><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Asset, problem, location..." /></div><div className="field"><label>Status / สถานะ</label><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="OPEN">Open / งานค้าง</option><option value="DONE">Completed / เสร็จแล้ว</option><option value="ALL">All / ทั้งหมด</option></select></div><div className="field"><label>Priority</label><select value={priority} onChange={(e) => setPriority(e.target.value)}><option value="ALL">All</option><option>A</option><option>B</option><option>C</option></select></div></div>
    <div className="defect-list">{filtered.length ? filtered.map((d) => {
      const asset = machineMap[d.machine]
      return <div className="defect-card" key={d.id}>
        <div className="defect-main">
          <div className="defect-title-row"><div><div className="eyebrow">{d.id} · {asset?.label || d.machine}</div><h3>{d.problem}</h3><p>{d.component || 'General'} · {d.location || '-'}</p></div>{priorityPill(d.priority)}</div>

          <div className={`evidence-photos ${d.afterPhoto ? 'two' : 'one'}`}>
            <div className="evidence-photo-card before">
              <span>Before / ก่อนแก้</span>
              {d.beforePhoto ? <img src={d.beforePhoto} alt={`Before ${d.problem}`} /> : <div className="missing-photo">No photo / ไม่มีรูป</div>}
            </div>
            {d.status === 'DONE' && <div className="evidence-photo-card after">
              <span>After / หลังแก้</span>
              {d.afterPhoto ? <img src={d.afterPhoto} alt={`After ${d.problem}`} /> : <div className="missing-photo">No photo / ไม่มีรูป</div>}
            </div>}
          </div>

          <div className="defect-meta"><div><span>Required Stop</span><b>{d.stop} min</b><small>เวลาหยุดเครื่อง</small></div><div><span>Repair Time</span><b>{d.repair} min</b><small>เวลาซ่อม</small></div><div><span>Spare Parts</span>{partsPill(d.parts)}</div><div><span>Status</span><Pill tone={d.status === 'DONE' ? 'ok' : 'info'}>{d.status === 'DONE' ? 'Completed / เสร็จแล้ว' : 'Open / งานค้าง'}</Pill></div></div>
          {d.action && <div className="action-box"><b>Recommended Action / แนวทางก่อนซ่อม</b><p>{d.action}</p></div>}
          {d.status === 'DONE' && <div className="resolution-box"><div><b>Corrective Action / สิ่งที่ดำเนินการ</b><p>{d.resolutionAction || '-'}</p></div><div><b>Result / ผลหลังแก้ไข</b><p>{d.resolutionResult || '-'}</p></div>{d.completedBy && <small>Completed by / ผู้ปิดงาน: {d.completedBy}</small>}</div>}
        </div>
        <div className="defect-actions">{d.status === 'OPEN' ? <button className="btn secondary" onClick={() => onComplete(d.id)}><Icon name="Check-Circle-1--Streamline-Ultimate.png" />Complete <Th>ปิดงาน</Th></button> : <button className="btn ghost" onClick={() => onReopen(d.id)}>Reopen / เปิดงานอีกครั้ง</button>}</div>
      </div>
    }) : <Empty>No matching defects / ไม่พบรายการ</Empty>}</div>
  </>
}
