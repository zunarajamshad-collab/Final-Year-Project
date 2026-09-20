-- Supabase SQL Schema for Learnify: Smart Learning System
-- Copy and run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/ktdgaxxatzhztsnhwrwx/sql)

-- 1. Create tables with exact camelCase columns matching frontend JS keys

-- Users table
CREATE TABLE IF NOT EXISTS learnify_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    email TEXT
);

-- Subjects table
CREATE TABLE IF NOT EXISTS learnify_subjects (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    "creditHours" INTEGER NOT NULL
);

-- Teacher assignments table
CREATE TABLE IF NOT EXISTS learnify_teacher_assignments (
    id TEXT PRIMARY KEY,
    "teacherName" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL
);

-- Content library table
CREATE TABLE IF NOT EXISTS learnify_content (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "uploadDate" TEXT NOT NULL,
    description TEXT
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS learnify_quizzes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "totalMarks" INTEGER NOT NULL,
    questions JSONB NOT NULL
);

-- Quiz attempts table
CREATE TABLE IF NOT EXISTS learnify_quiz_attempts (
    id TEXT PRIMARY KEY,
    "quizId" TEXT NOT NULL,
    "quizTitle" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "marksObtained" INTEGER NOT NULL,
    "totalMarks" INTEGER NOT NULL,
    percentage INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL
);

-- Fill in the Blanks table
CREATE TABLE IF NOT EXISTS learnify_fill_blanks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "totalMarks" INTEGER NOT NULL,
    questions JSONB NOT NULL
);

-- Fill in the Blanks attempts table
CREATE TABLE IF NOT EXISTS learnify_fill_blanks_attempts (
    id TEXT PRIMARY KEY,
    "fbId" TEXT NOT NULL,
    title TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    answers JSONB NOT NULL,
    "marksObtained" INTEGER NOT NULL,
    "totalMarks" INTEGER NOT NULL,
    status TEXT NOT NULL,
    feedback TEXT,
    date TEXT NOT NULL
);

-- 2. Disable Row Level Security (RLS) on all tables for prototyping and testing
ALTER TABLE learnify_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE learnify_subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE learnify_teacher_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE learnify_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE learnify_quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE learnify_quiz_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE learnify_fill_blanks DISABLE ROW LEVEL SECURITY;
ALTER TABLE learnify_fill_blanks_attempts DISABLE ROW LEVEL SECURITY;

-- 3. Populate Default Seed Data (only inserts if table is empty)

