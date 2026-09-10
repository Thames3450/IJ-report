import React from 'react'
import { ASSET_TYPE_LABELS } from '../data/constants.js'
import { Empty, Icon, PageTitle, Pill, Th } from './UI.jsx'

function MachineCard({ machine, defects, onOpen }) {
  const a = defects.filter((d) => d.priority === 'A').length
  const b = defects.filter((d) => d.priority === 'B').length
  const tone = a ? 'danger' : b ? 'warn' : defects.length ? 'info' : 'ok'
  const label = a ? 'CRITICAL' : b ? 'WARNING' : defects.length ? 'MONITOR' : 'NORMAL'
  const type = ASSET_TYPE_LABELS[machine.type] || { en: 'Asset' }
  return (
    <button className="machine-card" onClick={() => onOpen(machine.name)}>
      <div className="machine-head"><div><div className="machine-name">{machine.label || machine.name}</div><div className="machine-meta">{type.en} · {machine.zone === 'UTILITY' ? 'Utility' : `Zone ${machine.zone}`}{machine.type === 'INJECTION' ? ` · ${machine.robot ? 'Robot' : 'No Robot'}` : ''}</div></div><Pill tone={tone}>{label}</Pill></div>
      <div className="mini-stats"><div className="mini"><b>{defects.length}</b><span>Open / งานค้าง</span></div><div className="mini"><b>{a}</b><span>Critical / ด่วน</span></div><div className="mini"><b>{b}</b><span>Warning / เตือน</span></div></div>
    </button>
  )
}

export default function Dashboard({ machines, defects, onOpenMachine, onAddDefect }) {
  const open = defects.filter((d) => d.status === 'OPEN')
  const now = new Date()
  const doneMonth = defects.filter((d) => d.status === 'DONE' && d.completed && new Date(d.completed).getMonth() === now.getMonth() && new Date(d.completed).getFullYear() === now.getFullYear()).length
  const counts = { A: open.filter((d) => d.priority === 'A').length, B: open.filter((d) => d.priority === 'B').length, C: open.filter((d) => d.priority === 'C').length }
  const assetCounts = {
    injection: machines.filter((m) => m.type === 'INJECTION').length,
    crane: machines.filter((m) => m.type === 'CRANE').length,
    vacuum: machines.filter((m) => m.type === 'VACUUM_PUMP').length,
    robot: machines.filter((m) => m.type === 'INJECTION' && m.robot).length,
  }
  const ranked = machines.map((m) => {
    const ds = open.filter((d) => d.machine === m.name)
    return { machine: m, ds, score: ds.reduce((s, d) => s + (d.priority === 'A' ? 100 : d.priority === 'B' ? 10 : 1), 0) }
  }).filter((x) => x.ds.length).sort((a, b) => b.score - a.score).slice(0, 6)

  const kpis = [
    ['Assets', 'เครื่องและอุปกรณ์', machines.length, 'Cog-3--Streamline-Ultimate.png'],
    ['Open Defects', 'ปัญหาที่ยังไม่ปิด', open.length, 'Alert-Circle--Streamline-Ultimate.png'],
    ['Critical', 'งานเร่งด่วน', counts.A, 'Alert-Triangle--Streamline-Ultimate.png'],
    ['Waiting Stop', 'รอจังหวะเครื่องหยุด', open.filter((d) => d.stop > 0).length, 'Time-Clock-Hand-1--Streamline-Ultimate.png'],
    ['Completed', 'ปิดงานเดือนนี้', doneMonth, 'Check-Circle-1--Streamline-Ultimate.png'],
  ]

  return <>
    <PageTitle title="Machine Condition Dashboard" th="แดชบอร์ดสภาพเครื่องจักรและอุปกรณ์ IJ" right={<button className="btn primary" onClick={onAddDefect}><Icon name="Add-Circle--Streamline-Core.png" />Add Defect <Th className="light">เพิ่มปัญหา</Th></button>} />
    <div className="kpi-grid">{kpis.map(([en, th, v, icon]) => <div className="kpi" key={en}><div className="kpi-icon"><Icon name={icon} /></div><div className="value">{v}</div><div className="label">{en}</div><div className="sub">{th}</div></div>)}</div>
    <div className="asset-summary dashboard-assets"><div><span>Injection Machines</span><b>{assetCounts.injection}</b><small>เครื่องฉีด</small></div><div><span>Robot Equipped</span><b>{assetCounts.robot}</b><small>เครื่องที่มี Robot</small></div><div><span>Cranes</span><b>{assetCounts.crane}</b><small>เครน</small></div><div><span>Vacuum Pumps</span><b>{assetCounts.vacuum}</b><small>ปั๊มสุญญากาศ</small></div></div>
    <div className="grid-2">
      <div className="card"><h3>Defect Priority <Th>ระดับความสำคัญ</Th></h3>{[['A','Critical / เร่งด่วน','danger'],['B','Warning / ควรแก้ไข','warn'],['C','Monitor / ติดตาม','info']].map(([p,l,t]) => <div className="metric-row" key={p}><div className="grow"><b>{p} · {l}</b><div className="bar"><span style={{ width: `${open.length ? (counts[p] / open.length) * 100 : 0}%` }} /></div></div><Pill tone={t}>{counts[p]}</Pill></div>)}</div>
      <div className="card"><h3>Required Machine Stop <Th>เวลาหยุดเครื่องที่ต้องใช้</Th></h3>{[
        ['No Stop / ไม่ต้องหยุด', open.filter((d) => d.stop === 0).length],
        ['≤ 30 min / Micro Stop', open.filter((d) => d.stop > 0 && d.stop <= 30).length],
        ['31–60 min / Short Stop', open.filter((d) => d.stop > 30 && d.stop <= 60).length],
        ['> 60 min / Shutdown', open.filter((d) => d.stop > 60).length],
      ].map(([l,v]) => <div className="metric-row" key={l}><b>{l}</b><Pill>{v}</Pill></div>)}</div>
    </div>
    <div className="card spaced"><div className="card-title-row"><h3>Assets Requiring Attention <Th>เครื่อง/อุปกรณ์ที่ควรติดตามก่อน</Th></h3><span className="muted">เรียงตามความเสี่ยง</span></div><div className="machine-grid">{ranked.length ? ranked.map((x) => <MachineCard key={x.machine.name} machine={x.machine} defects={x.ds} onOpen={onOpenMachine} />) : <Empty>No open defects / ไม่มีงานค้าง</Empty>}</div></div>
  </>
}
