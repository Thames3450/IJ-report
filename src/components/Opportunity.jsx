import React, { useEffect, useMemo, useState } from 'react'
import { Empty, Icon, PageTitle, Pill, Th } from './UI.jsx'

export default function Opportunity({ machines, defects, onComplete, preferredMachine }) {
  const [machine, setMachine] = useState('ALL')
  const [minutes, setMinutes] = useState(30)
  useEffect(() => { if (preferredMachine && machines.find((m) => m.name === preferredMachine)) setMachine(preferredMachine) }, [preferredMachine, machines])
  const machineMap = useMemo(() => Object.fromEntries(machines.map((m) => [m.name, m])), [machines])
  const ready = useMemo(() => defects.filter((d) => d.status === 'OPEN' && d.stop <= minutes && (machine === 'ALL' || d.machine === machine)).sort((a,b) => ({A:0,B:1,C:2}[a.priority]-({A:0,B:1,C:2}[b.priority]) || a.stop-b.stop)), [defects, machine, minutes])
  const total = ready.reduce((s,d) => s + d.repair, 0)
  return <>
    <PageTitle title="Opportunity Maintenance" th="เลือกงานที่เหมาะกับเวลาที่ Production ให้หยุดเครื่องหรืออุปกรณ์" />
    <div className="card opportunity-control"><div className="field grow"><label>Asset <Th>เครื่อง / อุปกรณ์</Th></label><select value={machine} onChange={(e) => setMachine(e.target.value)}><option value="ALL">All Assets / ทั้งหมด</option>{machines.map((m) => <option key={m.name} value={m.name}>{m.label || m.name} · {m.zone}</option>)}</select></div><div className="field grow"><label>Available Stop Time <Th>เวลาที่หยุดได้</Th></label><div className="time-buttons">{[10,20,30,60,120].map((m) => <button key={m} className={`time-btn ${minutes === m ? 'active' : ''}`} onClick={() => setMinutes(m)}>{m === 120 ? '120+' : m} MIN</button>)}</div></div></div>
    <div className="summary-strip"><div><span>Matched jobs</span><b>{ready.length}</b><small>งานที่ทำได้ในเวลานี้</small></div><div><span>Total repair time</span><b>{total} min</b><small>รวมเวลาซ่อมโดยประมาณ</small></div><div><span>Parts ready</span><b>{ready.filter((d) => d.parts === 'READY' || d.parts === 'NONE').length}</b><small>งานที่อะไหล่พร้อม</small></div></div>
    <div className="op-list">{ready.length ? ready.map((d) => {
      const asset = machineMap[d.machine]
      return <div className="op-card" key={d.id}><div className="op-icon"><Icon name={d.priority === 'A' ? 'Alert-Triangle--Streamline-Ultimate.png' : 'Hammer-Wrench--Streamline-Ultimate.png'} /></div><div className="grow"><div className="eyebrow">{asset?.label || d.machine} · {d.id}</div><h3>{d.problem}</h3><p>{d.component} · {d.location}</p><div className="op-tags"><Pill tone={d.priority === 'A' ? 'danger' : d.priority === 'B' ? 'warn' : 'info'}>{d.priority}</Pill><Pill>{d.stop} min stop</Pill><Pill tone={d.parts === 'READY' || d.parts === 'NONE' ? 'ok' : 'warn'}>{d.parts === 'READY' ? 'Parts ready' : d.parts === 'NONE' ? 'No parts needed' : 'Parts not ready'}</Pill></div></div><button className="btn secondary" onClick={() => onComplete(d.id)}>Complete <Th>ปิดงาน</Th></button></div>
    }) : <Empty>No work fits this stop window / ยังไม่มีงานที่เหมาะกับเวลาหยุดนี้</Empty>}</div>
  </>
}
