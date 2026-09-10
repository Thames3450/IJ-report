import React, { useEffect, useState } from 'react'
import { Modal, Pill, Th } from './UI.jsx'

export default function CompleteDefectModal({ open, defect, onClose, onSave, busy }) {
  const [action, setAction] = useState('')
  const [result, setResult] = useState('')
  const [completedBy, setCompletedBy] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')

  useEffect(() => {
    if (!open) return
    setAction('')
    setResult('Normal after repair / หลังซ่อมตรวจสอบแล้วใช้งานได้ปกติ')
    setCompletedBy('')
    setFile(null)
    setPreview('')
  }, [open, defect?.id])

  const pickFile = (e) => {
    const f = e.target.files?.[0] || null
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : '')
  }

  const submit = async () => {
    if (!action.trim()) return alert('Please enter corrective action / กรุณาระบุสิ่งที่ดำเนินการแก้ไข')
    if (!result.trim()) return alert('Please enter result / กรุณาระบุผลหลังการแก้ไข')
    if (!file) return alert('After photo is required / กรุณาแนบรูปหลังแก้อย่างน้อย 1 รูป')
    await onSave(defect.id, { action: action.trim(), result: result.trim(), completedBy: completedBy.trim() }, file)
  }

  if (!defect) return null
  return <Modal open={open} onClose={onClose} width={720}>
    <div className="modal-head"><div><h3>Complete Defect</h3><Th>ปิดงานและบันทึกผลหลังแก้ไข</Th></div><button className="close" onClick={onClose}>×</button></div>
    <div className="completion-summary">
      <div><span>{defect.id}</span><b>{defect.machine} · {defect.problem}</b><small>{defect.component} · {defect.location}</small></div>
      <Pill tone={defect.priority === 'A' ? 'danger' : defect.priority === 'B' ? 'warn' : 'info'}>Priority {defect.priority}</Pill>
    </div>
    {defect.beforePhoto && <div className="before-reference"><img src={defect.beforePhoto} alt="Before" /><div><b>Before / ก่อนแก้</b><small>ใช้รูปนี้เทียบกับสภาพหลังดำเนินการ</small></div></div>}
    <div className="form-grid modal-form">
      <div className="field span-2"><label>Corrective Action * <Th>ดำเนินการแก้ไขอะไร</Th></label><textarea value={action} onChange={(e) => setAction(e.target.value)} placeholder="เช่น เปลี่ยนสายลม Ø8 และ fitting ใหม่ จากนั้นตรวจหารอยรั่วซ้ำ" /></div>
      <div className="field span-2"><label>Result * <Th>ผลหลังแก้ไข</Th></label><textarea value={result} onChange={(e) => setResult(e.target.value)} placeholder="เช่น ไม่พบลมรั่ว เครื่องทำงานปกติ" /></div>
      <div className="field span-2"><label>Completed by <Th>ผู้ดำเนินการ / ผู้ปิดงาน</Th></label><input value={completedBy} onChange={(e) => setCompletedBy(e.target.value)} placeholder="ชื่อผู้ซ่อม / ผู้ตรวจรับ" /></div>
      <div className="field span-2"><div className="label-row"><label>After Photo * <Th>รูปหลังแก้</Th></label><Pill tone="danger">Required / บังคับ</Pill></div><input type="file" accept="image/*" capture="environment" onChange={pickFile} />{preview ? <div className="photo-evidence-preview after"><img src={preview} alt="After Preview" /><div><b>After / หลังแก้</b><small>ถ่ายตำแหน่งเดิมหลังดำเนินการ เพื่อใช้เป็นหลักฐานในรายงาน</small></div></div> : <div className="photo-empty-note">ต้องแนบรูปหลังแก้ก่อนปิดงาน</div>}</div>
    </div>
    <div className="modal-actions"><button className="btn ghost" onClick={onClose}>Cancel / ยกเลิก</button><button className="btn primary" disabled={busy} onClick={submit}>{busy ? 'Saving...' : 'Complete & Save / ปิดงาน'}</button></div>
  </Modal>
}
