import React, { useEffect, useState } from 'react'
import { Modal, Pill, Th } from './UI.jsx'

const blank = {
  machine: '', component: '', problem: '', location: '', priority: 'B', stop: 20,
  repair: 20, parts: 'READY', action: '',
}

export default function DefectModal({ open, onClose, machines, initialMachine, preset, onSave, busy }) {
  const [form, setForm] = useState(blank)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')

  useEffect(() => {
    if (!open) return
    const next = { ...blank, machine: initialMachine || machines[0]?.name || '', ...(preset || {}) }
    setForm(next)
    setFile(null)
    setPreview('')
  }, [open, initialMachine, preset, machines])

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))
  const pickFile = (e) => {
    const f = e.target.files?.[0] || null
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : '')
  }
  const submit = async () => {
    if (!form.problem.trim()) return alert('Please enter problem / กรุณาระบุอาการผิดปกติ')
    if (!form.location.trim()) return alert('Please enter location / กรุณาระบุตำแหน่งที่พบ')
    if (!file) return alert('Before photo is required / กรุณาแนบรูปก่อนแก้อย่างน้อย 1 รูป')
    await onSave({ ...form, stop: Number(form.stop || 0), repair: Number(form.repair || 0) }, file)
  }

  return (
    <Modal open={open} onClose={onClose} width={760}>
      <div className="modal-head">
        <div><h3>Add Defect</h3><Th>เพิ่มรายการปัญหา</Th></div>
        <button className="close" onClick={onClose}>×</button>
      </div>
      <div className="flow-note"><b>พบปัญหา → ระบุตำแหน่ง → ถ่ายรูปก่อนแก้</b><span>ระบบจะเก็บรายการนี้ไว้ใน Defect Backlog เพื่อรอจังหวะซ่อม</span></div>
      <div className="form-grid modal-form">
        <div className="field"><label>Asset <Th>เครื่อง / อุปกรณ์</Th></label><select value={form.machine} onChange={(e) => set('machine', e.target.value)}>{machines.map((m) => <option key={m.name} value={m.name}>{m.label || m.name} · {m.type === 'INJECTION' ? 'Injection' : m.type === 'CRANE' ? 'Crane' : 'Vacuum Pump'}</option>)}</select></div>
        <div className="field"><label>Component <Th>อุปกรณ์ / ชุดงาน</Th></label><input value={form.component} onChange={(e) => set('component', e.target.value)} placeholder="e.g. Air hose, Hoist brake, Vacuum filter" /></div>
        <div className="field span-2"><label>Problem / Defect * <Th>อาการผิดปกติ</Th></label><input value={form.problem} onChange={(e) => set('problem', e.target.value)} placeholder="e.g. Air leakage / ลมรั่ว" /></div>
        <div className="field span-2"><label>Location * <Th>ตำแหน่งที่พบ</Th></label><input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Rear injection unit / ด้านหลัง Injection Unit" /></div>
        <div className="field"><label>Priority <Th>ระดับความสำคัญ</Th></label><select value={form.priority} onChange={(e) => set('priority', e.target.value)}><option value="A">A - Critical / เร่งด่วน</option><option value="B">B - Warning / ควรแก้ไข</option><option value="C">C - Monitor / ติดตาม</option></select></div>
        <div className="field"><label>Required Stop <Th>เวลาที่ต้องหยุด (นาที)</Th></label><input type="number" min="0" value={form.stop} onChange={(e) => set('stop', e.target.value)} /></div>
        <div className="field"><label>Repair Time <Th>เวลาซ่อมโดยประมาณ (นาที)</Th></label><input type="number" min="0" value={form.repair} onChange={(e) => set('repair', e.target.value)} /></div>
        <div className="field"><label>Spare Parts <Th>สถานะอะไหล่</Th></label><select value={form.parts} onChange={(e) => set('parts', e.target.value)}><option value="READY">Ready / พร้อม</option><option value="NOT_READY">Not Ready / ยังไม่พร้อม</option><option value="NONE">Not Required / ไม่ใช้</option></select></div>
        <div className="field span-2"><div className="label-row"><label>Before Photo * <Th>รูปก่อนแก้</Th></label><Pill tone="danger">Required / บังคับ</Pill></div><input type="file" accept="image/*" capture="environment" onChange={pickFile} />{preview ? <div className="photo-evidence-preview"><img src={preview} alt="Before Preview" /><div><b>Before / ก่อนแก้</b><small>ถ่ายให้เห็นจุดและชิ้นส่วนที่มีปัญหาชัดเจน</small></div></div> : <div className="photo-empty-note">แนบรูปเพื่อให้คนซ่อมหาตำแหน่งเจอ — เช่น ถ้าลมรั่ว ให้ถ่าย Hose/Fitting/Cylinder ตรงจุดที่รั่ว</div>}</div>
        <div className="field span-2"><label>Recommended Action / Remark <Th>แนวทางแก้ไข / หมายเหตุ</Th></label><textarea value={form.action} onChange={(e) => set('action', e.target.value)} placeholder="Required action / รายละเอียดการแก้ไข" /></div>
      </div>
      <div className="modal-actions"><button className="btn ghost" onClick={onClose}>Cancel / ยกเลิก</button><button className="btn primary" disabled={busy} onClick={submit}>{busy ? 'Saving...' : 'Save Defect / บันทึก'}</button></div>
    </Modal>
  )
}
