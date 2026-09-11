import React, { useCallback, useEffect, useMemo, useState } from 'react'
import AuthModal from './components/AuthModal.jsx'
import CompleteDefectModal from './components/CompleteDefectModal.jsx'
import Dashboard from './components/Dashboard.jsx'
import DefectModal from './components/DefectModal.jsx'
import Defects from './components/Defects.jsx'
import Inspection from './components/Inspection.jsx'
import MachineModal from './components/MachineModal.jsx'
import Machines from './components/Machines.jsx'
import Opportunity from './components/Opportunity.jsx'
import Reports from './components/Reports.jsx'
import { Icon, Th } from './components/UI.jsx'
import { FALLBACK_MACHINES, LOCAL_KEY, NAV_ITEMS, seedLocalData } from './data/constants.js'
import { dbDefectToUi, supabase, supabaseConfigured, uiDefectToDb, uploadDefectPhoto } from './lib/supabase.js'

function normalizeLocalData(value) {
  const base = value || seedLocalData()
  return {
    inspections: Array.isArray(base.inspections) ? base.inspections : [],
    defects: (Array.isArray(base.defects) ? base.defects : []).map((d) => ({
      ...d,
      beforePhotos: Array.isArray(d.beforePhotos) && d.beforePhotos.length ? d.beforePhotos : (d.beforePhoto || d.photo ? [d.beforePhoto || d.photo] : []),
      beforePhoto: (Array.isArray(d.beforePhotos) && d.beforePhotos.length ? d.beforePhotos[0] : (d.beforePhoto || d.photo || '')),
      afterPhoto: d.afterPhoto || '',
      resolutionAction: d.resolutionAction || '',
      resolutionResult: d.resolutionResult || '',
      completedBy: d.completedBy || '',
    })),
  }
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return normalizeLocalData(raw ? JSON.parse(raw) : seedLocalData())
  } catch {
    return normalizeLocalData(seedLocalData())
  }
}

function saveLocal(data) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
}

