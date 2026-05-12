# MTC Staff Management System (Web Application) ⛪️

ระบบบริหารจัดการบุคลากรและพันธกิจภายในคริสตจักรไมตรีจิต (Maitrichit Church) พัฒนาใหม่ในรูปแบบ **Web Application** ที่ทันสมัย ใช้งานง่าย รองรับการทำงานผ่านมือถือและคอมพิวเตอร์ เพื่อทดแทนระบบเดิมและเพิ่มประสิทธิภาพในการทำงานร่วมกัน

---

## 🌟 ฟีเจอร์หลัก (Key Features)

ระบบนี้ถูกออกแบบมาเพื่อช่วยให้ทีมงาน ศิษยาภิบาล และเจ้าหน้าที่ สามารถทำงานร่วมกันได้อย่างลื่นไหล:

ระบบได้รับการออกแบบเพื่อสนับสนุนการปฏิบัติงานของคริสตจักรใน 4 ด้านหลัก:

### 1. 🏠 **Dashboard (ภาพรวมระบบ)**
หน้าจอหลักที่รวบรวมข้อมูลสำคัญและเมนูลัดสำหรับการปฏิบัติงานประจำวัน ช่วยให้ผู้ใช้งานเข้าถึงสิ่งที่ต้องทำได้อย่างรวดเร็วและมีประสิทธิภาพ

### 2. 👥 **Staff Directory (ทะเบียนบุคลากร)**
ระบบฐานข้อมูลเจ้าหน้าที่และศิษยาภิบาลที่ช่วยให้การค้นหาข้อมูลติดต่อและตรวจสอบสถานะการปฏิบัติงาน (เช่น การลา หรือ ติดภารกิจ) เป็นไปอย่างสะดวกและเชื่อมโยงถึงกันได้ทันที

### 3. 📅 **Events & Task Management (การจัดการงานและกิจกรรม)**
ระบบปฏิทินกลางสำหรับตารางพันธกิจและการประชุม พร้อมฟังก์ชันการมอบหมายงาน (Task Assignment) เพื่อติดตามสถานะการดำเนินงานของแต่ละบุคคลและทีม

### 4. 🔔 **Notifications (การแจ้งเตือน)**
ระบบแจ้งเตือนข้อมูลข่าวสารและสถานะคำขอต่างๆ ภายในองค์กร เพื่อให้บุคลากรรับทราบข้อมูลสำคัญทางด้านการบริหารและพันธกิจได้อย่างทันท่วงที

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

สำหรับทีมพัฒนา (Developers & Maintainers) โปรเจกต์นี้สร้างด้วยเทคโนโลยีมาตรฐานสากล:

- **Frontend Framework:** [Next.js 15](https://nextjs.org/) (App Router & Turbopack)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database & ORM:** [Prisma](https://www.prisma.io/) with PostgreSQL (Supabase)
- **Styling:** Modern CSS (CSS Variables) - Pixel-perfect design

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

โค้ดถูกจัดระเบียบไว้เพื่อให้ง่ายต่อการส่งต่อและพัฒนาเพิ่ม:

```bash
src/
├── 📄 app/           # หน้าจอต่างๆ (Routes)
├── 🧩 components/    # UI Components ที่ใช้ซ้ำ
├── 💾 data/          # Mock Data (กำลังทยอยเปลี่ยนเป็น Database)
├── 📐 types/         # TypeScript Interfaces
└── 🔧 lib/           # Shared libraries (เช่น prisma.ts)
prisma/
└── 📄 schema.prisma  # Database Schema
```

---

## 🚀 เริ่มต้นใช้งานบนเครื่อง (For Developers)

1. **Clone & Install:**
   ```bash
   cd web-application/Frontend/mtc-staff-app
   npm install
   ```

2. **Environment Setup:**
   - คัดลอกไฟล์ `.env.example` เป็น `.env`
   - แก้ไขค่า `DATABASE_URL` ให้ตรงกับ Database ของคุณ

3. **Database Setup:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   เปิด Browser ไปที่ [https://mtc-staff-management-v0-1-f4k6.vercel.app](https://mtc-staff-management-v0-1-f4k6.vercel.app)

---

*Verified & Maintained by MTC Tech Team*
