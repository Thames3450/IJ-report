# วิธีขึ้น GitHub Pages — IJ Maintenance React V6

โปรเจกต์นี้เตรียม GitHub Actions สำหรับ Build + Deploy อัตโนมัติแล้ว

## วิธีที่ง่ายที่สุด (GitHub Website)

1. เข้า GitHub แล้วกด **New repository**
2. ตั้งชื่อ เช่น `ij-maintenance`
3. เลือก Public หรือ Private ตามที่บัญชีรองรับ Pages
4. สร้าง Repository โดยยังไม่ต้องเพิ่ม README ใหม่
5. ที่หน้า Repository เลือก **Add file > Upload files**
6. อัปโหลดไฟล์และโฟลเดอร์ทั้งหมดจากโฟลเดอร์โปรเจกต์นี้ โดยให้ `package.json`, `src`, `public`, `.github` อยู่ที่ root ของ Repository
7. Commit เข้า branch `main`
8. ไป **Settings > Pages**
9. ที่ **Build and deployment > Source** เลือก **GitHub Actions**
10. ไปแท็บ **Actions** รอ workflow `Deploy React app to GitHub Pages` ผ่าน
11. เมื่อเสร็จ URL จะประมาณ `https://USERNAME.github.io/ij-maintenance/`

## Supabase Auth — ต้องตั้งหลังทราบ URL จริง

ไปที่ Supabase Project `IJ Maintenance` > **Authentication > URL Configuration** แล้วตั้ง:

- **Site URL** = URL GitHub Pages ของเว็บ
- **Redirect URLs** = เพิ่ม URL GitHub Pages เดียวกัน และแบบมี `/**` ถ้าหน้า Supabase รองรับ pattern

ขั้นตอนนี้สำคัญโดยเฉพาะกรณี Create account แล้ว Supabase ส่งอีเมลยืนยันบัญชี

## เปิดจากมือถือ

GitHub Pages ใช้ HTTPS จึงเหมาะกับการใช้กล้องมือถือสำหรับ Before / After Photo

- Android Chrome: เปิดเว็บ > เมนู 3 จุด > Add to Home screen
- iPhone Safari: Share > Add to Home Screen

## วิธี Push ด้วย Git (ทางเลือก)

```bash
git init
git add .
git commit -m "Initial IJ Maintenance V6"
git branch -M main
git remote add origin https://github.com/USERNAME/ij-maintenance.git
git push -u origin main
```

หลังจากนั้นทุกครั้งที่ `git push` เข้า `main` GitHub Actions จะ Build และ Deploy ให้ใหม่อัตโนมัติ

## หมายเหตุเรื่อง Supabase Key

`.env.production` ในโปรเจกต์นี้ใช้ Supabase **Publishable Key** สำหรับเว็บฝั่ง Client เท่านั้น ไม่ใช่ Service Role key การป้องกันข้อมูลจริงต้องอาศัย RLS ใน Supabase ซึ่งโปรเจกต์นี้เปิดไว้แล้ว