function defectId(prefix = 'DF') {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const stamp = `${String(d.getFullYear()).slice(-2)}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  return `${prefix}-${stamp}-${crypto.randomUUID().slice(0,4).toUpperCase()}`
}

async function resizePhoto(file) {
  if (!file) return ''
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const max = 1100
      const ratio = Math.min(1, max / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', .78))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Cannot read image')) }
    img.src = url
  })
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [machines, setMachines] = useState(FALLBACK_MACHINES)
  const [data, setData] = useState(loadLocal)
  const [cloudMode, setCloudMode] = useState(false)
  const [user, setUser] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [syncText, setSyncText] = useState('Checking connection / กำลังตรวจสอบ')
  const [syncTone, setSyncTone] = useState('offline')
  const [banner, setBanner] = useState('')
  const [defectModal, setDefectModal] = useState(false)
  const [defectPreset, setDefectPreset] = useState(null)
  const [completeId, setCompleteId] = useState('')
  const [selectedMachine, setSelectedMachine] = useState('')
  const [preferredMachine, setPreferredMachine] = useState('')

  const persist = useCallback((next) => {
    setData(next)
    saveLocal(next)
  }, [])

  const loadCloudData = useCallback(async () => {
    if (!supabase) return false
    setSyncText('Syncing / กำลังซิงก์')
    setSyncTone('offline')
    const [mRes, dRes, iRes] = await Promise.all([
      supabase.from('machines').select('machine_code,display_name,zone,asset_type,has_robot,location_detail,plant_group,sort_order,active').eq('active', true).order('sort_order'),
      supabase.from('defects').select('*').order('created_at', { ascending: false }),
      supabase.from('inspections').select('*').order('inspected_at', { ascending: false }),
    ])
    const error = mRes.error || dRes.error || iRes.error
    if (error) {
      setSyncText('Sync error / ซิงก์ไม่สำเร็จ')
      setBanner(`เชื่อม Supabase ได้ แต่โหลดข้อมูลไม่สำเร็จ: ${error.message}`)
      return false
    }
    const nextMachines = (mRes.data || []).map((m) => ({ name: m.machine_code, label: m.display_name || m.machine_code, zone: m.zone, type: m.asset_type || 'INJECTION', robot: Boolean(m.has_robot), location: m.location_detail || m.zone, plantGroup: m.plant_group || '' }))
    const nextData = {
      defects: (dRes.data || []).map(dbDefectToUi),
      inspections: (iRes.data || []).map((i) => ({ id: i.id, machine: i.machine_code, inspector: i.inspector, when: i.inspected_at, items: i.items || [] })),
    }
    setMachines(nextMachines.length ? nextMachines : FALLBACK_MACHINES)
    persist(nextData)
    setBanner('')
    setSyncText('Supabase connected / เชื่อมแล้ว')
    setSyncTone('online')
    return true
  }, [persist])

  useEffect(() => {
    let alive = true
    if (!supabaseConfigured || !supabase) {
      setSyncText('Local mode / ออฟไลน์')
      setSyncTone('offline')
      return
    }
    ;(async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!alive) return
      if (sessionData.session) {
        setUser(sessionData.session.user)
        setCloudMode(true)
        await loadCloudData()
      } else {
        setSyncText('Sign in required / ต้องเข้าสู่ระบบ')
        setAuthOpen(true)
      }
    })()
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!alive) return
      if (event === 'SIGNED_OUT') {
        setUser(null); setCloudMode(false); setSyncText('Signed out / ออกจากระบบ'); setSyncTone('offline')
      }
      if (event === 'SIGNED_IN' && session) setUser(session.user)
    })
    return () => { alive = false; listener.subscription.unsubscribe() }
  }, [loadCloudData])

  const signIn = async (email, password) => {
    if (!email || !password) return { ok: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' }
    setBusy(true)
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { ok: false, message: error.message }
      setUser(authData.user); setCloudMode(true); setAuthOpen(false); await loadCloudData()
      return { ok: true, message: 'เข้าสู่ระบบสำเร็จ' }
    } finally { setBusy(false) }
  }

  const signUp = async (email, password) => {
    if (!email || password.length < 6) return { ok: false, message: 'กรุณากรอกอีเมล และรหัสผ่านอย่างน้อย 6 ตัวอักษร' }
    setBusy(true)
    try {
      const { data: authData, error } = await supabase.auth.signUp({ email, password })
      if (error) return { ok: false, message: error.message }
      if (authData.session) {
        setUser(authData.user); setCloudMode(true); setAuthOpen(false); await loadCloudData()
        return { ok: true, message: 'สร้างบัญชีและเข้าสู่ระบบแล้ว' }
      }
      return { ok: true, message: 'สร้างบัญชีแล้ว กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ' }
    } finally { setBusy(false) }
  }

  const useLocal = () => {
    setCloudMode(false); setUser(null); setAuthOpen(false); setSyncText('Local demo / ทดลองออฟไลน์'); setSyncTone('offline')
    setMachines(FALLBACK_MACHINES)
    persist(loadLocal())
  }

  const signOut = async () => {
    if (supabase && cloudMode) await supabase.auth.signOut()
    setCloudMode(false); setUser(null); setAuthOpen(true); setSyncText('Signed out / ออกจากระบบ'); setSyncTone('offline')
  }

  const addDefect = (machine = '', preset = null) => {
    setPreferredMachine(machine || '')
    setDefectPreset(preset)
    setDefectModal(true)
  }

  const saveDefect = async (form, files) => {
    setBusy(true)
    try {
      const beforeFiles = Array.from(files || [])
      if (!beforeFiles.length) throw new Error('Before photo is required / ต้องมีรูปก่อนแก้อย่างน้อย 1 รูป')
      const id = defectId('DF')
      const beforePhotos = []
      for (const file of beforeFiles) {
        beforePhotos.push(cloudMode ? await uploadDefectPhoto(file, id, 'before') : await resizePhoto(file))
      }
      const defect = {
        id,
        machine: form.machine,
        component: form.component.trim() || 'General',
        problem: form.problem.trim(),
        location: form.location.trim(),
        priority: form.priority,
        stop: Number(form.stop || 0),
        repair: Number(form.repair || 0),
        parts: form.parts,
        action: form.action.trim(),
        status: 'OPEN',
        created: new Date().toISOString(),
        completed: null,
        beforePhotos,
        beforePhoto: beforePhotos[0] || '',
        afterPhoto: '',
        resolutionAction: '',
        resolutionResult: '',
        completedBy: '',
      }
      if (cloudMode) {
        const { error } = await supabase.from('defects').insert(uiDefectToDb(defect))
        if (error) throw error
        await loadCloudData()
      } else persist({ ...data, defects: [defect, ...data.defects] })
      setDefectModal(false); setDefectPreset(null)
    } catch (e) {
      alert(`Save failed / บันทึกไม่สำเร็จ\n${e.message}`)
    } finally { setBusy(false) }
  }

  const saveInspection = async ({ machine, inspector, entries }) => {
    setBusy(true)
    try {
      const when = new Date().toISOString()
      const inspectionItems = entries.map(([key, value]) => {
        const { beforeFiles, beforePreviews, ...safe } = value
        return { key, ...safe, before_photo_count: Array.isArray(beforeFiles) ? beforeFiles.length : 0, has_before_photo: Boolean(beforeFiles?.length) }
      })
      const inspection = { id: defectId('INSP'), machine, inspector, when, items: inspectionItems }

      const newDefs = []
      for (const [key, v] of entries.filter(([, value]) => value.status === 'DEFECT')) {
        if (!v.beforeFiles?.length) throw new Error(`Missing before photo / ไม่มีรูปก่อนแก้: ${key.split('|')[2]}`)
        const id = defectId('DF')
        const beforePhotos = []
        for (const file of v.beforeFiles) {
          beforePhotos.push(cloudMode ? await uploadDefectPhoto(file, id, 'before') : await resizePhoto(file))
        }
        const item = key.split('|')[2]
        newDefs.push({
          id,
          machine,
          component: v.component?.trim() || item.split(' / ')[0],
          problem: v.problem.trim(),
          location: v.location.trim(),
          priority: v.priority || 'B',
          stop: Number(v.stop ?? 20),
          repair: Number(v.repair ?? v.stop ?? 20),
          parts: v.parts || 'NOT_READY',
          action: v.action?.trim() || '',
          status: 'OPEN',
          created: when,
          completed: null,
          beforePhotos,
          beforePhoto: beforePhotos[0] || '',
          afterPhoto: '',
          resolutionAction: '',
          resolutionResult: '',
          completedBy: '',
        })
      }

      if (cloudMode) {
        const { error: inspectionError } = await supabase.from('inspections').insert({ id: inspection.id, machine_code: machine, inspector, inspected_at: when, items: inspection.items })
        if (inspectionError) throw inspectionError
        if (newDefs.length) {
          const { error: defectError } = await supabase.from('defects').insert(newDefs.map(uiDefectToDb))
          if (defectError) throw defectError
        }
        await loadCloudData()
      } else {
        persist({ inspections: [inspection, ...data.inspections], defects: [...newDefs, ...data.defects] })
      }
      alert(`Inspection saved / บันทึกการตรวจแล้ว\nCreated defects: ${newDefs.length} รายการ`)
    } catch (e) {
      alert(`Save failed / บันทึกไม่สำเร็จ\n${e.message}`)
      throw e
    } finally { setBusy(false) }
  }

  const openComplete = (id) => setCompleteId(id)

  const finishDefect = async (id, form, afterFile) => {
    setBusy(true)
    try {
      if (!afterFile) throw new Error('After photo is required / ต้องมีรูปหลังแก้')
      const completed = new Date().toISOString()
      const afterPhoto = cloudMode ? await uploadDefectPhoto(afterFile, id, 'after') : await resizePhoto(afterFile)
      if (cloudMode) {
        const { error } = await supabase.from('defects').update({
          status: 'DONE',
          completed_at: completed,
          after_photo_url: afterPhoto,
          resolution_action: form.action,
          resolution_result: form.result,
          completed_by_name: form.completedBy || null,
          updated_at: new Date().toISOString(),
        }).eq('id', id)
        if (error) throw error
        await loadCloudData()
      } else {
        persist({ ...data, defects: data.defects.map((d) => d.id === id ? {
          ...d,
          status: 'DONE',
          completed,
          afterPhoto,
          resolutionAction: form.action,
          resolutionResult: form.result,
          completedBy: form.completedBy || '',
        } : d) })
      }
      setCompleteId('')
    } catch (e) {
      alert(`Complete failed / ปิดงานไม่สำเร็จ\n${e.message}`)
    } finally { setBusy(false) }
  }

  const reopenDefect = async (id) => {
    if (!confirm(`Reopen ${id}?\nเปิดงานนี้อีกครั้งหรือไม่? รูปและผลหลังแก้เดิมจะถูกล้างออก`)) return
    if (cloudMode) {
      const { error } = await supabase.from('defects').update({ status: 'OPEN', completed_at: null, after_photo_url: null, resolution_action: null, resolution_result: null, completed_by_name: null, updated_at: new Date().toISOString() }).eq('id', id)
      if (error) return alert(error.message)
      await loadCloudData()
    } else persist({ ...data, defects: data.defects.map((d) => d.id === id ? { ...d, status: 'OPEN', completed: null, afterPhoto: '', resolutionAction: '', resolutionResult: '', completedBy: '' } : d) })
  }

  const go = (next, machine = '') => {
    setPreferredMachine(machine)
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const completeDefect = data.defects.find((d) => d.id === completeId) || null

  const pageContent = useMemo(() => {
    const common = { machines, defects: data.defects }
    if (page === 'dashboard') return <Dashboard {...common} onOpenMachine={setSelectedMachine} onAddDefect={() => addDefect()} />
    if (page === 'machines') return <Machines {...common} onOpenMachine={setSelectedMachine} />
    if (page === 'inspection') return <Inspection machines={machines} preferredMachine={preferredMachine} onSave={saveInspection} busy={busy} />
    if (page === 'defects') return <Defects machines={machines} defects={data.defects} onAdd={() => addDefect()} onComplete={openComplete} onReopen={reopenDefect} />
    if (page === 'opportunity') return <Opportunity {...common} preferredMachine={preferredMachine} onComplete={openComplete} />
    if (page === 'reports') return <Reports {...common} />
    return null
  }, [page, machines, data, preferredMachine, busy])

  return (
    <div className="app-shell">
      <aside className="sidebar no-print">
        <div className="brand-block"><div className="brand-logo"><img className="app-brand-icon" src={`${import.meta.env.BASE_URL}app-icon-192.png`} alt="IJ Maintenance" /></div><div><b>IJ Maintenance</b><Th>Machine Condition & PM</Th></div></div>
        <nav className="side-nav">{NAV_ITEMS.map(([id,en,th,icon]) => <button key={id} className={page === id ? 'active' : ''} onClick={() => go(id)}><Icon name={icon} /><span>{en}<Th>{th}</Th></span></button>)}</nav>
        <div className="sidebar-foot"><div className={`sync-chip ${syncTone}`}><span className="sync-dot" /><span>{syncText}</span></div><small>React V6.2 · Sarabun · Multi-photo Defect</small></div>
      </aside>

      <div className="app-main">
        <header className="topbar no-print">
          <div className="mobile-brand"><div className="brand-logo small"><img className="app-brand-icon" src={`${import.meta.env.BASE_URL}app-icon-192.png`} alt="IJ Maintenance" /></div><div><b>IJ Maintenance</b><Th>Machine Condition & PM</Th></div></div>
          <div className="top-actions"><div className={`sync-chip desktop-sync ${syncTone}`}><span className="sync-dot" />{syncText}</div><button className="icon-btn" onClick={() => cloudMode ? loadCloudData() : null} title="Sync"><Icon name="Synchronize-Arrow-1--Streamline-Ultimate.png" /></button><button className="icon-btn auth-btn" onClick={() => user ? signOut() : setAuthOpen(true)}><Icon name={user ? 'Logout--Streamline-Ultimate.png' : 'Login-1--Streamline-Ultimate.png'} /><span>{user ? 'Sign out' : 'Sign in'}<Th>{user ? user.email : 'เข้าสู่ระบบ'}</Th></span></button></div>
        </header>
        {banner && <div className="db-banner no-print">{banner}</div>}
        <main className="content">{pageContent}</main>
      </div>

      <nav className="bottom-nav no-print">{NAV_ITEMS.map(([id,en,th,icon]) => <button key={id} className={page === id ? 'active' : ''} onClick={() => go(id)}><Icon name={icon} /><span>{en}<Th>{th}</Th></span></button>)}</nav>

      <DefectModal open={defectModal} onClose={() => setDefectModal(false)} machines={machines} initialMachine={preferredMachine} preset={defectPreset} onSave={saveDefect} busy={busy} />
      <CompleteDefectModal open={Boolean(completeDefect)} defect={completeDefect} onClose={() => setCompleteId('')} onSave={finishDefect} busy={busy} />
      <MachineModal machineName={selectedMachine} machines={machines} defects={data.defects} onClose={() => setSelectedMachine('')} onInspect={(m) => { setSelectedMachine(''); go('inspection', m) }} onOpportunity={(m) => { setSelectedMachine(''); go('opportunity', m) }} />
      <AuthModal open={authOpen} onSignIn={signIn} onSignUp={signUp} onLocal={useLocal} busy={busy} />
    </div>
  )
}
