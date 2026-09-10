import React from 'react'
import { ASSET_TYPE_LABELS } from '../data/constants.js'
import { Modal, Pill, Th } from './UI.jsx'

export default function MachineModal({ machineName, machines, defects, onClose, onInspect, onOpportunity }) {
  const open = Boolean(machineName)
  const machine = machines.find((m) => m.name === machineName)
  const ds = defects.filter((d) => d.machine === machineName).sort((a,b) => (a.status==='DONE')-(b.status==='DONE') || new Date(b.created)-new Date(a.created))
  const type = ASSET_TYPE_LABELS[machine?.type] || { en: 'Asset', th: 'อุปกรณ์' }
  return <Modal open={open} onClose={onClose} width={720}>
    <div className="modal-head"><div><h3>{machine?.label || machineName}</h3><Th>{type.en} / {type.th}</Th></div><button className="close" onClick={onClose}>×</button></div>
    <div className="machine-detail-head"><b>{machine?.zone === 'UTILITY' ? 'Utility / ระบบกลาง' : `Zone ${machine?.zone || '-'}`}</b><Th>{machine?.location || '-'}{machine?.type === 'INJECTION' ? ` · ${machine?.robot ? 'Robot equipped / มี Robot' : 'No Robot / ไม่มี Robot'}` : ''}</Th><small className="asset-code">Asset Code: {machine?.name || machineName}</small></div>
    <h3 className="detail-heading">Defects / รายการปัญหา</h3>
    {ds.length ? ds.map((d) => <div className="metric-row" key={d.id}><div><b>{d.problem}</b><div className="muted tiny">{d.component} · {d.location}</div></div><div className="right"><Pill tone={d.priority==='A'?'danger':d.priority==='B'?'warn':'info'}>{d.priority} · {d.status}</Pill><div className="muted tiny top-gap">{d.stop} min</div></div></div>) : <div className="empty">No defect history / ยังไม่มีประวัติปัญหา</div>}
    <div className="modal-actions left"><button className="btn primary" onClick={() => onInspect(machineName)}>Inspect Asset / ตรวจเช็ก</button><button className="btn secondary" onClick={() => onOpportunity(machineName)}>Find Work / หางานตามเวลาหยุด</button></div>
  </Modal>
}
