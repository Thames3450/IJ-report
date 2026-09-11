import React, { useEffect, useMemo, useState } from 'react'
import { getInspectionCategories } from '../data/constants.js'
import { Icon, PageTitle, Pill, Th } from './UI.jsx'

function defaultDefect(item) {
  return {
    status: 'DEFECT',
    component: item.split(' / ')[0],
    problem: '',
    location: '',
    priority: 'B',
    stop: 20,
    repair: 20,
    parts: 'NOT_READY',
    action: '',
    beforeFiles: [],
    beforePreviews: [],
  }
}

export default function Inspection({ machines, onSave, busy, preferredMachine }) {
  const [machine, setMachine] = useState(machines[0]?.name || '')
  const [inspector, setInspector] = useState('')
  const [active, setActive] = useState('')
  const [draft, setDraft] = useState({})
  const selected = machines.find((m) => m.name === machine) || machines[0]
  const inspectionCategories = useMemo(() => getInspectionCategories(selected), [selected])
  const categories = useMemo(() => Object.keys(inspectionCategories), [inspectionCategories])

  useEffect(() => {
    if (preferredMachine && machines.find((m) => m.name === preferredMachine)) {
      setMachine(preferredMachine)
      setDraft({})
      return
    }
    if (!machines.find((m) => m.name === machine)) setMachine(machines[0]?.name || '')
  }, [machines, machine, preferredMachine])

  useEffect(() => {
    if (!categories.length) return
    if (!categories.includes(active)) setActive(categories[0])
  }, [categories, active])

  const items = inspectionCategories[active] || []
  const total = Object.values(inspectionCategories).flat().length
  const completeCount = useMemo(() => Object.values(draft).filter((x) => x.status).length, [draft])
  const defectCount = useMemo(() => Object.values(draft).filter((x) => x.status === 'DEFECT').length, [draft])
  const keyOf = (item) => `${machine}|${active}|${item}`
  const setItem = (item, patch) => setDraft((p) => ({ ...p, [keyOf(item)]: { ...(p[keyOf(item)] || {}), ...patch } }))

  const changeMachine = (value) => {
    setMachine(value)
    setDraft({})
    const next = machines.find((m) => m.name === value)
    const nextCategories = Object.keys(getInspectionCategories(next))
    setActive(nextCategories[0] || '')
  }

  const markNormal = (item) => setDraft((p) => ({ ...p, [keyOf(item)]: { status: 'NORMAL' } }))
  const markDefect = (item) => setDraft((p) => {
    const old = p[keyOf(item)] || {}
    return { ...p, [keyOf(item)]: { ...defaultDefect(item), ...old, status: 'DEFECT' } }
  })

  const addPhotos = (item, fileList) => {
    const selectedFiles = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'))
    if (!selectedFiles.length) return
    const current = draft[keyOf(item)] || {}
    setItem(item, {
      beforeFiles: [...(current.beforeFiles || []), ...selectedFiles],
      beforePreviews: [...(current.beforePreviews || []), ...selectedFiles.map((f) => URL.createObjectURL(f))],
    })
  }

  const removePhoto = (item, index) => {
    const current = draft[keyOf(item)] || {}
    const previews = [...(current.beforePreviews || [])]
    const files = [...(current.beforeFiles || [])]
    const url = previews[index]
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
    previews.splice(index, 1)
    files.splice(index, 1)
    setItem(item, { beforeFiles: files, beforePreviews: previews })
  }

  const submit = async () => {
    const entries = Object.entries(draft).filter(([k, v]) => k.startsWith(`${machine}|`) && v.status)
    if (!entries.length) return alert('Please inspect at least 1 item. / กรุณาตรวจอย่างน้อย 1 รายการ')

    for (const [key, v] of entries) {
      if (v.status !== 'DEFECT') continue
      const item = key.split('|')[2]
      if (!v.problem?.trim()) return alert(`กรุณาระบุอาการที่พบ\n${item}`)
      if (!v.location?.trim()) return alert(`กรุณาระบุตำแหน่งที่พบ\n${item}`)
      if (!v.beforeFiles?.length) return alert(`กรุณาแนบรูปจุดปัญหาอย่างน้อย 1 รูป\n${item}`)
    }

    await onSave({ machine, inspector: inspector.trim() || 'Unknown', entries })
    setDraft({})
  }

  return <>
    <PageTitle
      title="Asset Inspection"
      th="ตรวจสภาพเครื่องจักรและอุปกรณ์"
      right={<div className="inspection-progress"><Pill>{completeCount}/{total} checked</Pill>{defectCount > 0 && <Pill tone="warn">{defectCount} defects</Pill>}</div>}
    />

    <div className="inspection-guide card compact">
      <div className="guide-step ok"><span>1</span><div><b>Normal / ปกติ</b><small>กดแล้วจบข้อนั้น ไม่ต้องถ่ายรูป ไม่ต้องพิมพ์</small></div></div>
      <div className="guide-arrow">→</div>
      <div className="guide-step warn"><span>2</span><div><b>Found Defect / พบปัญหา</b><small>ระบุตำแหน่ง + อาการ + แนบรูปหลายมุมได้ ระบบสร้าง Defect ให้อัตโนมัติ</small></div></div>
      <div className="guide-arrow">→</div>
      <div className="guide-step info"><span>3</span><div><b>Complete / ปิดงาน</b><small>ตอนซ่อมเสร็จต้องมี Action + Result + รูปหลังแก้</small></div></div>
    </div>

    <div className="card compact inspection-toolbar">
      <div className="field grow"><label>Asset <Th>เครื่อง / อุปกรณ์</Th></label><select value={machine} onChange={(e) => changeMachine(e.target.value)}>{machines.map((m) => <option key={m.name} value={m.name}>{m.label || m.name} · {m.type === 'INJECTION' ? 'Injection' : m.type === 'CRANE' ? 'Crane' : 'Vacuum Pump'} · {m.zone}</option>)}</select></div>
      <div className="field grow"><label>Inspector <Th>ผู้ตรวจ</Th></label><input value={inspector} onChange={(e) => setInspector(e.target.value)} placeholder="ชื่อผู้ตรวจ" /></div>
      <button className="btn primary align-end" disabled={busy} onClick={submit}><Icon name="Checklist--Streamline-Ultimate.png" />{busy ? 'Saving...' : 'Save Inspection'} <Th className="light">บันทึกการตรวจ</Th></button>
    </div>

    <div className="asset-context card compact"><div><b>{selected?.label || selected?.name}</b><small>{selected?.location || selected?.zone}</small></div><div><span>{selected?.type === 'INJECTION' ? 'Injection Machine / เครื่องฉีด' : selected?.type === 'CRANE' ? 'Crane / เครน' : 'Vacuum Pump / ปั๊มสุญญากาศ'}</span>{selected?.type === 'INJECTION' && <small>{selected?.robot ? 'Robot equipped / มี Robot' : 'No Robot / ไม่มี Robot'}</small>}</div></div>

    <div className="inspect-layout">
      <div className="card category-list">{categories.map((c) => <button key={c} className={`category-btn ${active === c ? 'active' : ''}`} onClick={() => setActive(c)}>{c}</button>)}</div>
      <div className="card inspection-list-card">
        <div className="card-title-row"><div><h3>{active}</h3><small className="muted">เลือกเพียง ปกติ หรือ พบปัญหา</small></div><span className="muted">Normal / Found Defect</span></div>
        {items.map((item) => {
          const v = draft[keyOf(item)] || {}
          return <div className={`inspection-item ${v.status === 'DEFECT' ? 'has-defect' : v.status === 'NORMAL' ? 'is-normal' : ''}`} key={item}>
            <div className="inspection-top">
              <div><b>{item}</b><div className="muted tiny">ตรวจเฉพาะจุดที่ปลอดภัยขณะเครื่องเดิน และใช้ LOTO เมื่อเข้าพื้นที่อันตราย</div></div>
              <div className="status-group simple">
                <button className={`status-btn ok ${v.status === 'NORMAL' ? 'active' : ''}`} onClick={() => markNormal(item)}>✓ Normal <small>ปกติ</small></button>
                <button className={`status-btn danger ${v.status === 'DEFECT' ? 'active' : ''}`} onClick={() => markDefect(item)}>! Found Defect <small>พบปัญหา</small></button>
              </div>
            </div>

            {v.status === 'NORMAL' && <div className="normal-confirm"><span>✓</span> Checked normal / ตรวจแล้วปกติ — ไม่ต้องแนบรูป</div>}

            {v.status === 'DEFECT' && <div className="inspection-defect-form">
              <div className="defect-form-head"><div><b>Defect Detail</b><Th>รายละเอียดปัญหาที่พบ</Th></div><Pill tone="danger">Before photo required / ต้องมีรูปก่อนแก้</Pill></div>
              <div className="form-grid">
                <div className="field"><label>Component <Th>อุปกรณ์ / ชุดงาน</Th></label><input value={v.component || ''} onChange={(e) => setItem(item, { component: e.target.value })} /></div>
                <div className="field"><label>Location <Th>ตำแหน่งที่พบ *</Th></label><input value={v.location || ''} onChange={(e) => setItem(item, { location: e.target.value })} placeholder="เช่น ด้านหลัง Injection Unit" /></div>
                <div className="field span-2"><label>Problem / Defect <Th>อาการผิดปกติ *</Th></label><input value={v.problem || ''} onChange={(e) => setItem(item, { problem: e.target.value })} placeholder="เช่น ลมรั่วบริเวณข้อต่อสายลม Ø8" /></div>
                <div className="field"><label>Priority <Th>ระดับความสำคัญ</Th></label><select value={v.priority || 'B'} onChange={(e) => setItem(item, { priority: e.target.value })}><option value="A">A - Critical / เร่งด่วน</option><option value="B">B - Warning / ควรแก้</option><option value="C">C - Monitor / ติดตาม</option></select></div>
                <div className="field"><label>Spare Parts <Th>อะไหล่</Th></label><select value={v.parts || 'NOT_READY'} onChange={(e) => setItem(item, { parts: e.target.value })}><option value="READY">Ready / พร้อม</option><option value="NOT_READY">Not Ready / ยังไม่พร้อม</option><option value="NONE">Not Required / ไม่ใช้</option></select></div>
                <div className="field"><label>Required Stop <Th>เวลาหยุดเครื่อง (นาที)</Th></label><input type="number" min="0" value={v.stop ?? 20} onChange={(e) => setItem(item, { stop: Number(e.target.value || 0) })} /></div>
                <div className="field"><label>Repair Time <Th>เวลาซ่อมโดยประมาณ (นาที)</Th></label><input type="number" min="0" value={v.repair ?? 20} onChange={(e) => setItem(item, { repair: Number(e.target.value || 0) })} /></div>
                <div className="field span-2">
                  <div className="label-row"><label>Problem Photos * <Th>รูปจุดปัญหา — แนบได้หลายรูป</Th></label><Pill tone="danger">อย่างน้อย 1 รูป</Pill></div>
                  <div className="multi-photo-actions">
                    <label className="photo-action-btn camera"><span>📷 Camera / ถ่ายรูป</span><small>ถ่ายหน้างานทีละรูป</small><input type="file" accept="image/*" capture="environment" onChange={(e) => { addPhotos(item, e.target.files); e.target.value = '' }} /></label>
                    <label className="photo-action-btn gallery"><span>▦ Gallery / เลือกหลายรูป</span><small>เลือกหลายรูปพร้อมกัน</small><input type="file" accept="image/*" multiple onChange={(e) => { addPhotos(item, e.target.files); e.target.value = '' }} /></label>
                  </div>
                  {v.beforePreviews?.length ? <>
                    <div className="multi-photo-summary"><b>{v.beforePreviews.length} photos / {v.beforePreviews.length} รูป</b><small>รูปแรกใช้เป็นภาพหลักในรายการปัญหา</small></div>
                    <div className="multi-photo-grid">{v.beforePreviews.map((src, index) => <div className="multi-photo-card" key={`${src}-${index}`}><img src={src} alt={`Problem ${index + 1}`} /><span className="photo-number">{index + 1}</span><button type="button" className="photo-remove" onClick={() => removePhoto(item, index)}>×</button></div>)}</div>
                  </> : <div className="photo-empty-note">แนะนำ: รูปแรกถ่ายภาพรวมตำแหน่ง · รูปถัดไปถ่ายใกล้จุดรั่ว/แตก/หลวม · ถ้ามีหลายจุดให้เพิ่มรูปได้</div>}
                </div>
                <div className="field span-2"><label>Recommended Action <Th>แนวทางแก้ไข / หมายเหตุ</Th></label><textarea value={v.action || ''} onChange={(e) => setItem(item, { action: e.target.value })} placeholder="เช่น เตรียมสายลม Ø8 และ fitting เพื่อเปลี่ยนตอนเครื่องหยุด" /></div>
              </div>
            </div>}
          </div>
        })}
      </div>
    </div>
  </>
}
