export const FALLBACK_MACHINES = [
  { name: '850T-16', label: '850T-16', zone: 'A1', type: 'INJECTION', robot: true, location: 'Zone A1' },
  { name: '850T-17', label: '850T-17', zone: 'A1', type: 'INJECTION', robot: true, location: 'Zone A1' },
  { name: '850T-18', label: '850T-18', zone: 'A1', type: 'INJECTION', robot: true, location: 'Zone A1' },
  ...Array.from({ length: 6 }, (_, i) => ({ name: `650T-${i + 1}`, label: `650T-${i + 1}`, zone: 'A1', type: 'INJECTION', robot: true, location: 'Zone A1' })),
  ...Array.from({ length: 9 }, (_, i) => ({ name: `650T-${i + 7}`, label: `650T-${i + 7}`, zone: 'A2', type: 'INJECTION', robot: true, location: 'Zone A2' })),
  ...Array.from({ length: 10 }, (_, i) => ({ name: `350T-${i + 1}`, label: `350T-${i + 1}`, zone: 'A3', type: 'INJECTION', robot: true, location: 'Zone A3' })),
  ...['230T-3','230T-4','230T-5','75T-4','75T-5'].map((name) => ({ name, label: name, zone: 'A3', type: 'INJECTION', robot: false, location: 'Zone A3' })),
  ...['450T-7', ...Array.from({ length: 8 }, (_, i) => `650T-${i + 16}`), ...Array.from({ length: 3 }, (_, i) => `500T-${i + 1}`), ...Array.from({ length: 8 }, (_, i) => `320T-${i + 1}`)].map((name) => ({ name, label: name, zone: 'A4', type: 'INJECTION', robot: true, location: 'Zone A4' })),
  { name: 'CRANE-01', label: 'Crane No.1', zone: 'A1', type: 'CRANE', robot: false, location: 'Zone A1' },
  { name: 'CRANE-02', label: 'Crane No.2', zone: 'A2', type: 'CRANE', robot: false, location: 'Zone A2' },
  { name: 'CRANE-03', label: 'Crane No.3', zone: 'A3', type: 'CRANE', robot: false, location: 'Zone A3' },
  { name: 'CRANE-04', label: 'Crane No.4', zone: 'A4', type: 'CRANE', robot: false, location: 'Zone A4 · 650T-16 to 650T-23' },
  { name: 'CRANE-05', label: 'Crane No.5', zone: 'A4', type: 'CRANE', robot: false, location: 'Zone A4 · Behind material suction room' },
  { name: 'CRANE-06', label: 'Crane No.6', zone: 'A4', type: 'CRANE', robot: false, location: 'Zone A4 · 500T-1 to 320T-8' },
  ...Array.from({ length: 3 }, (_, i) => ({ name: `VP-OLD-${String(i + 1).padStart(2, '0')}`, label: `Vacuum Pump No.${i + 1} (Old Plant)`, zone: 'UTILITY', type: 'VACUUM_PUMP', robot: false, location: 'Old Plant / โรงเก่า', plantGroup: 'OLD_PLANT' })),
  ...Array.from({ length: 6 }, (_, i) => ({ name: `VP-NEW-${String(i + 1).padStart(2, '0')}`, label: `Vacuum Pump No.${i + 1} (New Plant)`, zone: 'UTILITY', type: 'VACUUM_PUMP', robot: false, location: 'New Plant / โรงใหม่', plantGroup: 'NEW_PLANT' })),
]

export const ASSET_TYPE_LABELS = {
  INJECTION: { en: 'Injection Machine', th: 'เครื่องฉีดพลาสติก' },
  CRANE: { en: 'Crane', th: 'เครน' },
  VACUUM_PUMP: { en: 'Vacuum Pump', th: 'ปั๊มสุญญากาศ' },
}

