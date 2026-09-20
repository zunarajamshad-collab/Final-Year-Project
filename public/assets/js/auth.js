// Inject premium unique animated background styles dynamically to bypass browser cache
(function() {
    const style = document.createElement('style');
    style.innerHTML = `
        body {
            background-color: #03000a !important;
            color: #f3f4f6 !important;
            min-height: 100vh;
            overflow-x: hidden;
            position: relative;
        }
        body::before {
            content: "" !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background-image: 
                radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 45%),
                radial-gradient(circle at 100% 0%, rgba(236, 72, 153, 0.12) 0%, transparent 45%),
                radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.08) 0%, transparent 45%),
                radial-gradient(circle at 0% 100%, rgba(59, 130, 246, 0.12) 0%, transparent 45%),
                radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%) !important;
            background-size: 200% 200% !important;
            animation: uniqueGlow 20s ease infinite alternate !important;
            z-index: -2 !important;
            pointer-events: none !important;
        }
        body::after {
            content: "" !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background-image: 
                radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px) !important;
            background-size: 24px 24px !important;
            z-index: -1 !important;
            pointer-events: none !important;
        }
        @keyframes uniqueGlow {
            0% { background-position: 0% 0%; }
            50% { background-position: 100% 100%; }
            100% { background-position: 0% 100%; }
        }
    `;
    document.head.appendChild(style);
})();

// Authentication & Comprehensive Supabase Database Synchronizer for Learnify

function syncDatabaseSynchronously() {
    try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/sync/pull', false); // Synchronous GET
        xhr.send(null);
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            localStorage.setItem('learnify_users', JSON.stringify(data.users));
            localStorage.setItem('learnify_subjects', JSON.stringify(data.subjects));
            localStorage.setItem('learnify_teacher_assignments', JSON.stringify(data.assignments));
            localStorage.setItem('learnify_content', JSON.stringify(data.content));
            localStorage.setItem('learnify_quizzes', JSON.stringify(data.quizzes));
            localStorage.setItem('learnify_quiz_attempts', JSON.stringify(data.attempts));
            localStorage.setItem('learnify_fill_blanks', JSON.stringify(data.fill_blanks));
            localStorage.setItem('learnify_fill_blanks_attempts', JSON.stringify(data.fill_attempts));
            console.log("Database successfully synchronized with Supabase via FastAPI!");
        } else {
            console.warn("Failed to sync with Supabase backend. Using client cache.");
        }
    } catch (e) {
        console.warn("FastAPI backend offline or error during sync. Details:", e);
    }
}

