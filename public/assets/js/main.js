// Main JavaScript Application Handler for Learnify: Smart Learning System

document.addEventListener('DOMContentLoaded', () => {
    const pathname = window.location.pathname;

    // Detect Active Page & Trigger Module Loader
    if (pathname.includes('/admin/dashboard')) loadAdminDashboard();
    else if (pathname.includes('/admin/subjects')) loadAdminSubjects();
    else if (pathname.includes('/admin/teachers')) loadAdminTeachers();
    else if (pathname.includes('/admin/content')) loadAdminContent();
    else if (pathname.includes('/admin/quizzes')) loadAdminQuizzes();
    else if (pathname.includes('/admin/fill-in-blanks')) loadAdminFillBlanks();
    else if (pathname.includes('/admin/grading')) loadAdminGrading();

    else if (pathname.includes('/teacher/dashboard')) loadTeacherDashboard();
    else if (pathname.includes('/teacher/subjects')) loadTeacherSubjects();
    else if (pathname.includes('/teacher/content')) loadTeacherContent();
    else if (pathname.includes('/teacher/quizzes')) loadTeacherQuizzes();
    else if (pathname.includes('/teacher/fill-in-blanks')) loadTeacherFillBlanks();
    else if (pathname.includes('/teacher/grading')) loadTeacherGrading();

    else if (pathname.includes('/student/dashboard')) loadStudentDashboard();
    else if (pathname.includes('/student/subjects')) loadStudentSubjects();
    else if (pathname.includes('/student/quizzes')) loadStudentQuizzes();
    else if (pathname.includes('/student/fill-in-blanks')) loadStudentFillBlanks();
    else if (pathname.includes('/student/content')) loadStudentContent();

    // Tab Button Handlers
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const targetId = btn.getAttribute('data-tab');
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            const targetEl = document.getElementById(targetId);
            if (targetEl) targetEl.classList.add('active');
        });
    });
});

// ==========================================
// ADMIN MODULE HANDLERS
// ==========================================

function loadAdminDashboard() {
    const subjects = JSON.parse(localStorage.getItem('learnify_subjects') || '[]');
    const users = JSON.parse(localStorage.getItem('learnify_users') || '[]');
    const quizzes = JSON.parse(localStorage.getItem('learnify_quizzes') || '[]');
    const fillBlanks = JSON.parse(localStorage.getItem('learnify_fill_blanks') || '[]');
    const content = JSON.parse(localStorage.getItem('learnify_content') || '[]');

    const teachersCount = users.filter(u => u.role === 'teacher').length;
    const studentsCount = users.filter(u => u.role === 'student').length;

    if (document.getElementById('statSubjects')) document.getElementById('statSubjects').textContent = subjects.length;
    if (document.getElementById('statTeachers')) document.getElementById('statTeachers').textContent = teachersCount;
    if (document.getElementById('statStudents')) document.getElementById('statStudents').textContent = studentsCount;
    if (document.getElementById('statQuizzes')) document.getElementById('statQuizzes').textContent = quizzes.length;
    if (document.getElementById('statFillBlanks')) document.getElementById('statFillBlanks').textContent = fillBlanks.length;
    if (document.getElementById('statContent')) document.getElementById('statContent').textContent = content.length;
}

function loadAdminSubjects() {
    renderSubjectsTable('adminSubjectsBody', true);

    const form = document.getElementById('addSubjectForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const code = document.getElementById('subCode').value.trim();
            const name = document.getElementById('subName').value.trim();
            const desc = document.getElementById('subDesc').value.trim();
            const credits = document.getElementById('subCredits').value.trim();

            const subjects = JSON.parse(localStorage.getItem('learnify_subjects') || '[]');
            subjects.push({ id: 'sub_' + Date.now(), code, name, description: desc, creditHours: parseInt(credits) || 3 });
            localStorage.setItem('learnify_subjects', JSON.stringify(subjects));
            showToast(`Subject "${name}" created successfully!`, 'success');
            form.reset();
            renderSubjectsTable('adminSubjectsBody', true);
        });
    }
}