const INJECTION_CATEGORIES = {
  'Air System / ระบบลม': [
    'Air leakage / จุดลมรั่ว', 'Air hose / สายลม', 'Fitting / ข้อต่อลม',
    'Solenoid valve / โซลินอยด์วาล์ว', 'FRL / ชุดกรองลม',
    'Air cylinder / กระบอกลม', 'Air pressure / แรงดันลม',
  ],
  'Hydraulic / ไฮดรอลิก': [
    'Oil leakage / น้ำมันรั่ว', 'Hydraulic hose / สายไฮดรอลิก',
    'Hydraulic cylinder / กระบอกไฮดรอลิก', 'Valve / วาล์ว',
    'Pump / ปั๊ม', 'Oil level / ระดับน้ำมัน', 'Oil temperature / อุณหภูมิน้ำมัน',
  ],
  'Mechanical / กลไก': [
    'Bearing / ตลับลูกปืน', 'Bolt & nut / น็อตและสกรู', 'Chain / โซ่',
    'Roller / โรลเลอร์', 'Coupling / คัปปลิ้ง', 'Lubrication / การหล่อลื่น',
    'Abnormal noise / เสียงผิดปกติ', 'Vibration / การสั่นสะเทือน',
  ],
  'Electrical / ไฟฟ้า': [
    'Wiring / สายไฟ', 'Sensor / เซนเซอร์', 'Connector / คอนเนคเตอร์',
    'Cooling fan / พัดลม', 'Motor / มอเตอร์', 'Terminal / เทอร์มินัล',
    'Control cabinet / ตู้คอนโทรล',
  ],
  'Robot / หุ่นยนต์': [
    'Robot air hose / สายลมหุ่นยนต์', 'Gripper / กริปเปอร์',
    'Robot sensor / เซนเซอร์หุ่นยนต์', 'Robot cable / สายไฟหุ่นยนต์',
    'Vacuum / ระบบสุญญากาศ', 'Robot lubrication / หล่อลื่นหุ่นยนต์',
  ],
  'Safety / ความปลอดภัย': [
    'Safety door / ประตูเซฟตี้', 'Interlock / อินเตอร์ล็อก',
    'Emergency stop / ปุ่มฉุกเฉิน', 'Light curtain / ม่านแสง', 'Guard / ฝาครอบป้องกัน',
  ],
  'Cooling / หล่อเย็น': [
    'Cooling water leak / น้ำหล่อเย็นรั่ว', 'Water hose / สายน้ำ',
    'Filter / ไส้กรอง', 'Flow / การไหล', 'Cooling fan / พัดลมระบายความร้อน',
  ],
}

const CRANE_CATEGORIES = {
  'Hoist System / ระบบยก': [
    'Wire rope / สลิง', 'Hook / ตะขอ', 'Hook safety latch / ตัวล็อกตะขอ',
    'Hoist brake / เบรกยก', 'Hoist motor / มอเตอร์ยก', 'Limit switch / ลิมิตสวิตช์',
  ],
  'Travel System / ระบบวิ่ง': [
    'Travel wheel / ล้อวิ่ง', 'Rail / ราง', 'Travel motor / มอเตอร์วิ่ง',
    'Gearbox / เกียร์บ็อกซ์', 'Coupling / คัปปลิ้ง', 'Abnormal noise / เสียงผิดปกติ',
  ],
  'Electrical / ไฟฟ้า': [
    'Pendant control / ชุดปุ่มควบคุม', 'Power cable / สายไฟกำลัง', 'Wiring / สายไฟ',
    'Contactor / คอนแทคเตอร์', 'Limit switch wiring / สายลิมิต', 'Control panel / ตู้คอนโทรล',
  ],
  'Safety / ความปลอดภัย': [
    'Emergency stop / ปุ่มฉุกเฉิน', 'Warning alarm / สัญญาณเตือน', 'End stop / กันชนปลายราง',
    'Load condition / สภาพการรับโหลด', 'Guard / อุปกรณ์ป้องกัน',
  ],
  'Lubrication / การหล่อลื่น': [
    'Wheel bearing grease / จารบีตลับลูกปืนล้อ', 'Gearbox oil / น้ำมันเกียร์', 'Wire rope lubrication / หล่อลื่นสลิง',
  ],
}

