import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
export const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
export const supabaseConfigured = Boolean(supabaseUrl && supabaseKey)
export const supabase = supabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null

export function dbDefectToUi(d) {
  return {
    id: d.id,
    machine: d.machine_code,
    component: d.component || '',
    problem: d.problem || '',
    location: d.location || '',
    priority: d.priority || 'B',
    stop: Number(d.required_stop_minutes || 0),
    repair: Number(d.estimated_repair_minutes || 0),
    parts: d.parts_status || 'NONE',
    action: d.recommended_action || '',
    status: d.status || 'OPEN',
    created: d.created_at,
    completed: d.completed_at || null,
    beforePhotos: Array.isArray(d.before_photo_urls) && d.before_photo_urls.length ? d.before_photo_urls : (d.before_photo_url || d.photo_url ? [d.before_photo_url || d.photo_url] : []),
    beforePhoto: (Array.isArray(d.before_photo_urls) && d.before_photo_urls.length ? d.before_photo_urls[0] : (d.before_photo_url || d.photo_url || '')),
    afterPhoto: d.after_photo_url || '',
    resolutionAction: d.resolution_action || '',
    resolutionResult: d.resolution_result || '',
    completedBy: d.completed_by_name || '',
  }
}

export function uiDefectToDb(d) {
  return {
    id: d.id,
    machine_code: d.machine,
    component: d.component || '',
    problem: d.problem || '',
    location: d.location || '',
    priority: d.priority || 'B',
    required_stop_minutes: Number(d.stop || 0),
    estimated_repair_minutes: Number(d.repair || 0),
    parts_status: d.parts || 'NONE',
    recommended_action: d.action || '',
    status: d.status || 'OPEN',
    photo_url: d.beforePhotos?.[0] || d.beforePhoto || null,
    before_photo_url: d.beforePhotos?.[0] || d.beforePhoto || null,
    before_photo_urls: d.beforePhotos?.length ? d.beforePhotos : (d.beforePhoto ? [d.beforePhoto] : []),
    after_photo_url: d.afterPhoto || null,
    resolution_action: d.resolutionAction || null,
    resolution_result: d.resolutionResult || null,
    completed_by_name: d.completedBy || null,
    completed_at: d.completed || null,
    created_at: d.created || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export async function uploadDefectPhoto(file, defectId, kind = 'before') {
  if (!supabase || !file) return ''
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const safeKind = kind === 'after' ? 'after' : 'before'
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`
  const path = `${new Date().getFullYear()}/${defectId}/${safeKind}-${unique}.${ext}`
  const { error } = await supabase.storage.from('defect-photos').upload(path, file, {
    upsert: false,
    cacheControl: '3600',
  })
  if (error) throw error
  const { data } = supabase.storage.from('defect-photos').getPublicUrl(path)
  return data?.publicUrl || ''
}
