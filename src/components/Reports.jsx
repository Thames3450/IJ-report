import React, { useMemo, useState } from 'react'
import { Icon, PageTitle, Pill, Th } from './UI.jsx'

const dateInput = (d) => d.toISOString().slice(0,10)
const csvEscape = (v) => `"${String(v ?? '').replaceAll('"','""')}"`

export default function Reports({ machines, defects }) {
  const now = new Date()
  const [from, setFrom] = useState(dateInput(new Date(now.getFullYear(), now.getMonth(), 1)))
  const [to, setTo] = useState(dateInput(now))
  const [zone, setZone] = useState('ALL')
  const [type, setType] = useState('ALL')
  const selectedMachines = useMemo(() => machines.filter((m) => (zone === 'ALL' || m.zone === zone) && (type === 'ALL' || m.type === type)), [machines, zone, type])
  const machineNames = useMemo(() => new Set(selectedMachines.map((m) => m.name)), [selectedMachines])
  const machineMap = useMemo(() => Object.fromEntries(machines.map((m) => [m.name, m])), [machines])
  const filtered = useMemo(() => defects.filter((d) => {
    const dt = new Date(d.created)
    const start = new Date(`${from}T00:00:00`)
    const end = new Date(`${to}T23:59:59`)
    return machineNames.has(d.machine) && dt >= start && dt <= end
  }), [defects, machineNames, from, to])
  const open = filtered.filter((d) => d.status === 'OPEN')
  const done = filtered.filter((d) => d.status === 'DONE')
  const critical = open.filter((d) => d.priority === 'A')
  const waiting = open.filter((d) => d.stop > 0)
  const partsReady = open.filter((d) => d.parts === 'READY' || d.parts === 'NONE')
  const rank = [...new Set(open.map((d) => d.machine))].map((name) => ({ name, defects: open.filter((d) => d.machine === name) })).sort((a,b) => b.defects.filter((d)=>d.priority==='A').length - a.defects.filter((d)=>d.priority==='A').length || b.defects.length-a.defects.length).slice(0,5)
  const evidenceDone = [...done].sort((a,b) => new Date(b.completed || 0) - new Date(a.completed || 0)).slice(0,6)

  const printReport = () => window.print()
  const exportCSV = () => {
    const headers = ['ID','Asset Code','Asset Name','Type','Zone','Component','Problem','Location','Priority','Required Stop (min)','Repair Time (min)','Parts','Status','Created','Completed','Recommended Action','Corrective Action','Result','Completed By','Problem Photos','After Photo']
    const rows = filtered.map((d) => {
      const m = machineMap[d.machine]
      return [d.id,d.machine,m?.label || d.machine,m?.type || '',m?.zone || '',d.component,d.problem,d.location,d.priority,d.stop,d.repair,d.parts,d.status,d.created,d.completed||'',d.action,d.resolutionAction||'',d.resolutionResult||'',d.completedBy||'',(d.beforePhotos?.length ? d.beforePhotos.join(' | ') : (d.beforePhoto||'')),d.afterPhoto||'']
    })
    const csv = '\ufeff' + [headers,...rows].map((r) => r.map(csvEscape).join(',')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `IJ-Maintenance-Report-${from}-${to}.csv`; a.click(); URL.revokeObjectURL(url)
  }
  const exportHTML = () => {
    const content = document.getElementById('report-sheet')?.outerHTML || ''
    const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>IJ Maintenance Report</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>body{font-family:'Sarabun',sans-serif;background:#f5f7fb;margin:0;padding:28px;color:#172033}.report-sheet{max-width:1000px;margin:auto;background:white;padding:30px;border-radius:20px}.report-kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.report-kpi,.report-block{border:1px solid #e7ebf1;border-radius:14px;padding:14px}.report-kpi b{display:block;font-size:28px}.report-table{width:100%;border-collapse:collapse}.report-table th,.report-table td{padding:9px;border-bottom:1px solid #e7ebf1;text-align:left;font-size:12px}.pill{display:inline-block;padding:4px 8px;border-radius:99px;background:#f1f4f8;font-size:11px}.th{display:block;color:#7b8798;font-size:.8em}.report-evidence-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.report-evidence-item{border:1px solid #e7ebf1;border-radius:14px;padding:10px}.report-evidence-images{display:grid;grid-template-columns:1fr 1fr;gap:6px}.report-evidence-images img{width:100%;height:120px;object-fit:cover;border-radius:8px}.report-before-gallery{display:grid;grid-template-columns:repeat(2,1fr);gap:4px}.report-before-gallery img{height:58px}.report-evidence-item small{display:block;color:#7b8798}.report-evidence-item p{font-size:11px;margin:5px 0}@media(max-width:700px){.report-kpis{grid-template-columns:1fr 1fr}.report-sheet{padding:16px}.report-evidence-grid{grid-template-columns:1fr}}</style></head><body>${content}</body></html>`
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=`IJ-Maintenance-Report-${from}-${to}.html`; a.click(); URL.revokeObjectURL(url)
  }

  const scopeText = `${zone === 'ALL' ? 'All Zones / ทุกโซน' : zone === 'UTILITY' ? 'Utility / ระบบกลาง' : `Zone ${zone}`} · ${type === 'ALL' ? 'All Asset Types / ทุกประเภท' : type === 'INJECTION' ? 'Injection / เครื่องฉีด' : type === 'CRANE' ? 'Crane / เครน' : 'Vacuum Pump / ปั๊มสุญญากาศ'}`

  return <>
    <PageTitle title="Maintenance Report" th="รายงานสรุปสำหรับนำเสนอหัวหน้าและ Production" />
    <div className="toolbar card compact no-print"><div className="field"><label>From / จากวันที่</label><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div><div className="field"><label>To / ถึงวันที่</label><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div><div className="field"><label>Type / ประเภท</label><select value={type} onChange={(e) => setType(e.target.value)}><option value="ALL">All Types / ทุกประเภท</option><option value="INJECTION">Injection / เครื่องฉีด</option><option value="CRANE">Crane / เครน</option><option value="VACUUM_PUMP">Vacuum Pump / ปั๊มสุญญากาศ</option></select></div><div className="field"><label>Zone / โซน</label><select value={zone} onChange={(e) => setZone(e.target.value)}><option value="ALL">All Zones / ทุกโซน</option><option>A1</option><option>A2</option><option>A3</option><option>A4</option><option value="UTILITY">Utility / ระบบกลาง</option></select></div><div className="export-menu"><button className="btn primary" onClick={printReport}><Icon name="Print-Text--Streamline-Ultimate.png" />Print / Save PDF <Th className="light">พิมพ์ / บันทึก PDF</Th></button><button className="btn secondary" onClick={exportHTML}><Icon name="Harddrive-Download-1--Streamline-Ultimate.png" />Report File</button><button className="btn ghost" onClick={exportCSV}>CSV</button></div></div>
    <div className="report-sheet" id="report-sheet">
      <div className="report-header"><div><div className="eyebrow">IJ MAINTENANCE · MACHINE CONDITION & PM</div><h2>Executive Maintenance Report</h2><p>รายงานสรุปสภาพเครื่องจักรและงานซ่อมบำรุง</p></div><div className="report-period"><b>{from}</b><span>to / ถึง</span><b>{to}</b><small>{scopeText}</small></div></div>
      <div className="report-kpis">{[['Assets',machineNames.size,'เครื่อง/อุปกรณ์'],['Open',open.length,'งานค้าง'],['Critical',critical.length,'เร่งด่วน'],['Waiting Stop',waiting.length,'รอหยุดเครื่อง'],['Completed',done.length,'ปิดงาน']].map(([l,v,s]) => <div className="report-kpi" key={l}><span>{l}</span><b>{v}</b><small>{s}</small></div>)}</div>
      <div className="report-grid"><div className="report-block"><h3>Management Summary <Th>สรุปสำหรับผู้บริหาร</Th></h3><p>ช่วงรายงานนี้พบปัญหา {filtered.length} รายการ ปัจจุบันยังเปิดอยู่ {open.length} รายการ โดยมี Critical {critical.length} รายการ และมีงาน {waiting.length} รายการที่ต้องรอจังหวะหยุดเครื่องหรืออุปกรณ์</p><p>งานเปิดที่สามารถเริ่มได้เมื่อมีเวลาหยุดและอะไหล่พร้อม/ไม่ต้องใช้อะไหล่: <b>{partsReady.length}</b> รายการ</p></div><div className="report-block"><h3>High Attention Assets <Th>เครื่อง/อุปกรณ์ที่ควรเร่งติดตาม</Th></h3>{rank.length ? rank.map((r) => <div className="metric-row" key={r.name}><div><b>{machineMap[r.name]?.label || r.name}</b><small>{r.defects.length} open defects</small></div><Pill tone={r.defects.some((d)=>d.priority==='A')?'danger':'warn'}>{r.defects.filter((d)=>d.priority==='A').length} Critical</Pill></div>) : <p className="muted">No open defects / ไม่มีงานค้าง</p>}</div></div>
      <div className="report-block"><h3>Priority Action List <Th>รายการงานที่ควรดำเนินการ</Th></h3><div className="table-wrap"><table className="report-table"><thead><tr><th>Asset</th><th>Problem</th><th>Priority</th><th>Stop</th><th>Parts</th><th>Status</th></tr></thead><tbody>{[...open].sort((a,b)=>({A:0,B:1,C:2}[a.priority]-({A:0,B:1,C:2}[b.priority]))).slice(0,25).map((d) => <tr key={d.id}><td><b>{machineMap[d.machine]?.label || d.machine}</b><small>{d.id} · {machineMap[d.machine]?.zone || ''}</small></td><td>{d.problem}<small>{d.component} · {d.location}</small></td><td>{d.priority}</td><td>{d.stop} min</td><td>{d.parts}</td><td>{d.status}</td></tr>)}</tbody></table></div></div>
      {evidenceDone.length > 0 && <div className="report-block report-evidence-block"><h3>Completed Work Evidence <Th>หลักฐานงานที่ปิดแล้ว Before / After</Th></h3><div className="report-evidence-grid">{evidenceDone.map((d) => <div className="report-evidence-item" key={d.id}><div className="report-evidence-head"><div><b>{machineMap[d.machine]?.label || d.machine} · {d.problem}</b><small>{d.id} · {d.component} · {d.location}</small></div><Pill tone="ok">Completed</Pill></div><div className="report-evidence-images multi-report"><div><span>Problem Photos ({d.beforePhotos?.length || (d.beforePhoto ? 1 : 0)})</span>{(d.beforePhotos?.length || d.beforePhoto) ? <div className="report-before-gallery">{(d.beforePhotos?.length ? d.beforePhotos : [d.beforePhoto]).slice(0,4).map((src,index)=><img key={`${src}-${index}`} src={src} alt={`Problem ${index+1}`} />)}</div> : <div className="report-photo-missing">No photo</div>}</div><div><span>After</span>{d.afterPhoto ? <img src={d.afterPhoto} alt="After" /> : <div className="report-photo-missing">No photo</div>}</div></div><p><b>Action:</b> {d.resolutionAction || '-'}</p><p><b>Result:</b> {d.resolutionResult || '-'}</p>{d.completedBy && <small>Completed by: {d.completedBy}</small>}</div>)}</div></div>}
      <div className="report-footer">Generated by IJ Maintenance · React Web App <span>สร้างจากระบบ IJ Maintenance</span></div>
    </div>
  </>
}