function renderSubjectsTable(tbodyId, allowActions = false) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    const subjects = JSON.parse(localStorage.getItem('learnify_subjects') || '[]');
    const assignments = JSON.parse(localStorage.getItem('learnify_teacher_assignments') || '[]');
    
    tbody.innerHTML = '';
    if (subjects.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No subjects found.</td></tr>`;
        return;
    }

    subjects.forEach(sub => {
        const assignedTeachers = assignments.filter(a => a.subjectId === sub.id).map(a => a.teacherName).join(', ') || 'Unassigned';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${sub.code}</strong></td>
            <td><strong>${sub.name}</strong></td>
            <td><span style="font-size: 0.9rem; color: var(--text-muted);">${sub.description}</span></td>
            <td><span class="badge badge-student">${assignedTeachers}</span></td>
            ${allowActions ? `
                <td>
                    <button class="btn-outline btn-danger" style="padding: 4px 10px; font-size: 0.8rem;" onclick="deleteSubject('${sub.id}')">Delete</button>
                </td>
            ` : ''}
        `;
        tbody.appendChild(tr);
    });
}

window.deleteSubject = function(subId) {
    if (confirm('Are you sure you want to delete this subject?')) {
        let subjects = JSON.parse(localStorage.getItem('learnify_subjects') || '[]');
        subjects = subjects.filter(s => s.id !== subId);
        localStorage.setItem('learnify_subjects', JSON.stringify(subjects));
        showToast('Subject deleted!', 'success');
        renderSubjectsTable('adminSubjectsBody', true);
    }
};

function loadAdminTeachers() {
    renderTeachersTable();
    populateSubjectDropdowns();

    const addTeacherForm = document.getElementById('addTeacherForm');
    if (addTeacherForm) {
        addTeacherForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('tName').value.trim();
            const username = document.getElementById('tUsername').value.trim();
            const email = document.getElementById('tEmail').value.trim();
            const password = document.getElementById('tPassword').value.trim();

            const users = JSON.parse(localStorage.getItem('learnify_users') || '[]');
            if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
                showToast('Username already exists!', 'error');
                return;
            }
            users.push({ id: 'u_' + Date.now(), name, username, email, password, role: 'teacher', status: 'active' });
            localStorage.setItem('learnify_users', JSON.stringify(users));
            showToast(`Teacher ${name} registered!`, 'success');
            addTeacherForm.reset();
            renderTeachersTable();
            populateSubjectDropdowns();
        });
    }

    const assignForm = document.getElementById('assignTeacherForm');
    if (assignForm) {
        assignForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const teacherName = document.getElementById('assignTeacherSelect').value;
            const subjectId = document.getElementById('assignSubjectSelect').value;
            const subjects = JSON.parse(localStorage.getItem('learnify_subjects') || '[]');
            const sub = subjects.find(s => s.id === subjectId);

            if (!sub || !teacherName) return;

            const assignments = JSON.parse(localStorage.getItem('learnify_teacher_assignments') || '[]');
            if (!assignments.some(a => a.teacherName === teacherName && a.subjectId === subjectId)) {
                assignments.push({ id: 'ta_' + Date.now(), teacherName, subjectId: sub.id, subjectName: sub.name });
                localStorage.setItem('learnify_teacher_assignments', JSON.stringify(assignments));
                showToast(`Assigned ${teacherName} to ${sub.name}!`, 'success');
                renderTeachersTable();
            } else {
                showToast('Teacher is already assigned to this subject!', 'error');
            }
        });
    }
}

function populateSubjectDropdowns() {
    const teacherSelect = document.getElementById('assignTeacherSelect');
    const subjectSelect = document.getElementById('assignSubjectSelect');
    
    if (teacherSelect) {
        const users = JSON.parse(localStorage.getItem('learnify_users') || '[]');
        const teachers = users.filter(u => u.role === 'teacher');
        teacherSelect.innerHTML = teachers.map(t => `<option value="${t.name}">${t.name} (@${t.username})</option>`).join('');
    }

    if (subjectSelect) {
        const subjects = JSON.parse(localStorage.getItem('learnify_subjects') || '[]');
        subjectSelect.innerHTML = subjects.map(s => `<option value="${s.id}">${s.code} - ${s.name}</option>`).join('');
    }
}