INSERT INTO learnify_users (id, username, password, name, role, status, email)
VALUES 
    ('u1', 'admin', 'admin123', 'System Admin', 'admin', 'active', 'admin@learnify.com'),
    ('u2', 'teacher', 'teacher123', 'Prof. Sarah Jenkins', 'teacher', 'active', 'sarah.j@learnify.com'),
    ('u3', 'student', 'student123', 'Alex Rivera', 'student', 'active', 'alex.rivera@learnify.com'),
    ('u4', 'john_doe', 'student123', 'John Doe', 'student', 'active', 'john.doe@learnify.com'),
    ('u5', 'robert_m', 'teacher123', 'Dr. Robert Miller', 'teacher', 'active', 'robert.m@learnify.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO learnify_subjects (id, code, name, description, "creditHours")
VALUES
    ('sub1', 'CS301', 'Web Architecture & Systems', 'Advanced client-server web architectural patterns, REST APIs, and modern frontend frameworks.', 3),
    ('sub2', 'CS402', 'Database Management Systems', 'Relational data modeling, SQL indexing optimizations, and transactional processing.', 4),
    ('sub3', 'CS505', 'Artificial Intelligence & ML', 'Supervised learning algorithms, neural network structures, and model optimization techniques.', 3),
    ('sub4', 'CS204', 'Software Engineering Principles', 'Agile development methodologies, software metrics, and system design patterns.', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO learnify_teacher_assignments (id, "teacherName", "subjectId", "subjectName")
VALUES
    ('ta1', 'Prof. Sarah Jenkins', 'sub1', 'Web Architecture & Systems'),
    ('ta2', 'Prof. Sarah Jenkins', 'sub4', 'Software Engineering Principles'),
    ('ta3', 'Dr. Robert Miller', 'sub2', 'Database Management Systems'),
    ('ta4', 'Dr. Robert Miller', 'sub3', 'Artificial Intelligence & ML')
ON CONFLICT (id) DO NOTHING;

INSERT INTO learnify_content (id, title, "subjectName", "uploadedBy", "fileType", "fileName", "uploadDate", description)
VALUES
    ('c1', 'Web Architecture Lecture Notes (PDF)', 'Web Architecture & Systems', 'Prof. Sarah Jenkins', 'pdf', 'web_architecture_ch1.pdf', '2026-07-10', 'Comprehensive guide covering HTTP protocols, RESTful APIs, and static server hosting.'),
    ('c2', 'Relational Schema Indexing Slides', 'Database Management Systems', 'Dr. Robert Miller', 'pptx', 'db_indexing_v2.pptx', '2026-07-12', 'Visual lecture slides for B-Tree indexing and query optimization.'),
    ('c3', 'Agile Sprint Planning Worksheet', 'Software Engineering Principles', 'Prof. Sarah Jenkins', 'docx', 'agile_sprint_worksheet.docx', '2026-07-15', 'Template for organizing user stories and backlog estimations.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO learnify_quizzes (id, title, "subjectName", "createdBy", "totalMarks", questions)
VALUES
    ('q1', 'HTTP & Web Routing Fundamentals Quiz', 'Web Architecture & Systems', 'Prof. Sarah Jenkins', 10, '[{"qId": 1, "text": "Which HTTP method is used to retrieve data from a server?", "options": ["GET", "POST", "DELETE", "PUT"], "correct": 0}, {"qId": 2, "text": "What is the default port for HTTP communication?", "options": ["443", "80", "3000", "8080"], "correct": 1}]'::jsonb),
    ('q2', 'SQL Normalization & Indexing Quiz', 'Database Management Systems', 'Dr. Robert Miller', 10, '[{"qId": 1, "text": "Which normal form eliminates partial key dependencies?", "options": ["1NF", "2NF", "3NF", "BCNF"], "correct": 1}, {"qId": 2, "text": "What data structure is commonly used for database indexing?", "options": ["B-Tree", "Queue", "Array", "LinkedList"], "correct": 0}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO learnify_quiz_attempts (id, "quizId", "quizTitle", "studentName", "subjectName", "marksObtained", "totalMarks", percentage, date, status)
VALUES
    ('qa1', 'q1', 'HTTP & Web Routing Fundamentals Quiz', 'Alex Rivera', 'Web Architecture & Systems', 10, 10, 100, '2026-07-18', 'Graded'),
    ('qa2', 'q2', 'SQL Normalization & Indexing Quiz', 'John Doe', 'Database Management Systems', 5, 10, 50, '2026-07-19', 'Graded')
ON CONFLICT (id) DO NOTHING;

INSERT INTO learnify_fill_blanks (id, title, "subjectName", "createdBy", "totalMarks", questions)
VALUES
    ('fb1', 'REST Architecture Fill in the Blanks', 'Web Architecture & Systems', 'Prof. Sarah Jenkins', 10, '[{"id": 1, "text": "REST stands for Representational _______ Transfer.", "answer": "State"}, {"id": 2, "text": "The HTTP status code for Not Found is _______.", "answer": "404"}]'::jsonb),
    ('fb2', 'SQL Commands Fill in the Blanks', 'Database Management Systems', 'Dr. Robert Miller', 10, '[{"id": 1, "text": "The _______ command is used to remove a table definition.", "answer": "DROP"}, {"id": 2, "text": "The _______ clause filters records before grouping.", "answer": "WHERE"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO learnify_fill_blanks_attempts (id, "fbId", title, "studentName", "subjectName", answers, "marksObtained", "totalMarks", status, feedback, date)
VALUES
    ('fba1', 'fb1', 'REST Architecture Fill in the Blanks', 'Alex Rivera', 'Web Architecture & Systems', '["State", "404"]'::jsonb, 10, 10, 'Checked', 'Excellent accuracy!', '2026-07-19'),
    ('fba2', 'fb2', 'SQL Commands Fill in the Blanks', 'John Doe', 'Database Management Systems', '["DELETE", "HAVING"]'::jsonb, 0, 10, 'Pending', 'Waiting for teacher evaluation...', '2026-07-20')
ON CONFLICT (id) DO NOTHING;
