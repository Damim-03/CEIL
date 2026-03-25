# ⚙️ CEIL Backend API

### Scalable API for Language Learning Platform

<p align="center">
  <strong>Node.js • Express • Prisma • TypeScript • Secure & Scalable</strong>
</p>

---

## 🚀 Overview

The **CEIL Backend API** is the core of the platform, responsible for handling:

* 🔐 Authentication & Authorization
* 📊 Business Logic
* 🗄️ Database Operations
* 🔌 API Communication (Web & Mobile)

Designed using a clean and scalable architecture to support future growth.

---

## 🧰 Technologies & Tools

<p align="center">

<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" height="70"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" height="70"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" height="70"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg" height="70"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" height="70"/>

</p>

---

## 🧠 Architecture

The backend follows a **layered architecture**:

```
Request → Route → Controller → Service → Prisma → Database
```

### Key Principles:

* Separation of Concerns
* Reusable Services
* Clean Code Structure
* Scalable Modules

---

## 📁 Project Structure

```bash id="back1"
Backend/
│
├── src/
│   ├── config/         # App configuration
│   ├── constants/      # Constants & enums
│   ├── controllers/    # Request handlers
│   ├── services/       # Business logic
│   ├── routes/         # API routes
│   ├── middlewares/    # Auth & validation
│   ├── validations/    # Input validation
│   ├── prisma/         # Prisma client
│   ├── utils/          # Helper functions
│   ├── types/          # TypeScript types
│
│   └── app.ts
```

---

## 🔐 Authentication & Security

* JWT-based authentication
* Role-Based Access Control (RBAC)
* Protected routes & middleware
* Input validation

---

## ⚙️ Getting Started

### 1️⃣ Install dependencies

```bash id="back3"
npm install
```

---

### 2️⃣ Setup environment variables

Create `.env` file:

```env id="back4"
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret
```

---

### 3️⃣ Setup database

```bash id="back5"
npx prisma generate
npx prisma migrate dev
```

---

### 4️⃣ Run server

```bash id="back6"
npm run dev
```

---

## 🧪 Scripts

```bash id="back7"
npm run dev      # Start development server
npm run build    # Build project
npm run start    # Start production server
```

---

## 🧩 Core Features

* 🔐 Authentication system (JWT)
* 👥 User management (Owner / Admin / Student / Teacher)
* 🎓 Course management
* 📅 Scheduling system
* 📊 Attendance tracking
* 🧾 Enrollment workflow
* 📈 Statistics & dashboards

---

## 🗄️ Database

* Prisma ORM
* Relational database (PostgreSQL / MySQL)

---

## 🔮 Future Improvements

* 🔔 Real-time features (Socket.io)
* 📊 Advanced analytics
* 💳 Payment integration
* 🧠 AI-based recommendations

---

## 👨‍💻 Authors

<p align="center">

<a href="https://github.com/chirazkahla">
  <img src="https://img.shields.io/badge/Chiraz_Kahla-181717?style=for-the-badge&logo=github&logoColor=white"/>
</a>

<a href="https://github.com/Damim-03">
  <img src="https://img.shields.io/badge/Imad_Eddine_Kir-181717?style=for-the-badge&logo=github&logoColor=white"/>
</a>

</p>

---

## ⭐ Final Note

This backend is the foundation of a scalable full-stack platform designed to modernize language learning systems.

If you like it, give it a ⭐ on GitHub!
