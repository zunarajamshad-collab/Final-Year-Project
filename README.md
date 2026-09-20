# 🎓 Learnify: Smart Learning System

> **Final Year Project (FYP)** | Modern Web-Based Academic & E-Learning Portal

[![Live Demo](https://img.shields.io/badge/Vercel-Deployed-success?style=for-the-badge&logo=vercel)](https://vercel.com/zunarajamshad-collabs-projects)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Final--Year--Project-blue?style=for-the-badge&logo=github)](https://github.com/zunarajamshad-collab/Final-Year-Project)

---

## 🌐 Live Application Links

* 🚀 **Vercel Deployment / Dashboard**: [https://vercel.com/zunarajamshad-collabs-projects](https://vercel.com/zunarajamshad-collabs-projects)
* 📁 **GitHub Source Code**: [https://github.com/zunarajamshad-collab/Final-Year-Project](https://github.com/zunarajamshad-collab/Final-Year-Project)

---

## 🌟 Overview & Features

**Learnify** is a next-generation academic portal designed for universities and learning institutions. It features custom role clearance, dark-slate UI aesthetics, drag-and-drop file attachments, interactive quiz engines, fill-in-the-blank evaluations, and result generation.

### 👥 3 Unified Role Portals
1. ⚙️ **Admin Panel (`/admin`)**:
   - Manage Subjects (Add, View, Update, Delete).
   - Manage Teachers & Subject Assignments.
   - Upload & Manage Content Library materials.
   - Create Quizzes & Fill in the Blanks exercises.
   - Grade student attempts and manage student records.
2. 🍎 **Teacher Panel (`/login/teacher`)**:
   - View Assigned Subjects.
   - Upload study materials with file attachments & progress tracking.
   - Build Quizzes and Fill-in-the-Blanks exercises.
   - Grade student quiz attempts and assign marks.
3. 🎓 **Student Panel (`/login/student`)**:
   - View Enrolled Subjects & Course Outlines.
   - Take interactive multiple-choice Quizzes with real-time score logging.
   - Answer Fill-in-the-Blanks exercises.
   - Download course content materials directly to local device.

---

## 🔑 Test Credentials for Demo

| Role | Username | Password | Login Route |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin` | `admin123` | `/admin` |
| **Course Educator** | `teacher` | `teacher123` | `/login/teacher` |
| **Student** | `student` | `student123` | `/login/student` |

---

## ⚡ Deployment Instructions for Vercel

1. Log into your Vercel Account: [Vercel Dashboard](https://vercel.com/zunarajamshad-collabs-projects).
2. Click **Add New...** &rarr; **Project**.
3. Import your GitHub repository: `zunarajamshad-collab/Final-Year-Project`.
4. Keep framework preset as **Other** (Root directory `./`).
5. Click **Deploy**! Vercel will automatically read `vercel.json` and deploy all clean routes and static assets.

---

## 📁 Repository Structure

```text
learnify/
├── package.json              # Project dependencies & scripts
├── server.js                 # Express server & Vercel serverless export
├── vercel.json               # Vercel route rewrites & static asset mapping
├── run.ps1                   # Zero-dependency PowerShell server for local Windows run
├── backend_integration.md    # Guide for future Express + MongoDB/SQLite backend
├── README.md                 # Project documentation
└── public/                   # Frontend client assets & HTML views
    ├── index.html            # Main landing portal
    ├── login-student.html    # Student login
    ├── login-teacher.html    # Teacher login
    ├── login-admin.html      # Admin login
    ├── assets/
    │   ├── css/style.css     # Dark-slate theme styling
    │   └── js/
    │       ├── auth.js       # Auth guards & database initialization
    │       └── main.js       # Interactive UI & quiz logic
    ├── admin/                # Admin views (subjects, teachers, content, quizzes, grading)
    ├── teacher/              # Teacher views (assigned subjects, content, quizzes, grading)
    └── student/              # Student views (subjects, quizzes, fill-in-blanks, content)
```

---

## 🛠️ Local Development

To run locally on Windows without installing additional tools:
```powershell
powershell -ExecutionPolicy Bypass -File .\run.ps1
```
Then navigate to `http://localhost:3000` in your web browser.
