<div align="center">

<img src="public/mascot.svg" alt="Jodnoi mascot" width="180" />

# Jodnoi · จดหน่อย

**บันทึกรายรับรายจ่ายให้เสร็จใน 3 แตะ — แอปบัญชีส่วนตัวที่ใช้ได้ออฟไลน์ ข้อมูลอยู่ในเครื่องคุณ**

*A minimal, offline-first personal finance tracker that nudges you to log every baht.*

[![Live demo](https://img.shields.io/badge/demo-online-16a34a?style=flat-square)](https://jodnoi.jodnoi.workers.dev)
[![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8?style=flat-square)](#-ติดตั้งเป็นแอป)
[![License](https://img.shields.io/badge/license-source--available%20·%20non--commercial-e11d48?style=flat-square)](LICENSE)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)

[**เปิดใช้งาน →**](https://jodnoi.jodnoi.workers.dev)

</div>

---

## ✨ ทำไมต้อง Jodnoi

แอปบัญชีส่วนใหญ่ซับซ้อนจนเลิกจดภายในสัปดาห์เดียว Jodnoi ออกแบบมาเพื่อ **"จดหน่อย"** ให้ง่ายที่สุด:

- เปิดแอป → กด **เงินออก** หรือ **เงินเข้า** → ใส่จำนวน → เลือกหมวด → บันทึก
- ไม่ต้องสมัครสมาชิก ไม่ต้องมีเซิร์ฟเวอร์ ไม่มีโฆษณา ไม่ส่งข้อมูลออกจากเครื่อง
- ติดตั้งลงหน้าจอโฮมได้เหมือนแอปทั่วไป และใช้งานได้แม้ไม่มีอินเทอร์เน็ต

## 🧩 ฟีเจอร์

| | |
|---|---|
| **บันทึกเร็ว** | แผ่นบันทึกเลื่อนขึ้นจากล่าง เลือกหมวดด้วยปุ่มใหญ่ วันที่เริ่มต้นเป็นวันนี้ |
| **หมวดหมู่ของคุณเอง** | เพิ่ม/แก้ไข/ซ่อน/ลบ ปรับชื่อ ไอคอน สี แยกชุดเงินเข้า–เงินออก ใช้ร่วมกันทุกบัญชี |
| **หลายบัญชี** | เช่น เงินสด บัญชีธนาคาร บัตรเครดิต เลือกดูทีละบัญชี จำบัญชีล่าสุดให้ทุกครั้งที่เปิดแอป |
| **ประวัติ** | จัดกลุ่มตามวัน แก้ไข/ลบได้ พร้อมปุ่มเลิกทำ |
| **แดชบอร์ด** | ยอดเข้า–ออก–คงเหลือ กราฟรายวัน สัดส่วนตามหมวด ค่าเริ่มต้น = เดือนปัจจุบัน เลือกช่วงเวลาเองได้ (เดือน/7 วัน/30 วัน/ปี/กำหนดเอง) |
| **สำรองข้อมูล** | ส่งออก/นำเข้า JSON (รองรับไฟล์เวอร์ชันเก่า) และส่งออก CSV เปิดใน Excel/Google Sheets ได้ |
| **PWA** | ติดตั้งได้ ใช้ออฟไลน์ได้ รองรับ Dark mode ตามระบบ |

## 📲 ติดตั้งเป็นแอป

กดปุ่ม **ติดตั้ง** มุมขวาบนของแอป หรือทำเองตามระบบ:

- **Android / Chrome:** เมนู ⋮ → *ติดตั้งแอป*
- **iPhone / iPad (Safari):** ปุ่มแชร์ → *เพิ่มไปยังหน้าจอโฮม*
- **คอมพิวเตอร์ (Chrome / Edge):** ไอคอนติดตั้งในแถบที่อยู่

> การติดตั้งและโหมดออฟไลน์ต้องเปิดผ่าน **HTTPS** (หรือ `localhost`)

## 🔒 ข้อมูลและความเป็นส่วนตัว

- ข้อมูลทั้งหมดเก็บใน **IndexedDB ของเบราว์เซอร์บนเครื่องนี้เท่านั้น** ไม่มี backend ไม่มี analytics ไม่มีการส่งข้อมูลไปที่ใด
- แอปขอให้เบราว์เซอร์เก็บข้อมูลแบบถาวร (`navigator.storage.persist()`) แต่ **หากล้างข้อมูลเว็บไซต์ ถอนการติดตั้ง หรือเปลี่ยนเครื่อง ข้อมูลจะหาย** — กด *ตั้งค่า → สำรองข้อมูล (JSON)* เป็นระยะ
- เงินเก็บเป็นจำนวนเต็ม **สตางค์** เพื่อเลี่ยงปัญหาทศนิยม และวันที่เก็บเป็นวันตามปฏิทินท้องถิ่น (`YYYY-MM-DD`)

## 🛠 Tech stack

| ส่วน | เทคโนโลยี |
|---|---|
| UI | React 19 · TypeScript (strict) · Tailwind CSS v4 |
| ข้อมูล | Dexie (IndexedDB) พร้อม schema versioning และ migration |
| กราฟ | Recharts |
| PWA | vite-plugin-pwa (Workbox) |
| Build / Test | Vite · Vitest · oxlint |
| Hosting | Cloudflare Pages |

## 🗂 โครงสร้างโปรเจกต์

```text
src/
├─ lib/          # ตรรกะล้วน ไม่แตะ React/DB: เงิน วันที่ สรุปยอด สำรองข้อมูล (มี unit test)
├─ db/           # Dexie schema (v2), seed หมวดเริ่มต้น, repository (CRUD, บัญชี, นำเข้า/ส่งออก)
├─ components/   # Modal, AccountSwitcher, QuickAddSheet, RangePicker, InstallButton ...
└─ pages/        # Home, History, Dashboard, Settings
```

## 🚀 เริ่มต้นใช้งานบนเครื่อง

ต้องมี Node.js 20+

```bash
git clone https://github.com/ZillerDX/jodnoi.git
cd jodnoi
npm install
npm run dev        # http://localhost:5173
```

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run dev` | dev server (เพิ่ม `-- --host` เพื่อเปิดทดสอบจากมือถือใน Wi-Fi เดียวกัน) |
| `npm run build` | type-check แล้ว build ไปที่ `dist/` |
| `npm run preview` | เปิดเวอร์ชัน build เพื่อทดสอบ PWA/ออฟไลน์ |
| `npm test` | รัน unit test |
| `npm run lint` | ตรวจโค้ดด้วย oxlint |

## ☁️ Deploy

Jodnoi เป็นไฟล์ static ล้วน (`dist/`) deploy ได้ฟรีบน **Cloudflare Workers Static Assets** (ตั้งค่าไว้ใน [`wrangler.jsonc`](wrangler.jsonc))

```bash
npx wrangler login   # ครั้งแรกครั้งเดียว
npm run deploy       # build แล้ว deploy
```

Header และ cache ของ service worker ตั้งไว้ใน [`public/_headers`](public/_headers)

## 🗺 Roadmap (ไอเดีย ยังไม่ได้ทำ)

- [ ] โอนเงินระหว่างบัญชี
- [ ] ยอดเงินตั้งต้นต่อบัญชี
- [ ] งบประมาณรายเดือนต่อหมวด
- [ ] รายการประจำ (recurring)
- [ ] ซิงก์ข้อมูลข้ามอุปกรณ์ (ทางเลือก)

## 📄 License

**Source-available · Non-commercial · No-derivatives** — ดูรายละเอียดใน [LICENSE](LICENSE)

- ✅ ดูโค้ดและใช้งานส่วนตัวแบบไม่ดัดแปลงได้
- ❌ ห้ามใช้เชิงพาณิชย์ ห้ามคัดลอก/ฟอร์ก/ดัดแปลงไปทำต่อ และห้ามนำมาสคอต ไอคอน หรือชื่อ Jodnoi / จดหน่อย ไปใช้ โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร

ต้องการขออนุญาตหรือสนใจร่วมงาน ติดต่อผ่านโปรไฟล์ GitHub ของเจ้าของ repo

<div align="center">

<sub>Made with ☕ by <a href="https://github.com/ZillerDX">Tanathon Chanapha</a> · จดหน่อย ก่อนลืม</sub>

</div>