function initMockDatabase() {
    // 1. Sync cache from Supabase
    syncDatabaseSynchronously();

    // 2. Setup fallback users if local cache is still empty
    const defaultUsers = [
        { id: 'u1', username: 'admin', password: 'admin123', name: 'System Admin', role: 'admin', status: 'active', email: 'admin@learnify.com' },
        { id: 'u2', username: 'teacher', password: 'teacher123', name: 'Prof. Sarah Jenkins', role: 'teacher', status: 'active', email: 'sarah.j@learnify.com' },
        { id: 'u3', username: 'student', password: 'student123', name: 'Alex Rivera', role: 'student', status: 'active', email: 'alex.rivera@learnify.com' },
        { id: 'u4', username: 'john_doe', password: 'student123', name: 'John Doe', role: 'student', status: 'active', email: 'john.doe@learnify.com' },
        { id: 'u5', username: 'robert_m', password: 'teacher123', name: 'Dr. Robert Miller', role: 'teacher', status: 'active', email: 'robert.m@learnify.com' }
    ];

    let users = [];
    const storedUsers = localStorage.getItem('learnify_users');
    if (storedUsers) {
        try { users = JSON.parse(storedUsers); } catch(e) { users = []; }
    }
    let updated = false;
    defaultUsers.forEach(defUser => {
        if (!users.some(u => u.username.toLowerCase() === defUser.username.toLowerCase())) {
            users.push(defUser);
            updated = true;
        }
    });
    if (!storedUsers || updated) {
        localStorage.setItem('learnify_users', JSON.stringify(users));
    }

    // Setup local storage fallbacks if not populated
    if (!localStorage.getItem('learnify_subjects')) {
        const defaultSubjects = [
            { id: 'sub1', code: 'CS301', name: 'Web Architecture & Systems', description: 'Advanced client-server web architectural patterns, REST APIs, and modern frontend frameworks.', creditHours: 3 },
            { id: 'sub2', code: 'CS402', name: 'Database Management Systems', description: 'Relational data modeling, SQL indexing optimizations, and transactional processing.', creditHours: 4 },
            { id: 'sub3', code: 'CS505', name: 'Artificial Intelligence & ML', description: 'Supervised learning algorithms, neural network structures, and model optimization techniques.', creditHours: 3 },
            { id: 'sub4', code: 'CS204', name: 'Software Engineering Principles', description: 'Agile development methodologies, software metrics, and system design patterns.', creditHours: 3 }
        ];
        localStorage.setItem('learnify_subjects', JSON.stringify(defaultSubjects));
    }

    if (!localStorage.getItem('learnify_teacher_assignments')) {
        const defaultAssignments = [
            { id: 'ta1', teacherName: 'Prof. Sarah Jenkins', subjectId: 'sub1', subjectName: 'Web Architecture & Systems' },
            { id: 'ta2', teacherName: 'Prof. Sarah Jenkins', subjectId: 'sub4', subjectName: 'Software Engineering Principles' },
            { id: 'ta3', teacherName: 'Dr. Robert Miller', subjectId: 'sub2', subjectName: 'Database Management Systems' },
            { id: 'ta4', teacherName: 'Dr. Robert Miller', subjectId: 'sub3', subjectName: 'Artificial Intelligence & ML' }
        ];
        localStorage.setItem('learnify_teacher_assignments', JSON.stringify(defaultAssignments));
    }

    if (!localStorage.getItem('learnify_content')) {
        const defaultContent = [
            { id: 'c1', title: 'Web Architecture Lecture Notes (PDF)', subjectName: 'Web Architecture & Systems', uploadedBy: 'Prof. Sarah Jenkins', fileType: 'pdf', fileName: 'web_architecture_ch1.pdf', uploadDate: '2026-07-10', description: 'Comprehensive guide covering HTTP protocols, RESTful APIs, and static server hosting.' },
            { id: 'c2', title: 'Relational Schema Indexing Slides', subjectName: 'Database Management Systems', uploadedBy: 'Dr. Robert Miller', fileType: 'pptx', fileName: 'db_indexing_v2.pptx', uploadDate: '2026-07-12', description: 'Visual lecture slides for B-Tree indexing and query optimization.' },
            { id: 'c3', title: 'Agile Sprint Planning Worksheet', subjectName: 'Software Engineering Principles', uploadedBy: 'Prof. Sarah Jenkins', fileType: 'docx', fileName: 'agile_sprint_worksheet.docx', uploadDate: '2026-07-15', description: 'Template for organizing user stories and backlog estimations.' }
        ];
        localStorage.setItem('learnify_content', JSON.stringify(defaultContent));
    }

    if (!localStorage.getItem('learnify_quizzes')) {
        const defaultQuizzes = [
            {
                id: 'q1',
                title: 'HTTP & Web Routing Fundamentals Quiz',
                subjectName: 'Web Architecture & Systems',
                createdBy: 'Prof. Sarah Jenkins',
                totalMarks: 10,
                questions: [
                    { qId: 1, text: 'Which HTTP method is used to retrieve data from a server?', options: ['GET', 'POST', 'DELETE', 'PUT'], correct: 0 },
                    { qId: 2, text: 'What is the default port for HTTP communication?', options: ['443', '80', '3000', '8080'], correct: 1 }
                ]
            },
            {
                id: 'q2',
                title: 'SQL Normalization & Indexing Quiz',
                subjectName: 'Database Management Systems',
                createdBy: 'Dr. Robert Miller',
                totalMarks: 10,
                questions: [
                    { qId: 1, text: 'Which normal form eliminates partial key dependencies?', options: ['1NF', '2NF', '3NF', 'BCNF'], correct: 1 },
                    { qId: 2, text: 'What data structure is commonly used for database indexing?', options: ['B-Tree', 'Queue', 'Array', 'LinkedList'], correct: 0 }
                ]
            }
        ];
        localStorage.setItem('learnify_quizzes', JSON.stringify(defaultQuizzes));
    }

    if (!localStorage.getItem('learnify_quiz_attempts')) {
        const defaultQuizAttempts = [
            { id: 'qa1', quizId: 'q1', quizTitle: 'HTTP & Web Routing Fundamentals Quiz', studentName: 'Alex Rivera', subjectName: 'Web Architecture & Systems', marksObtained: 10, totalMarks: 10, percentage: 100, date: '2026-07-18', status: 'Graded' },
            { id: 'qa2', quizId: 'q2', quizTitle: 'SQL Normalization & Indexing Quiz', studentName: 'John Doe', subjectName: 'Database Management Systems', marksObtained: 5, totalMarks: 10, percentage: 50, date: '2026-07-19', status: 'Graded' }
        ];
        localStorage.setItem('learnify_quiz_attempts', JSON.stringify(defaultQuizAttempts));
    }

    if (!localStorage.getItem('learnify_fill_blanks')) {
        const defaultFillBlanks = [
            {
                id: 'fb1',
                title: 'REST Architecture Fill in the Blanks',
                subjectName: 'Web Architecture & Systems',
                createdBy: 'Prof. Sarah Jenkins',
                totalMarks: 10,
                questions: [
                    { id: 1, text: 'REST stands for Representational _______ Transfer.', answer: 'State' },
                    { id: 2, text: 'The HTTP status code for Not Found is _______.', answer: '404' }
                ]
            },
            {
                id: 'fb2',
                title: 'SQL Commands Fill in the Blanks',
                subjectName: 'Database Management Systems',
                createdBy: 'Dr. Robert Miller',
                totalMarks: 10,
                questions: [
                    { id: 1, text: 'The _______ command is used to remove a table definition.', answer: 'DROP' },
                    { id: 2, text: 'The _______ clause filters records before grouping.', answer: 'WHERE' }
                ]
            }
        ];
        localStorage.setItem('learnify_fill_blanks', JSON.stringify(defaultFillBlanks));
    }

    if (!localStorage.getItem('learnify_fill_blanks_attempts')) {
        const defaultFillAttempts = [
            {
                id: 'fba1',
                fbId: 'fb1',
                title: 'REST Architecture Fill in the Blanks',
                studentName: 'Alex Rivera',
                subjectName: 'Web Architecture & Systems',
                answers: ['State', '404'],
                marksObtained: 10,
                totalMarks: 10,
                status: 'Checked',
                feedback: 'Excellent accuracy!',
                date: '2026-07-19'
            },
            {
                id: 'fba2',
                fbId: 'fb2',
                title: 'SQL Commands Fill in the Blanks',
                studentName: 'John Doe',
                subjectName: 'Database Management Systems',
                answers: ['DELETE', 'HAVING'],
                marksObtained: 0,
                totalMarks: 10,
                status: 'Pending',
                feedback: 'Waiting for teacher evaluation...',
                date: '2026-07-20'
            }
        ];
        localStorage.setItem('learnify_fill_blanks_attempts', JSON.stringify(defaultFillAttempts));
    }
}

