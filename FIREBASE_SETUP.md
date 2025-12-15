# 🔥 Firebase Setup Instructions

ระบบแชทแบบ Real-time ต้องการการเชื่อมต่อกับ Firebase Firestore.
กรุณาทำตามขั้นตอนดังนี้:

## 1. สร้าง Firebase Project
1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. คลิก **Add project** ตั้งชื่อ `smart-locker`
3. ปิด Google Analytics (ไม่จำเป็นสำหรับ demo)

## 2. ตั้งค่า Firestore Database
1. ในแถบเมนูซ้าย เลือก **Build** -> **Firestore Database**
2. คลิก **Create database**
3. เลือก Region (เช่น `asia-southeast1`)
4. **สำคัญ:** เลือก **Start in test mode** (เพื่อให้เขียนอ่านได้โดยไม่ต้องเซ็ต Rules ซับซ้อนในตอนนี้)

## 3. หาค่า Config
1. ไปที่ **Project Overview** (รูปฟันเฟือง) -> **Project settings**
2. เลื่อนลงมาที่ **Your apps** คลิกไอคอน **Web (</>)**
3. ตั้งชื่อ App เช่น `Smart Locker Web`
4. คุณจะเห็น `const firebaseConfig = { ... }` ให้ก๊อปปี้ค่าต่างๆ มาใส่ในไฟล์ `.env.local`

## 4. สร้างไฟล์ .env.local
สร้างไฟล์ชื่อ `.env.local` ในโฟลเดอร์ `d:\Project\my-app\` (หรือ copy จาก `env.template`) และกรอกข้อมูล:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxx
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.asia-southeast1.firebasedatabase.app
```

## 5. เริ่มต้นใช้งาน
Restart server เพื่อให้ environment variables ทำงาน:

```bash
Ctrl+C (เพื่อหยุด server)
npm run dev
```

---

# 🚀 การ Deploy ขึ้น Firebase Hosting

หากต้องการนำเว็บขึ้นออนไลน์ ให้ทำดังนี้:

1. ติดตั้ง Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login:
   ```bash
   npx firebase login
   ```

3. Initialize Project:
   ```bash
   npx firebase init hosting
   ```
   - เลือก **Use an existing project** -> เลือกโปรเจคที่สร้างไว้
   - **Public directory**: `out` (ถ้าใช้ static export) หรือ `.next` (ถ้าใช้ Next.js server)
   - **Configure as a single-page app**: Yes
   - **Set up automatic builds and deploys with GitHub**: No

4. Build & Deploy:
   *หมายเหตุ: Next.js + Firebase Hosting แบบปกติจะรองรับแค่ Static Web.*
   *ถ้าต้องการระบบ API / SSR เต็มรูปแบบ แนะนำให้ deploy บน **Vercel** จะง่ายกว่ามาก*

   **วิธี Deploy บน Vercel (แนะนำสุด):**
   1. Push code ขึ้น GitHub
   2. ไปที่ [Vercel.com](https://vercel.com) -> Add New Project
   3. เลือก Repo
   4. ใส่ Environment Variables (ค่า Firebase Config)
   5. กด Deploy!
