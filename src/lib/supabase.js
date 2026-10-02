import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://hftlogubohbjiivcvkut.supabase.co'
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_FtRkkKGWJpOakcv69BX-Hw_RHFCD86n'
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmdGxvZ3Vib2hiamlpdmN2a3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMDI2NDIsImV4cCI6MjA5OTY3ODY0Mn0.LFV6KC1PsdlmoMt4pBpon-rRnIl_CIajdKjGUEyu0XU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
})

async function postLogin(url, body, apiKey) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(body),
      signal: controller.signal
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const err = new Error(data.error || `Sign in failed (${res.status}) · เข้าสู่ระบบไม่สำเร็จ`)
      err.status = res.status
      throw err
    }
    return data
  } finally {
    clearTimeout(timer)
  }
}

export async function edgeLogin(functionName, body) {
  const directUrl = `${SUPABASE_URL}/functions/v1/${functionName}`
  const devProxyUrl = `/api/functions/${functionName}`
  const attempts = import.meta.env.DEV
    ? [
        { url: devProxyUrl, key: SUPABASE_ANON_KEY, mode: 'local proxy' },
        { url: directUrl, key: SUPABASE_ANON_KEY, mode: 'direct legacy key' },
        { url: directUrl, key: SUPABASE_KEY, mode: 'direct publishable key' }
      ]
    : [
        { url: directUrl, key: SUPABASE_ANON_KEY, mode: 'direct legacy key' },
        { url: directUrl, key: SUPABASE_KEY, mode: 'direct publishable key' }
      ]

  let lastError = null
  for (const attempt of attempts) {
    try {
      const data = await postLogin(attempt.url, body, attempt.key)
      if (!data.session?.access_token) throw new Error('Session not found · ไม่พบ session จากระบบ')
      const { error } = await supabase.auth.setSession(data.session)
      if (error) throw error
      return
    } catch (err) {
      lastError = err
      // Credential errors reached the server. Do not hide them by retrying other transports.
      if ([400,401,403,429].includes(Number(err?.status))) throw err
      console.warn(`Login attempt failed via ${attempt.mode}`, err)
    }
  }

  if (lastError?.name === 'AbortError') {
    throw new Error('Connection timed out · เชื่อมต่อระบบนานเกินไป กรุณาตรวจสอบเครือข่าย')
  }
  if (lastError instanceof TypeError || /fetch/i.test(String(lastError?.message||''))) {
    throw new Error('Cannot connect to MPR server · ติดต่อ Supabase ไม่ได้ กรุณารัน npm run dev ใหม่แล้วลองอีกครั้ง')
  }
  throw lastError || new Error('Sign in failed · เข้าสู่ระบบไม่สำเร็จ')
}
