import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://hftlogubohbjiivcvkut.supabase.co'
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_FtRkkKGWJpOakcv69BX-Hw_RHFCD86n'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
})

export async function edgeLogin(functionName, body) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
    body: JSON.stringify(body)
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Sign in failed · เข้าสู่ระบบไม่สำเร็จ')
  if (!data.session?.access_token) throw new Error('Session not found · ไม่พบ session จากระบบ')
  const { error } = await supabase.auth.setSession(data.session)
  if (error) throw error
}
