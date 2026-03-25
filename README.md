# 🌍 CEIL Platform

### Full Stack Language Learning & Management System

<p align="center">
  <strong>Modern • Scalable • Multi-Platform • University-Grade System</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production--Ready-success" />
  <img src="https://img.shields.io/badge/Backend-Node.js-blue" />
  <img src="https://img.shields.io/badge/Frontend-React-blueviolet" />
  <img src="https://img.shields.io/badge/Mobile-Expo-black" />
  <img src="https://img.shields.io/badge/Database-Prisma-2D3748" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

---

## 🚀 Overview

**CEIL Platform** is a complete **full-stack digital ecosystem** designed for managing language learning centers.

Built for **Université Echahid Hamma Lakhdar – El Oued**, the platform transforms traditional education workflows into a seamless digital experience across:

* 🌐 Web Application
* 📱 Mobile Application
* ⚙️ Backend API

---

## ✨ Key Highlights

* 🎓 End-to-End Student Lifecycle Management
* 🌍 Multi-language Support (AR / EN / FR + more)
* 🔐 Secure Authentication & Role-Based Access
* 📊 Real-time Dashboard & Analytics
* 📅 Smart Scheduling System
* 📱 Cross-platform Experience (Web + Mobile)
* 🧩 Clean & Scalable Architecture

---

## 🏗️ System Architecture

```bash
CEIL/
│
├── Backend/        # Node.js + Prisma ORM
├── client/         # React + Vite Web App
├── mobile/         # Expo Mobile App
```

---

## 🧠 Architecture Philosophy

* Clean Architecture (Controller → Service → ORM)
* Separation of Concerns
* Modular & Scalable Design
* Reusable Hooks & APIs
* Role-Based System Design

---

## ⚙️ Tech Stack

### 🔧 Backend

* Node.js + Express
* TypeScript
* Prisma ORM
* API
* JWT Authentication

### 💻 Frontend (Web)

* React + Vite
* TypeScript
* Context API
* i18n (Localization)
* Axios

### 📱 Mobile

* React Native (Expo)
* TypeScript
* Expo Router
* Custom Hooks

---

## 🎯 Core Modules

### 👨‍🎓 Student Portal

* Personalized Dashboard
* Course Enrollment
* Attendance Tracking
* Schedule Management
* Notifications System
* Digital Student Card

---

### 👨‍🏫 Teacher Portal

* Class & Group Management
* Attendance System
* Student Tracking
* Schedule Overview

---

### 🛠️ Admin Dashboard

* User Management
* Course Management
* Enrollment Workflow
* Real-time Statistics
* System Monitoring

---

## 🔐 Authentication & Security

* JWT Authentication
* Role-Based Access Control (RBAC)
* Secure API Middleware
* Protected Routes

---

## ⚡ Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Damim-03/CEIL.git
cd CEIL
```

---

### 2️⃣ Setup Backend

```bash
cd Backend
npm install
cp .env.example .env

npx prisma generate
npx prisma migrate dev

npm run dev
```

---

### 3️⃣ Setup Frontend

```bash
cd client
npm install
npm run dev
```

---

### 4️⃣ Setup Mobile App

```bash
cd mobile
npm install
npx expo start
```

---

## 🔑 Environment Variables

### Backend

```env
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret
```

### Client

```env
VITE_API_URL=http://localhost:5000
```

---

## 📊 Platform Capabilities

* 📈 Track student progress in real-time
* 📅 Manage course schedules efficiently
* 🧾 Handle enrollments lifecycle
* 👥 Multi-role system (Owner / Admin / Student / Teacher)
* 🌐 Multi-language interface
* 📱 Fully responsive & mobile-ready

---

## 🔮 Future Enhancements

* 🔔 Real-time notifications (WebSocket)
* 💳 Online payments integration
* 📊 Advanced analytics dashboard
* 📱 App Store / Play Store deployment

## 🧰 Technologies & Tools

<p align="center">

<!-- Backend -->

<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" height="70" alt="Node.js"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" height="70" alt="Express"/>

<!-- Frontend -->

<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vite/vite-original.svg" height="70" alt="Vite"/>

<!-- Mobile -->

<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" height="70" alt="React Native"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/expo/expo-original.svg" height="70" alt="Expo"/>

<!-- API -->

<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/axios/axios-plain.svg" height="70" alt="Axios"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/socketio/socketio-original.svg" height="70" alt="Socket.io"/>

<!-- Cloud -->

<img src="https://res.cloudinary.com/cloudinary/image/upload/v1628004866/cloudinary_logo_for_white_bg.svg" height="70" alt="Cloudinary"/>

</p>

---

## 🤝 Contributing

Contributions are welcome!

```bash
Fork → Create Branch → Commit → Pull Request
```

---

## 📄 License

MIT License

---

## 👨‍💻 Authors

Developed with ❤️ by:

* 👩‍💻 **Chiraz Kahla**
  🔗 https://github.com/chirazkahla

* 👨‍💻 **Imad Eddine Kir**
  🔗 https://github.com/Damim-03

Université Echahid Hamma Lakhdar – El Oued

---

## ⭐ Final Thoughts

CEIL Platform is more than just a project —
it's a **scalable digital transformation solution** for modern education systems.

If you like it, give it a ⭐ on GitHub!