function renderTeachersTable() {
    const tbody = document.getElementById('adminTeachersBody');
    if (!tbody) return;
    const users = JSON.parse(localStorage.getItem('learnify_users') || '[]');
    const teachers = users.filter(u => u.role === 'teacher');
    const assignments = JSON.parse(localStorage.getItem('learnify_teacher_assignments') || '[]');

    tbody.innerHTML = '';
    teachers.forEach(t => {
        const assignedSubs = assignments.filter(a => a.teacherName === t.name).map(a => a.subjectName).join(', ') || 'None';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${t.name}</strong></td>
            <td>@${t.username}</td>
            <td>${t.email}</td>
            <td><span class="badge badge-teacher">${assignedSubs}</span></td>
            <td>
                <button class="btn-outline btn-danger" style="padding: 4px 10px; font-size: 0.8rem;" onclick="deleteUser('${t.id}', 'teacher')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function loadAdminContent() { renderContentTable('adminContentBody', true); setupContentUploadForm(); }
function loadAdminQuizzes() { renderQuizzesTable('adminQuizzesBody', true); setupQuizCreationForm(); }
function loadAdminFillBlanks() { renderFillBlanksTable('adminFillBlanksBody', true); setupFillBlanksCreationForm(); }
function loadAdminGrading() { renderGradingTable('adminGradingBody', true); }

// ==========================================
// TEACHER MODULE HANDLERS
// ==========================================

function loadTeacherDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('learnify_current_user') || '{}');
    const assignments = JSON.parse(localStorage.getItem('learnify_teacher_assignments') || '[]');
    const teacherSubs = assignments.filter(a => a.teacherName === currentUser.name);

    if (document.getElementById('teacherSubCount')) document.getElementById('teacherSubCount').textContent = teacherSubs.length;
    
    const fillAttempts = JSON.parse(localStorage.getItem('learnify_fill_blanks_attempts') || '[]');
    const pendingFb = fillAttempts.filter(a => a.status === 'Pending').length;
    if (document.getElementById('teacherPendingGrading')) document.getElementById('teacherPendingGrading').textContent = pendingFb;
}

function loadTeacherSubjects() {
    const currentUser = JSON.parse(localStorage.getItem('learnify_current_user') || '{}');
    const assignments = JSON.parse(localStorage.getItem('learnify_teacher_assignments') || '[]');
    const teacherSubs = assignments.filter(a => a.teacherName === currentUser.name);
    const tbody = document.getElementById('teacherSubjectsBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (teacherSubs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">No subjects assigned to you yet. Contact Administrator.</td></tr>`;
        return;
    }
    teacherSubs.forEach(a => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${a.subjectName}</strong></td>
            <td><span class="badge badge-success">Active Educator</span></td>
            <td><a href="/teacher/content" class="btn-outline" style="padding: 4px 10px; font-size: 0.8rem;">Manage Content</a></td>
        `;
        tbody.appendChild(tr);
    });
}

function loadTeacherContent() { renderContentTable('teacherContentBody', true); setupContentUploadForm(); }
function loadTeacherQuizzes() { renderQuizzesTable('teacherQuizzesBody', true); setupQuizCreationForm(); }
function loadTeacherFillBlanks() { renderFillBlanksTable('teacherFillBlanksBody', true); setupFillBlanksCreationForm(); }
function loadTeacherGrading() { renderGradingTable('teacherGradingBody', true); }

// ==========================================
// STUDENT MODULE HANDLERS
// ==========================================

function loadStudentDashboard() {
    const subjects = JSON.parse(localStorage.getItem('learnify_subjects') || '[]');
    const quizzes = JSON.parse(localStorage.getItem('learnify_quizzes') || '[]');
    const fillBlanks = JSON.parse(localStorage.getItem('learnify_fill_blanks') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('learnify_current_user') || '{}');

    const quizAttempts = JSON.parse(localStorage.getItem('learnify_quiz_attempts') || '[]');
    const studentQAttempts = quizAttempts.filter(q => q.studentName === currentUser.name);

    if (document.getElementById('studentEnrolledSubs')) document.getElementById('studentEnrolledSubs').textContent = subjects.length;
    if (document.getElementById('studentAvailableQuizzes')) document.getElementById('studentAvailableQuizzes').textContent = quizzes.length;
    if (document.getElementById('studentAvailableFillBlanks')) document.getElementById('studentAvailableFillBlanks').textContent = fillBlanks.length;
    
    let avg = 0;
    if (studentQAttempts.length > 0) {
        const total = studentQAttempts.reduce((sum, a) => sum + a.percentage, 0);
        avg = Math.round(total / studentQAttempts.length);
    }
    if (document.getElementById('studentAvgMarks')) document.getElementById('studentAvgMarks').textContent = `${avg}%`;
}

function loadStudentSubjects() { renderSubjectsTable('studentSubjectsBody', false); }
function loadStudentQuizzes() { renderStudentQuizzesPlayer(); }
function loadStudentFillBlanks() { renderStudentFillBlanksPlayer(); }
function loadStudentContent() { renderContentTable('studentContentBody', false); }

// ==========================================
// SHARED RENDERERS & FORM HELPERS
// ==========================================

function renderContentTable(tbodyId, allowActions = false) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    const content = JSON.parse(localStorage.getItem('learnify_content') || '[]');
    tbody.innerHTML = '';

    if (content.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No study content uploaded.</td></tr>`;
        return;
    }

    content.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item.title}</strong></td>
            <td><span class="badge badge-student">${item.subjectName}</span></td>
            <td>${item.uploadedBy}</td>
            <td><span style="font-size: 0.85rem; color: var(--text-muted);">${item.description}</span></td>
            <td><span class="badge badge-success">${item.fileType.toUpperCase()}</span></td>
            <td>
                <button class="btn-glow" style="padding: 6px 12px; font-size: 0.8rem; box-shadow: none;" onclick="downloadContent('${item.fileName}')">📥 Download</button>
                ${allowActions ? `<button class="btn-outline btn-danger" style="padding: 6px 12px; font-size: 0.8rem; margin-left: 5px;" onclick="deleteContent('${item.id}')">Delete</button>` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.downloadContent = function(fileName) {
    showToast(`Downloading file ${fileName}...`, 'success');
    setTimeout(() => {
        const contentStr = `Learnify: Smart Learning System\n\nResource Name: ${fileName}\nFormat: Academic Study Guide\nGenerated Date: ${new Date().toLocaleDateString()}\n\nThis is a simulated document content resource.`;
        const blob = new Blob([contentStr], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName.endsWith('.pdf') || fileName.endsWith('.pptx') || fileName.endsWith('.docx') || fileName.endsWith('.mp4') ? fileName : (fileName + '.txt');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, 800);
};

window.deleteContent = function(cId) {
    if (confirm('Delete this content file?')) {
        let content = JSON.parse(localStorage.getItem('learnify_content') || '[]');
        content = content.filter(c => c.id !== cId);
        localStorage.setItem('learnify_content', JSON.stringify(content));
        showToast('Content deleted!', 'success');
        location.reload();
    }
};

function setupContentUploadForm() {
    const form = document.getElementById('uploadContentForm');
    if (!form) return;

    const select = document.getElementById('contentSubjectSelect');
    if (select) {
        const subjects = JSON.parse(localStorage.getItem('learnify_subjects') || '[]');
        select.innerHTML = subjects.map(s => `<option value="${s.name}">${s.code} - ${s.name}</option>`).join('');
    }

    const fileInput = document.getElementById('contentFileInput');
    const fileNameText = document.getElementById('fileUploadNameText');

    if (fileInput && fileNameText) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
                fileNameText.innerHTML = `<span style="color: var(--color-accent); font-weight: 600;">📎 ${file.name}</span> (${sizeInMB} MB)`;
            } else {
                fileNameText.textContent = 'Drag & Drop or Click to Select File';
            }
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('contentTitle').value.trim();
        const subjectName = document.getElementById('contentSubjectSelect').value;
        const fileType = document.getElementById('contentTypeSelect').value;
        const desc = document.getElementById('contentDesc').value.trim();
        const currentUser = JSON.parse(localStorage.getItem('learnify_current_user') || '{}');

        const file = fileInput && fileInput.files[0];
        const attachedFileName = file ? file.name : (title.toLowerCase().replace(/\s+/g, '_') + '.' + fileType);

        // Show animated progress bar simulation
        const progressBox = document.getElementById('uploadProgressBox');
        const progressFill = document.getElementById('uploadProgressFillBar');
        const percentVal = document.getElementById('uploadPercentVal');
        const submitBtn = form.querySelector('button[type="submit"]');

        if (progressBox && progressFill && percentVal) {
            progressBox.style.display = 'block';
            if (submitBtn) submitBtn.disabled = true;

            let percentage = 0;
            const interval = setInterval(() => {
                percentage += 10;
                progressFill.style.width = percentage + '%';
                percentVal.textContent = percentage + '%';

                if (percentage >= 100) {
                    clearInterval(interval);

                    // Save to Mock Database
                    const content = JSON.parse(localStorage.getItem('learnify_content') || '[]');
                    content.push({
                        id: 'c_' + Date.now(),
                        title,
                        subjectName,
                        uploadedBy: currentUser.name || 'System Educator',
                        fileType,
                        fileName: attachedFileName,
                        uploadDate: new Date().toISOString().split('T')[0],
                        description: desc
                    });
                    localStorage.setItem('learnify_content', JSON.stringify(content));
                    showToast('File attached and uploaded successfully!', 'success');

                    setTimeout(() => {
                        form.reset();
                        if (fileNameText) fileNameText.textContent = 'Drag & Drop or Click to Select File';
                        progressBox.style.display = 'none';
                        if (submitBtn) submitBtn.disabled = false;
                        location.reload();
                    }, 500);
                }
            }, 150);
        } else {
            // Fallback if elements not present
            const content = JSON.parse(localStorage.getItem('learnify_content') || '[]');
            content.push({
                id: 'c_' + Date.now(),
                title,
                subjectName,
                uploadedBy: currentUser.name || 'System Educator',
                fileType,
                fileName: attachedFileName,
                uploadDate: new Date().toISOString().split('T')[0],
                description: desc
            });
            localStorage.setItem('learnify_content', JSON.stringify(content));
            showToast('Content resource uploaded!', 'success');
            form.reset();
            location.reload();
        }
    });
}

function renderQuizzesTable(tbodyId, allowActions = false) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    const quizzes = JSON.parse(localStorage.getItem('learnify_quizzes') || '[]');
    tbody.innerHTML = '';

    if (quizzes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No quizzes created yet.</td></tr>`;
        return;
    }

    quizzes.forEach(q => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${q.title}</strong></td>
            <td><span class="badge badge-student">${q.subjectName}</span></td>
            <td>${q.createdBy}</td>
            <td><strong>${q.questions.length} Questions</strong> (${q.totalMarks} Marks)</td>
            ${allowActions ? `<td><button class="btn-outline btn-danger" style="padding: 4px 10px; font-size: 0.8rem;" onclick="deleteQuiz('${q.id}')">Delete</button></td>` : ''}
        `;
        tbody.appendChild(tr);
    });
}

