# Learnify: Backend Integration Blueprint & Setup Guide
### Transitioning from Mock Database (localStorage) to a Real Node.js + Express Backend

This guide outlines the complete database schemas, API routes, and code architecture to migrate the **Learnify** client-side application to a robust full-stack production application.

---

## 💾 1. Recommended Database Stack
We recommend using **Node.js (Express)** for the backend server and one of the following databases:
1. **SQLite**: Best for desktop demonstrations and local testing (zero setup required, stored in a single file).
2. **MongoDB**: Best for modern web development (NoSQL JSON-like documents matching your current `localStorage` arrays).

---

## 📊 2. Database Schema Design (MongoDB Reference)

### Users Collection (`users`)
```json
{
  "_id": "ObjectId",
  "username": "teacher",
  "password": "hashed_password_string",
  "name": "Prof. Sarah Jenkins",
  "role": "teacher", // admin, teacher, student
  "status": "active", // active, deactivated
  "email": "sarah.j@learnify.com"
}
```

### Subjects Collection (`subjects`)
```json
{
  "_id": "ObjectId",
  "code": "CS301",
  "name": "Web Architecture & Systems",
  "description": "Advanced client-server web architectural patterns...",
  "creditHours": 3
}
```

### Teacher Assignments Collection (`teacher_assignments`)
```json
{
  "_id": "ObjectId",
  "teacherName": "Prof. Sarah Jenkins",
  "subjectId": "ObjectId(Subject)",
  "subjectName": "Web Architecture & Systems"
}
```

### Content Library Collection (`content`)
```json
{
  "_id": "ObjectId",
  "title": "Web Architecture Lecture Notes (PDF)",
  "subjectName": "Web Architecture & Systems",
  "uploadedBy": "Prof. Sarah Jenkins",
  "fileType": "pdf",
  "fileName": "web_architecture_ch1.pdf",
  "filePath": "/uploads/web_architecture_ch1.pdf", // Path on backend server
  "uploadDate": "2026-07-10",
  "description": "Comprehensive guide covering HTTP protocols..."
}
```

---

## 🌐 3. REST API Routes (`server.js`)

To replace `localStorage`, implement the following API routes in your Express backend:

### Authentication
* **POST `/api/auth/login`**: Authenticates user and returns a JSON Web Token (JWT).
* **GET `/api/auth/me`**: Verifies JWT and returns the current user profile.

### Subject & Curriculum Management
* **GET `/api/subjects`**: Returns all subjects.
* **POST `/api/subjects`**: Creates a new subject (Admin only).
* **DELETE `/api/subjects/:id`**: Deletes a subject (Admin only).

### Content Upload System (Using `multer` middleware)
```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

// Configure storage location for attached files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Route to handle real file attachment upload
app.post('/api/content/upload', upload.single('attachedFile'), async (req, res) => {
  try {
    const { title, subjectName, fileType, description, uploadedBy } = req.body;
    const newContent = {
      title,
      subjectName,
      uploadedBy,
      fileType,
      fileName: req.file.filename,
      filePath: `/uploads/${req.file.filename}`,
      uploadDate: new Date(),
      description
    };
    
    // Save to Database (e.g. MongoDB or SQLite)
    // await ContentDb.create(newContent);
    
    res.status(201).json({ success: true, message: "File uploaded successfully!", data: newContent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

---

## ⚡ 4. Client-Side HTTP Fetch Bridge (Replacing `localStorage`)

In `public/assets/js/main.js`, you can easily replace local data reads with real network requests:

### Example: Uploading content with real file payload
```javascript
async function uploadContentToServer(formData) {
  try {
    const response = await fetch('/api/content/upload', {
      method: 'POST',
      body: formData // Contains the real attached file
    });
    const result = await response.json();
    if (result.success) {
      showToast('File uploaded to server database!', 'success');
      location.reload();
    }
  } catch (error) {
    showToast('Failed to upload file to backend.', 'error');
  }
}
```
This clean separation allows you to swap out mock logic for server logic seamlessly in the future.