// Check current user session and authorize based on required role
function checkAuth(requiredRole) {
    initMockDatabase();
    const currentUserJson = localStorage.getItem('learnify_current_user');
    
    if (!currentUserJson) {
        if (requiredRole === 'admin') window.location.href = '/admin';
        else if (requiredRole === 'teacher') window.location.href = '/login/teacher';
        else if (requiredRole === 'student') window.location.href = '/login/student';
        else window.location.href = '/';
        return null;
    }

    const currentUser = JSON.parse(currentUserJson);
    if (currentUser.role !== requiredRole) {
        showToast('Unauthorized Role Access. Redirecting...', 'error');
        setTimeout(() => { window.location.href = '/'; }, 1500);
        return null;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const userDisplayElements = document.querySelectorAll('.user-name-display');
        userDisplayElements.forEach(el => { el.textContent = currentUser.name; });

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    });

    return currentUser;
}

// Perform Login via API
function performLogin(username, password, expectedRole) {
    initMockDatabase();
    
    try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/auth/login', false); // Synchronous API Login
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({ username, password }));
        
        if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            if (result.success) {
                const user = result.user;
                
                // Set active user session
                localStorage.setItem('learnify_current_user', JSON.stringify(user));
                showToast(`Welcome back, ${user.name}! Redirecting to ${user.role.toUpperCase()} workspace...`, 'success');
                
                setTimeout(() => {
                    if (user.role === 'admin') window.location.href = '/admin/dashboard';
                    else if (user.role === 'teacher') window.location.href = '/teacher/dashboard';
                    else if (user.role === 'student') window.location.href = '/student/dashboard';
                    else window.location.href = '/';
                }, 1000);
                return true;
            } else {
                showToast(result.message || 'Invalid Username or Password!', 'error');
                return false;
            }
        } else {
            console.warn("FastAPI backend error. Falling back to local authentication.");
        }
    } catch (e) {
        console.warn("Connection to authentication API failed. Falling back. Details:", e);
    }
    
    // Fallback to local authentication
    const users = JSON.parse(localStorage.getItem('learnify_users') || '[]');
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

    if (!user) {
        showToast('Invalid Username or Password!', 'error');
        return false;
    }

    if (user.status !== 'active') {
        showToast('Account is deactivated. Contact administrator.', 'error');
        return false;
    }

    localStorage.setItem('learnify_current_user', JSON.stringify(user));
    showToast(`Welcome back, ${user.name}! Redirecting to ${user.role.toUpperCase()} workspace...`, 'success');
    
    setTimeout(() => {
        if (user.role === 'admin') window.location.href = '/admin/dashboard';
        else if (user.role === 'teacher') window.location.href = '/teacher/dashboard';
        else if (user.role === 'student') window.location.href = '/student/dashboard';
        else window.location.href = '/';
    }, 1000);

    return true;
}

// Log out user
function logout() {
    localStorage.removeItem('learnify_current_user');
    showToast('Logging out... Goodbye!', 'success');
    setTimeout(() => { window.location.href = '/'; }, 1000);
}

// Display dynamic visual toast alert
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '🔔';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        setTimeout(() => { toast.remove(); }, 300);
    }, 2500);
}

window.initMockDatabase = initMockDatabase;
window.checkAuth = checkAuth;
window.performLogin = performLogin;
window.logout = logout;
window.showToast = showToast;

// Initialize database sync on load
initMockDatabase();