window.deleteQuiz = function(qId) {
    if (confirm('Delete quiz?')) {
        let quizzes = JSON.parse(localStorage.getItem('learnify_quizzes') || '[]');
        quizzes = quizzes.filter(q => q.id !== qId);
        localStorage.setItem('learnify_quizzes', JSON.stringify(quizzes));
        showToast('Quiz deleted!', 'success');
        location.reload();
    }
};

function setupQuizCreationForm() {
    const form = document.getElementById('createQuizForm');
    if (!form) return;

    const select = document.getElementById('quizSubjectSelect');
    if (select) {
        const subjects = JSON.parse(localStorage.getItem('learnify_subjects') || '[]');
        select.innerHTML = subjects.map(s => `<option value="${s.name}">${s.code} - ${s.name}</option>`).join('');
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('quizTitle').value.trim();
        const subjectName = document.getElementById('quizSubjectSelect').value;
        const q1Text = document.getElementById('q1Text').value.trim();
        const q1OptA = document.getElementById('q1OptA').value.trim();
        const q1OptB = document.getElementById('q1OptB').value.trim();
        const q1Correct = parseInt(document.getElementById('q1Correct').value);

        const currentUser = JSON.parse(localStorage.getItem('learnify_current_user') || '{}');
        const quizzes = JSON.parse(localStorage.getItem('learnify_quizzes') || '[]');

        quizzes.push({
            id: 'q_' + Date.now(),
            title,
            subjectName,
            createdBy: currentUser.name || 'Admin',
            totalMarks: 10,
            questions: [
                { qId: 1, text: q1Text, options: [q1OptA, q1OptB, 'Both', 'None'], correct: q1Correct }
            ]
        });
        localStorage.setItem('learnify_quizzes', JSON.stringify(quizzes));
        showToast('Quiz created!', 'success');
        form.reset();
        location.reload();
    });
}

