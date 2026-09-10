import React, { useMemo, useState } from 'react'
import { ASSET_TYPE_LABELS } from '../data/constants.js'
import { PageTitle, Pill, Th } from './UI.jsx'

const typeName = (type) => ASSET_TYPE_LABELS[type] || { en: type || 'Asset', th: 'อุปกรณ์' }

export default function Machines({ machines, defects, onOpenMachine }) {
  const [zone, setZone] = useState('ALL')
  const [type, setType] = useState('ALL')
  const [query, setQuery] = useState('')
  const open = defects.filter((d) => d.status === 'OPEN')
  const filtered = useMemo(() => machines.filter((m) => {
    const matchesZone = zone === 'ALL' || m.zone === zone
    const matchesType = type === 'ALL' || m.type === type
    const haystack = `${m.name} ${m.label || ''} ${m.location || ''} ${m.zone || ''}`.toLowerCase()
    return matchesZone && matchesType && haystack.includes(query.toLowerCase())
  }), [machines, zone, type, query])

  const counts = useMemo(() => ({
    all: machines.length,
    injection: machines.filter((m) => m.type === 'INJECTION').length,
    crane: machines.filter((m) => m.type === 'CRANE').length,
    vacuum: machines.filter((m) => m.type === 'VACUUM_PUMP').length,
  }), [machines])

  return <>
    <PageTitle title="Machines & Utilities" th="รายการเครื่องจักรและอุปกรณ์แผนก IJ" />
    <div className="asset-summary no-print">
      <div><span>All Assets</span><b>{counts.all}</b><small>ทั้งหมด</small></div>
      <div><span>Injection</span><b>{counts.injection}</b><small>เครื่องฉีด</small></div>
      <div><span>Crane</span><b>{counts.crane}</b><small>เครน</small></div>
      <div><span>Vacuum Pump</span><b>{counts.vacuum}</b><small>ปั๊มสุญญากาศ</small></div>
    </div>
    <div className="toolbar card compact">
      <div className="field grow"><label>Search / ค้นหา</label><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="650T-9, Crane No.4, Vacuum Pump..." /></div>
      <div className="field"><label>Type / ประเภท</label><select value={type} onChange={(e) => setType(e.target.value)}><option value="ALL">All Types / ทุกประเภท</option><option value="INJECTION">Injection / เครื่องฉีด</option><option value="CRANE">Crane / เครน</option><option value="VACUUM_PUMP">Vacuum Pump / ปั๊มสุญญากาศ</option></select></div>
      <div className="field"><label>Zone / โซน</label><select value={zone} onChange={(e) => setZone(e.target.value)}><option value="ALL">All Zones / ทุกโซน</option><option>A1</option><option>A2</option><option>A3</option><option>A4</option><option value="UTILITY">Utility / ระบบกลาง</option></select></div>
    </div>
    <div className="machine-grid">{filtered.map((m) => {
      const ds = open.filter((d) => d.machine === m.name)
      const a = ds.filter((d) => d.priority === 'A').length
      const b = ds.filter((d) => d.priority === 'B').length
      const tn = typeName(m.type)
      return <button className="machine-card" key={m.name} onClick={() => onOpenMachine(m.name)}>
        <div className="machine-head"><div><div className="machine-name">{m.label || m.name}</div><div className="machine-meta">{tn.en} · {m.zone === 'UTILITY' ? 'Utility' : `Zone ${m.zone}`}{m.type === 'INJECTION' ? ` · ${m.robot ? 'Robot' : 'No Robot'}` : ''}</div><div className="machine-location">{m.location || ''}</div></div><Pill tone={a ? 'danger' : b ? 'warn' : ds.length ? 'info' : 'ok'}>{a ? 'CRITICAL' : b ? 'WARNING' : ds.length ? 'MONITOR' : 'NORMAL'}</Pill></div>
        <div className="asset-type-sub">{tn.th}</div>
        <div className="mini-stats"><div className="mini"><b>{ds.length}</b><span>Open / งานค้าง</span></div><div className="mini"><b>{a}</b><span>Critical / ด่วน</span></div><div className="mini"><b>{b}</b><span>Warning / เตือน</span></div></div>
      </button>
    })}</div>
  </>
}