const VACUUM_PUMP_CATEGORIES = {
  'Vacuum System / ระบบสุญญากาศ': [
    'Vacuum pressure / ค่าแรงดันสุญญากาศ', 'Vacuum leakage / การรั่วของระบบ', 'Suction pipe / ท่อดูด',
    'Vacuum valve / วาล์วสุญญากาศ', 'Filter / ไส้กรอง', 'Exhaust condition / สภาพทางระบาย',
  ],
  'Pump / ปั๊ม': [
    'Pump oil level / ระดับน้ำมันปั๊ม', 'Pump oil condition / สภาพน้ำมันปั๊ม', 'Oil leakage / น้ำมันรั่ว',
    'Abnormal noise / เสียงผิดปกติ', 'Vibration / การสั่น', 'Temperature / อุณหภูมิ',
  ],
  'Mechanical / กลไก': [
    'Coupling / คัปปลิ้ง', 'Bearing / ตลับลูกปืน', 'Base bolt / น็อตฐาน', 'Belt / สายพาน',
  ],
  'Electrical / ไฟฟ้า': [
    'Motor / มอเตอร์', 'Current condition / กระแสมอเตอร์', 'Wiring / สายไฟ', 'Cooling fan / พัดลม', 'Control panel / ตู้คอนโทรล',
  ],
  'Safety / ความปลอดภัย': [
    'Guard / ฝาครอบป้องกัน', 'Emergency stop / ปุ่มฉุกเฉิน', 'Hot surface / จุดอุณหภูมิสูง', 'Housekeeping / ความสะอาดพื้นที่',
  ],
}

export function getInspectionCategories(machine) {
  if (machine?.type === 'CRANE') return CRANE_CATEGORIES
  if (machine?.type === 'VACUUM_PUMP') return VACUUM_PUMP_CATEGORIES
  if (machine?.robot === false) {
    const { ['Robot / หุ่นยนต์']: _robot, ...withoutRobot } = INJECTION_CATEGORIES
    return withoutRobot
  }
  return INJECTION_CATEGORIES
}

export const NAV_ITEMS = [
  ['dashboard', 'Dashboard', 'ภาพรวม', 'Layout-Dashboard--Streamline-Ultimate.png'],
  ['machines', 'Assets', 'เครื่อง/อุปกรณ์', 'Cog-3--Streamline-Ultimate.png'],
  ['inspection', 'Inspection', 'ตรวจเช็ก', 'Checklist--Streamline-Ultimate.png'],
  ['defects', 'Defects', 'งานค้าง', 'Alert-Triangle--Streamline-Ultimate.png'],
  ['opportunity', 'Opportunity', 'จังหวะซ่อม', 'Time-Clock-Hand-1--Streamline-Ultimate.png'],
  ['reports', 'Report', 'รายงาน', 'Print-Text--Streamline-Ultimate.png'],
]

export const LOCAL_KEY = 'ij_maintenance_react_v5_data' // kept for V5→V6 local-data migration

export function seedLocalData() {
  const now = new Date().toISOString()
  return {
    defects: [
      { id: 'DEMO-001', machine: '650T-9', component: 'Air Hose', problem: 'Air leakage 3 points', location: 'Rear injection unit', priority: 'B', stop: 15, repair: 15, parts: 'READY', action: 'Replace damaged air hose and fittings', status: 'OPEN', created: now, completed: null, beforePhoto: '', afterPhoto: '', resolutionAction: '', resolutionResult: '', completedBy: '' },
      { id: 'DEMO-002', machine: '650T-9', component: 'Hydraulic Cylinder', problem: 'Oil seepage', location: 'Clamp side cylinder', priority: 'A', stop: 90, repair: 75, parts: 'NOT_READY', action: 'Inspect seal and prepare seal kit before shutdown', status: 'OPEN', created: now, completed: null, beforePhoto: '', afterPhoto: '', resolutionAction: '', resolutionResult: '', completedBy: '' },
      { id: 'DEMO-003', machine: '650T-12', component: 'Roller', problem: 'Roller surface worn', location: 'Output conveyor', priority: 'B', stop: 30, repair: 25, parts: 'READY', action: 'Replace worn roller and check alignment', status: 'OPEN', created: now, completed: null, beforePhoto: '', afterPhoto: '', resolutionAction: '', resolutionResult: '', completedBy: '' },
    ],
    inspections: [],
  }
}