function renderFillBlanksTable(tbodyId, allowActions = false) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    const fb = JSON.parse(localStorage.getItem('learnify_fill_blanks') || '[]');
    tbody.innerHTML = '';

    if (fb.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No Fill in the Blanks exercises found.</td></tr>`;
        return;
    }

    fb.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item.title}</strong></td>
            <td><span class="badge badge-teacher">${item.subjectName}</span></td>
            <td>${item.createdBy}</td>
            <td><strong>${item.questions.length} Sentences</strong> (${item.totalMarks} Marks)</td>
            ${allowActions ? `<td><button class="btn-outline btn-danger" style="padding: 4px 10px; font-size: 0.8rem;" onclick="deleteFillBlank('${item.id}')">Delete</button></td>` : ''}
        `;
        tbody.appendChild(tr);
    });
}

window.deleteFillBlank = function(fbId) {
    if (confirm('Delete Fill in the Blanks exercise?')) {
        let fb = JSON.parse(localStorage.getItem('learnify_fill_blanks') || '[]');
        fb = fb.filter(f => f.id !== fbId);
        localStorage.setItem('learnify_fill_blanks', JSON.stringify(fb));
        showToast('Exercise deleted!', 'success');
        location.reload();
    }
};

function setupFillBlanksCreationForm() {
    const form = document.getElementById('createFillBlanksForm');
    if (!form) return;

    const select = document.getElementById('fbSubjectSelect');
    if (select) {
        const subjects = JSON.parse(localStorage.getItem('learnify_subjects') || '[]');
        select.innerHTML = subjects.map(s => `<option value="${s.name}">${s.code} - ${s.name}</option>`).join('');
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('fbTitle').value.trim();
        const subjectName = document.getElementById('fbSubjectSelect').value;
        const q1Text = document.getElementById('fb1Text').value.trim();
        const q1Ans = document.getElementById('fb1Ans').value.trim();

        const currentUser = JSON.parse(localStorage.getItem('learnify_current_user') || '{}');
        const fb = JSON.parse(localStorage.getItem('learnify_fill_blanks') || '[]');

        fb.push({
            id: 'fb_' + Date.now(),
            title,
            subjectName,
            createdBy: currentUser.name || 'Educator',
            totalMarks: 10,
            questions: [
                { id: 1, text: q1Text, answer: q1Ans }
            ]
        });
        localStorage.setItem('learnify_fill_blanks', JSON.stringify(fb));
        showToast('Fill in the Blanks exercise created!', 'success');
        form.reset();
        location.reload();
    });
}

