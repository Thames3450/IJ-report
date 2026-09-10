# IJ Machine Condition & PM — React V6

เว็บแอป React + Vite สำหรับตรวจสภาพเครื่องจักร IJ, จัดการ Defect, Opportunity Maintenance และออกรายงาน Before/After

## จุดเปลี่ยนสำคัญใน V6

Flow หน้า Inspection ถูกทำให้ง่ายขึ้นเพื่อให้ช่างไม่สับสน:

1. **Normal / ปกติ** — กดแล้วจบรายการนั้น ไม่ต้องพิมพ์และไม่ต้องแนบรูป
2. **Found Defect / พบปัญหา** — ระบบเปิดรายละเอียดเฉพาะรายการนั้น และบังคับให้ระบุอาการ ตำแหน่ง และ **Before Photo / รูปก่อนแก้** อย่างน้อย 1 รูป
3. เมื่อบันทึก Inspection รายการที่เลือก Found Defect จะถูกสร้างเข้า **Defect Backlog** อัตโนมัติ
4. เมื่อซ่อมเสร็จ กด **Complete / ปิดงาน** แล้วต้องกรอก Corrective Action, Result และแนบ **After Photo / รูปหลังแก้** ก่อนปิดงาน
5. หน้า Defect และ Report แสดง **Before → Action → After → Result** เพื่อใช้เป็นหลักฐานและนำเสนอหัวหน้า/Production

> รูป Air Leak ไม่จำเป็นต้องมองเห็นลมรั่วในภาพ ให้ถ่ายให้เห็น Hose / Fitting / Cylinder และตำแหน่งที่พบปัญหาชัดเจน

## Technology

- React 19
- Vite 7
- Supabase Auth + PostgreSQL + Storage
- Sarabun ทั้งเว็บ
- Streamline icons
- Mobile-first Responsive UI

## Supabase

โปรเจกต์ถูกตั้งค่าให้ใช้ Project **IJ Maintenance** เดิมผ่าน `.env`

V6 เพิ่มฟิลด์ในตาราง `defects`:

- `before_photo_url`
- `after_photo_url`
- `resolution_action`
- `resolution_result`
- `completed_by_name`

ไฟล์ `supabase/schema.sql` รองรับทั้งการสร้างใหม่และ upgrade ฐานข้อมูลเดิมแบบ idempotent

## วิธีรันบน Windows

ดับเบิลคลิก `RUN_DEV.bat`

หรือเปิด Terminal ในโฟลเดอร์แล้วรัน:

```bash
npm install
npm run dev
```

## Build Production

```bash
npm run build
```

หรือใช้ `BUILD.bat` ผลลัพธ์จะอยู่ในโฟลเดอร์ `dist/`

## Master Asset

รวม 68 Assets:

- Injection Machine 53 เครื่อง
- Crane 6 ตัว
- Vacuum Pump 9 ตัว
- Zone A1 / A2 / A3 / A4 / Utility

Checklist จะเปลี่ยนตามประเภท Asset และเครื่อง Injection ที่ไม่มี Robot จะไม่แสดงหมวด Robot

---

## GitHub Pages
เวอร์ชันนี้เตรียม `.github/workflows/deploy-pages.yml` และ `public/.nojekyll` แล้ว สามารถ Deploy ผ่าน GitHub Actions ได้โดยตรง ดูขั้นตอนละเอียดที่ `GITHUB_PAGES_TH.md`
