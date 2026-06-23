# Lumina Tasks 🚀

Lumina Tasks is a high-performance, beautifully designed, and highly modular Task Management mobile application built using **React Native** and **Expo (Expo Router)**. The project follows clean architecture principles, modern state management, and smooth UI/UX micro-interactions.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** React Native (Expo SDK)
- **Routing:** Expo Router (File-based routing, fully typed)
- **Language:** TypeScript (Strict type safety)
- **State Management:** React Context API (Clean, reactive, and localized data flow)
- **Component Architecture:** Atomic and modular design pattern for high reusability

---

## ✨ Features Implemented

- **Modern File-Based Routing:** Utilizes Expo Router (`app/` directory) for smooth, safe native navigation between screens and dynamic task routes.
- **Global State Management:** Powered by React Context (`tasks-context.tsx`) to manage task CRUD operations seamlessly across the app without prop drilling.
- **Delightful Micro-Interactions:** Includes `SparkBurst.tsx` for visual celebration feedback when tasks are completed, elevating the user experience.
- **Advanced Context Menus:** Native-feel interactions using `TaskContextMenu.tsx` for quick, intuitive task operations (Edit, Delete, Complete).
- **Custom Bottom Sheets:** Implements `DatePickerSheet.tsx` for an elegant, non-intrusive way to assign due dates to tasks.

---

## 📂 Project Structure

The project has been refactored into a standardized, industry-grade production layout:

```text
LUMINA-TASKS/
├── app/                  # Application screens and layouts (Expo Router)
│   ├── task/             # Dynamic task details routes
│   ├── _layout.tsx       # Root layout configuration
│   └── index.tsx         # Main application dashboard
├── assets/               # Local images, icons, and custom fonts
├── src/                  # Core application source code
│   ├── components/       # Reusable UI elements (SparkBurst, DatePickerSheet, etc.)
│   ├── hooks/            # Custom React hooks for extracted logic
│   └── types/            # Centralized TypeScript interfaces and definitions
├── app.json              # Expo configuration file
├── metro.config.js       # Metro Bundler configuration
├── package.json          # Project dependencies and scripts
└── tsconfig.json         # TypeScript compiler configuration