// Interactive Quiz Player for Students
function renderStudentQuizzesPlayer() {
    const container = document.getElementById('studentQuizPlayerContainer');
    if (!container) return;
    const quizzes = JSON.parse(localStorage.getItem('learnify_quizzes') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('learnify_current_user') || '{}');
    const attempts = JSON.parse(localStorage.getItem('learnify_quiz_attempts') || '[]');

    container.innerHTML = '';

    quizzes.forEach(quiz => {
        const myAttempt = attempts.find(a => a.quizId === quiz.id && a.studentName === currentUser.name);
        const card = document.createElement('div');
        card.className = 'glass-panel project-card';
        card.style.marginBottom = '1.5rem';

        let actionHtml = '';
        if (myAttempt) {
            actionHtml = `<div style="color: var(--color-accent); font-weight: 600;">Completed: ${myAttempt.marksObtained}/${myAttempt.totalMarks} Marks (${myAttempt.percentage}%)</div>`;
        } else {
            actionHtml = `
                <form onsubmit="submitQuizAttempt(event, '${quiz.id}')">
                    ${quiz.questions.map((q, idx) => `
                        <div style="margin-bottom: 1rem;">
                            <p style="font-weight: 600; margin-bottom: 0.5rem;">Q${idx+1}: ${q.text}</p>
                            ${q.options.map((opt, oIdx) => `
                                <label style="display: block; margin-bottom: 4px; font-size: 0.95rem; cursor: pointer;">
                                    <input type="radio" name="quiz_${quiz.id}_q_${q.qId}" value="${oIdx}" required> ${opt}
                                </label>
                            `).join('')}
                        </div>
                    `).join('')}
                    <button type="submit" class="btn-glow" style="margin-top: 1rem;">Submit Quiz Answers &rarr;</button>
                </form>
            `;
        }

        card.innerHTML = `
            <div class="project-card-header">
                <div>
                    <h3>${quiz.title}</h3>
                    <span class="badge badge-student">${quiz.subjectName}</span>
                </div>
                <span class="badge badge-success">${quiz.totalMarks} Marks</span>
            </div>
            <div style="margin-top: 1rem;">${actionHtml}</div>
        `;
        container.appendChild(card);
    });
}

