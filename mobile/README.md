# 📱 CEIL Mobile App

### Language Learning Platform – Mobile Experience

<p align="center">
  <strong>Built with Expo • React Native • TypeScript</strong>
</p>

---

## 🚀 Overview

The **CEIL Mobile App** is part of the CEIL ecosystem, providing students with a seamless mobile experience to:

* 🎓 Access enrolled courses
* 📅 View schedules
* 📊 Track attendance
* 🔔 Receive notifications
* 👤 Manage profile

Built for performance, simplicity, and cross-platform usability.

---

## 🧰 Technologies

<p align="center">

<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" height="70"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" height="70"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/expo/expo-original.svg" height="70"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/axios/axios-plain.svg" height="70"/>

</p>

---

## 📁 Project Structure

```bash id="mob1"
mobile/
│
├── app/                # Screens (Expo Router)
│   ├── (auth)          # Authentication screens
│   ├── (student)       # Student dashboard & features
│   └── _layout.tsx
│
├── src/
│   ├── api/            # API integration
│   ├── hooks/          # Custom hooks
│   ├── components/     # UI components
│   ├── context/        # Global state
│   ├── constants/      # App constants
│   └── types/          # Type definitions
```

---

## ⚙️ Getting Started

### 1️⃣ Install dependencies

```bash id="mob2"
npm install
```

---

### 2️⃣ Start the app

```bash id="mob3"
npx expo start
```

---

## 📲 Run on device

You can open the app using:

* 📱 Expo Go
* 🤖 Android Emulator
* 🍏 iOS Simulator
* 🧪 Development Build

---

## 🔌 API Connection

Make sure your backend is running and configure:

```bash id="mob4"
src/api/client.ts
```

Example:

```ts id="mob5"
baseURL: "http://localhost:5000"
```

---

## 🧠 Key Features

* 🔐 Authentication (Login / Register)
* 🎓 Course Management
* 📅 Schedule Viewer
* 📊 Attendance Tracking
* 🔔 Notifications
* 👤 Profile Management

---

## 🧪 Scripts

```bash id="mob6"
npm start
npm run android
npm run ios
```

---

## 🔮 Future Improvements

* 🔔 Push Notifications
* 📱 App Store Deployment
* 💬 Real-time chat
* 📊 Progress analytics

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

This mobile app is part of a full-stack educational platform designed to modernize language learning systems.

If you like it, give it a ⭐ on GitHub!
