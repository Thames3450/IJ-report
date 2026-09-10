import React, { useState } from 'react'
import { Th } from './UI.jsx'

export default function AuthModal({ open, onSignIn, onSignUp, onLocal, busy }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [tone, setTone] = useState('error')

  if (!open) return null
  const action = async (fn) => {
    setMessage('')
    try {
      const result = await fn(email.trim(), password)
      if (result?.message) {
        setTone(result.ok ? 'ok' : 'error')
        setMessage(result.message)
      }
    } catch (e) {
      setTone('error')
      setMessage(e.message || 'เกิดข้อผิดพลาด')
    }
  }

  return (
    <div className="auth-gate show">
      <div className="auth-card">
        <div className="auth-logo app-auth-logo"><img className="app-brand-icon" src={`${import.meta.env.BASE_URL}app-icon-192.png`} alt="IJ Maintenance" /></div>
        <h2>Connect to IJ Maintenance</h2>
        <p>เข้าสู่ระบบเพื่อบันทึกข้อมูลส่วนกลางบน Supabase และให้ทีมเห็นข้อมูลชุดเดียวกันทุกอุปกรณ์</p>
        <div className="field">
          <label>Email <Th>อีเมล</Th></label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
        </div>
        <div className="field" style={{ marginTop: 10 }}>
          <label>Password <Th>รหัสผ่าน</Th></label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="อย่างน้อย 6 ตัวอักษร" />
        </div>
        <div className="auth-actions">
          <button className="btn primary" disabled={busy} onClick={() => action(onSignIn)}>Sign in <Th className="light">เข้าสู่ระบบ</Th></button>
          <button className="btn ghost" disabled={busy} onClick={() => action(onSignUp)}>Create account <Th>สมัครบัญชี</Th></button>
        </div>
        <button className="btn secondary wide" disabled={busy} onClick={onLocal}>Use local demo / ทดลองแบบออฟไลน์</button>
        {message && <div className={`auth-message show ${tone}`}>{message}</div>}
      </div>
    </div>
  )
}