window.submitQuizAttempt = function(e, quizId) {
    e.preventDefault();
    const quizzes = JSON.parse(localStorage.getItem('learnify_quizzes') || '[]');
    const quiz = quizzes.find(q => q.id === quizId);
    const currentUser = JSON.parse(localStorage.getItem('learnify_current_user') || '{}');

    let correctCount = 0;
    quiz.questions.forEach(q => {
        const selectedOption = document.querySelector(`input[name="quiz_${quiz.id}_q_${q.qId}"]:checked`);
        if (selectedOption && parseInt(selectedOption.value) === q.correct) {
            correctCount++;
        }
    });

    const score = Math.round((correctCount / quiz.questions.length) * quiz.totalMarks);
    const percentage = Math.round((correctCount / quiz.questions.length) * 100);

    const attempts = JSON.parse(localStorage.getItem('learnify_quiz_attempts') || '[]');
    attempts.push({
        id: 'qa_' + Date.now(),
        quizId,
        quizTitle: quiz.title,
        studentName: currentUser.name,
        subjectName: quiz.subjectName,
        marksObtained: score,
        totalMarks: quiz.totalMarks,
        percentage,
        date: new Date().toISOString().split('T')[0],
        status: 'Graded'
    });

    localStorage.setItem('learnify_quiz_attempts', JSON.stringify(attempts));
    showToast(`Quiz Submitted! You scored ${score}/${quiz.totalMarks} Marks (${percentage}%)`, 'success');
    renderStudentQuizzesPlayer();
};

// Interactive Fill in the Blanks Player for Students
function renderStudentFillBlanksPlayer() {
    const container = document.getElementById('studentFillBlanksPlayerContainer');
    if (!container) return;
    const fbList = JSON.parse(localStorage.getItem('learnify_fill_blanks') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('learnify_current_user') || '{}');
    const attempts = JSON.parse(localStorage.getItem('learnify_fill_blanks_attempts') || '[]');

    container.innerHTML = '';

    fbList.forEach(fb => {
        const myAttempt = attempts.find(a => a.fbId === fb.id && a.studentName === currentUser.name);
        const card = document.createElement('div');
        card.className = 'glass-panel project-card';
        card.style.marginBottom = '1.5rem';

        let actionHtml = '';
        if (myAttempt) {
            actionHtml = `
                <div style="color: var(--color-accent); font-weight: 600;">Submitted Answer: ${myAttempt.answers.join(', ')}</div>
                <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 4px;">Status: <span class="badge ${myAttempt.status === 'Checked' ? 'badge-success' : 'badge-pending'}">${myAttempt.status}</span> (${myAttempt.marksObtained}/${myAttempt.totalMarks} Marks)</div>
            `;
        } else {
            actionHtml = `
                <form onsubmit="submitFillBlanksAttempt(event, '${fb.id}')">
                    ${fb.questions.map((q, idx) => `
                        <div style="margin-bottom: 1rem;">
                            <label class="form-label">Q${idx+1}: ${q.text}</label>
                            <input type="text" id="fb_input_${fb.id}_${q.id}" class="form-input" placeholder="Type missing word..." required>
                        </div>
                    `).join('')}
                    <button type="submit" class="btn-glow btn-secondary" style="margin-top: 1rem;">Submit Fill in Blanks &rarr;</button>
                </form>
            `;
        }

        card.innerHTML = `
            <div class="project-card-header">
                <div>
                    <h3>${fb.title}</h3>
                    <span class="badge badge-teacher">${fb.subjectName}</span>
                </div>
                <span class="badge badge-success">${fb.totalMarks} Marks</span>
            </div>
            <div style="margin-top: 1rem;">${actionHtml}</div>
        `;
        container.appendChild(card);
    });
}

