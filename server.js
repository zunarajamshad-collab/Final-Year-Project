const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Public Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login/student', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login-student.html'));
});

app.get('/login/teacher', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login-teacher.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login-admin.html'));
});

// Admin Module Routes
app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'dashboard.html'));
});
app.get('/admin/subjects', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'subjects.html'));
});
app.get('/admin/teachers', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'teachers.html'));
});
app.get('/admin/content', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'content.html'));
});
app.get('/admin/quizzes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'quizzes.html'));
});
app.get('/admin/fill-in-blanks', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'fill-in-blanks.html'));
});
app.get('/admin/grading', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'grading.html'));
});

// Teacher Module Routes
app.get('/teacher/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'teacher', 'dashboard.html'));
});
app.get('/teacher/subjects', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'teacher', 'subjects.html'));
});
app.get('/teacher/content', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'teacher', 'content.html'));
});
app.get('/teacher/quizzes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'teacher', 'quizzes.html'));
});
app.get('/teacher/fill-in-blanks', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'teacher', 'fill-in-blanks.html'));
});
app.get('/teacher/grading', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'teacher', 'grading.html'));
});

// Student Module Routes
app.get('/student/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'student', 'dashboard.html'));
});
app.get('/student/subjects', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'student', 'subjects.html'));
});
app.get('/student/quizzes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'student', 'quizzes.html'));
});
app.get('/student/fill-in-blanks', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'student', 'fill-in-blanks.html'));
});
app.get('/student/content', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'student', 'content.html'));
});

// Fallback to home page
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`==================================================`);
        console.log(`  LEARNIFY: SMART LEARNING SYSTEM RUNNING`);
        console.log(`  Local URL: http://localhost:${PORT}`);
        console.log(`==================================================`);
    });
}

module.exports = app;