window.submitFillBlanksAttempt = function(e, fbId) {
    e.preventDefault();
    const fbList = JSON.parse(localStorage.getItem('learnify_fill_blanks') || '[]');
    const fb = fbList.find(f => f.id === fbId);
    const currentUser = JSON.parse(localStorage.getItem('learnify_current_user') || '{}');

    const userAnswers = [];
    let autoScore = 0;

    fb.questions.forEach(q => {
        const val = document.getElementById(`fb_input_${fb.id}_${q.id}`).value.trim();
        userAnswers.push(val);
        if (val.toLowerCase() === q.answer.toLowerCase()) {
            autoScore += Math.round(fb.totalMarks / fb.questions.length);
        }
    });

    const attempts = JSON.parse(localStorage.getItem('learnify_fill_blanks_attempts') || '[]');
    attempts.push({
        id: 'fba_' + Date.now(),
        fbId,
        title: fb.title,
        studentName: currentUser.name,
        subjectName: fb.subjectName,
        answers: userAnswers,
        marksObtained: autoScore,
        totalMarks: fb.totalMarks,
        status: 'Checked',
        feedback: 'Auto-evaluated by System',
        date: new Date().toISOString().split('T')[0]
    });

    localStorage.setItem('learnify_fill_blanks_attempts', JSON.stringify(attempts));
    showToast('Fill in the Blanks answers submitted!', 'success');
    renderStudentFillBlanksPlayer();
};

// Comprehensive Grading Table (Used by Admin & Teacher)
function renderGradingTable(tbodyId, allowAssignMarks = false) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    const fbAttempts = JSON.parse(localStorage.getItem('learnify_fill_blanks_attempts') || '[]');
    const quizAttempts = JSON.parse(localStorage.getItem('learnify_quiz_attempts') || '[]');

    tbody.innerHTML = '';

    const allAttempts = [
        ...quizAttempts.map(q => ({ ...q, type: 'Quiz' })),
        ...fbAttempts.map(f => ({ ...f, type: 'Fill in Blanks' }))
    ];

    if (allAttempts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No student attempts logged.</td></tr>`;
        return;
    }

    allAttempts.forEach(att => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${att.studentName}</strong></td>
            <td><span class="badge ${att.type === 'Quiz' ? 'badge-student' : 'badge-teacher'}">${att.type}</span></td>
            <td>${att.title || att.quizTitle}</td>
            <td>${att.subjectName}</td>
            <td><strong>${att.marksObtained}/${att.totalMarks} Marks</strong></td>
            <td><span class="badge badge-success">${att.status || 'Graded'}</span></td>
            ${allowAssignMarks ? `
                <td>
                    <div style="display: flex; gap: 6px;">
                        <input type="number" id="marks_input_${att.id}" class="form-input" style="width: 65px; padding: 4px;" value="${att.marksObtained}" max="${att.totalMarks}">
                        <button class="btn-glow" style="padding: 4px 8px; font-size: 0.75rem; box-shadow: none;" onclick="updateAttemptMarks('${att.id}', '${att.type}')">Assign Marks</button>
                    </div>
                </td>
            ` : ''}
        `;
        tbody.appendChild(tr);
    });
}

window.updateAttemptMarks = function(attemptId, type) {
    const newMarks = parseInt(document.getElementById(`marks_input_${attemptId}`).value);
    if (isNaN(newMarks)) { showToast('Invalid marks value!', 'error'); return; }

    if (type === 'Quiz') {
        const attempts = JSON.parse(localStorage.getItem('learnify_quiz_attempts') || '[]');
        const idx = attempts.findIndex(a => a.id === attemptId);
        if (idx > -1) {
            attempts[idx].marksObtained = newMarks;
            attempts[idx].percentage = Math.round((newMarks / attempts[idx].totalMarks) * 100);
            localStorage.setItem('learnify_quiz_attempts', JSON.stringify(attempts));
            showToast('Marks updated!', 'success');
        }
    } else {
        const attempts = JSON.parse(localStorage.getItem('learnify_fill_blanks_attempts') || '[]');
        const idx = attempts.findIndex(a => a.id === attemptId);
        if (idx > -1) {
            attempts[idx].marksObtained = newMarks;
            attempts[idx].status = 'Checked';
            localStorage.setItem('learnify_fill_blanks_attempts', JSON.stringify(attempts));
            showToast('Marks updated!', 'success');
        }
    }
    location.reload();
};
