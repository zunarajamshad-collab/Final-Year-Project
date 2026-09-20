# Python Backend Server for Learnify: Smart Learning System
# Integrates with Supabase for data persistence and falls back to in-memory storage if tables don't exist yet.

import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import List, Dict, Any, Optional

# Load environment variables from .env
load_dotenv()

app = FastAPI(title="Learnify Backend")

# Enable Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to Supabase
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase: Optional[Client] = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print(f"Supabase Client initialized successfully at {SUPABASE_URL}")
    except Exception as e:
        print(f"Failed to initialize Supabase Client: {e}")

# ==========================================
# DEFAULT SEED DATA (FALLBACK & SEEDING STATE)
# ==========================================

DEFAULT_USERS = [
    {"id": "u1", "username": "admin", "password": "admin123", "name": "System Admin", "role": "admin", "status": "active", "email": "admin@learnify.com"},
    {"id": "u2", "username": "teacher", "password": "teacher123", "name": "Prof. Sarah Jenkins", "role": "teacher", "status": "active", "email": "sarah.j@learnify.com"},
    {"id": "u3", "username": "student", "password": "student123", "name": "Alex Rivera", "role": "student", "status": "active", "email": "alex.rivera@learnify.com"},
    {"id": "u4", "username": "john_doe", "password": "student123", "name": "John Doe", "role": "student", "status": "active", "email": "john.doe@learnify.com"},
    {"id": "u5", "username": "robert_m", "password": "teacher123", "name": "Dr. Robert Miller", "role": "teacher", "status": "active", "email": "robert.m@learnify.com"}
]

DEFAULT_SUBJECTS = [
    {"id": "sub1", "code": "CS301", "name": "Web Architecture & Systems", "description": "Advanced client-server web architectural patterns, REST APIs, and modern frontend frameworks.", "creditHours": 3},
    {"id": "sub2", "code": "CS402", "name": "Database Management Systems", "description": "Relational data modeling, SQL indexing optimizations, and transactional processing.", "creditHours": 4},
    {"id": "sub3", "code": "CS505", "name": "Artificial Intelligence & ML", "description": "Supervised learning algorithms, neural network structures, and model optimization techniques.", "creditHours": 3},
    {"id": "sub4", "code": "CS204", "name": "Software Engineering Principles", "description": "Agile development methodologies, software metrics, and system design patterns.", "creditHours": 3}
]

DEFAULT_ASSIGNMENTS = [
    {"id": "ta1", "teacherName": "Prof. Sarah Jenkins", "subjectId": "sub1", "subjectName": "Web Architecture & Systems"},
    {"id": "ta2", "teacherName": "Prof. Sarah Jenkins", "subjectId": "sub4", "subjectName": "Software Engineering Principles"},
    {"id": "ta3", "teacherName": "Dr. Robert Miller", "subjectId": "sub2", "subjectName": "Database Management Systems"},
    {"id": "ta4", "teacherName": "Dr. Robert Miller", "subjectId": "sub3", "subjectName": "Artificial Intelligence & ML"}
]

DEFAULT_CONTENT = [
    {"id": "c1", "title": "Web Architecture Lecture Notes (PDF)", "subjectName": "Web Architecture & Systems", "uploadedBy": "Prof. Sarah Jenkins", "fileType": "pdf", "fileName": "web_architecture_ch1.pdf", "uploadDate": "2026-07-10", "description": "Comprehensive guide covering HTTP protocols, RESTful APIs, and static server hosting."},
    {"id": "c2", "title": "Relational Schema Indexing Slides", "subjectName": "Database Management Systems", "uploadedBy": "Dr. Robert Miller", "fileType": "pptx", "fileName": "db_indexing_v2.pptx", "uploadDate": "2026-07-12", "description": "Visual lecture slides for B-Tree indexing and query optimization."},
    {"id": "c3", "title": "Agile Sprint Planning Worksheet", "subjectName": "Software Engineering Principles", "uploadedBy": "Prof. Sarah Jenkins", "fileType": "docx", "fileName": "agile_sprint_worksheet.docx", "uploadDate": "2026-07-15", "description": "Template for organizing user stories and backlog estimations."}
]

DEFAULT_QUIZZES = [
    {
        "id": "q1",
        "title": "HTTP & Web Routing Fundamentals Quiz",
        "subjectName": "Web Architecture & Systems",
        "createdBy": "Prof. Sarah Jenkins",
        "totalMarks": 10,
        "questions": [
            {"qId": 1, "text": "Which HTTP method is used to retrieve data from a server?", "options": ["GET", "POST", "DELETE", "PUT"], "correct": 0},
            {"qId": 2, "text": "What is the default port for HTTP communication?", "options": ["443", "80", "3000", "8080"], "correct": 1}
        ]
    },
    {
        "id": "q2",
        "title": "SQL Normalization & Indexing Quiz",
        "subjectName": "Database Management Systems",
        "createdBy": "Dr. Robert Miller",
        "totalMarks": 10,
        "questions": [
            {"qId": 1, "text": "Which normal form eliminates partial key dependencies?", "options": ["1NF", "2NF", "3NF", "BCNF"], "correct": 1},
            {"qId": 2, "text": "What data structure is commonly used for database indexing?", "options": ["B-Tree", "Queue", "Array", "LinkedList"], "correct": 0}
        ]
    }
]

DEFAULT_QUIZ_ATTEMPTS = [
    {"id": "qa1", "quizId": "q1", "quizTitle": "HTTP & Web Routing Fundamentals Quiz", "studentName": "Alex Rivera", "subjectName": "Web Architecture & Systems", "marksObtained": 10, "totalMarks": 10, "percentage": 100, "date": "2026-07-18", "status": "Graded"},
    {"id": "qa2", "quizId": "q2", "quizTitle": "SQL Normalization & Indexing Quiz", "studentName": "John Doe", "subjectName": "Database Management Systems", "marksObtained": 5, "totalMarks": 10, "percentage": 50, "date": "2026-07-19", "status": "Graded"}
]

DEFAULT_FILL_BLANKS = [
    {
        "id": "fb1",
        "title": "REST Architecture Fill in the Blanks",
        "subjectName": "Web Architecture & Systems",
        "createdBy": "Prof. Sarah Jenkins",
        "totalMarks": 10,
        "questions": [
            {"id": 1, "text": "REST stands for Representational _______ Transfer.", "answer": "State"},
            {"id": 2, "text": "The HTTP status code for Not Found is _______.", "answer": "404"}
        ]
    },
    {
        "id": "fb2",
        "title": "SQL Commands Fill in the Blanks",
        "subjectName": "Database Management Systems",
        "createdBy": "Dr. Robert Miller",
        "totalMarks": 10,
        "questions": [
            {"id": 1, "text": "The _______ command is used to remove a table definition.", "answer": "DROP"},
            {"id": 2, "text": "The _______ clause filters records before grouping.", "answer": "WHERE"}
        ]
    }
]

DEFAULT_FILL_ATTEMPTS = [
    {
        "id": "fba1",
        "fbId": "fb1",
        "title": "REST Architecture Fill in the Blanks",
        "studentName": "Alex Rivera",
        "subjectName": "Web Architecture & Systems",
        "answers": ["State", "404"],
        "marksObtained": 10,
        "totalMarks": 10,
        "status": "Checked",
        "feedback": "Excellent accuracy!",
        "date": "2026-07-19"
    },
    {
        "id": "fba2",
        "fbId": "fb2",
        "title": "SQL Commands Fill in the Blanks",
        "studentName": "John Doe",
        "subjectName": "Database Management Systems",
        "answers": ["DELETE", "HAVING"],
        "marksObtained": 0,
        "totalMarks": 10,
        "status": "Pending",
        "feedback": "Waiting for teacher evaluation...",
        "date": "2026-07-20"
    }
]

# Local database fallbacks (updated dynamically if Supabase queries error out)
local_db = {
    "learnify_users": list(DEFAULT_USERS),
    "learnify_subjects": list(DEFAULT_SUBJECTS),
    "learnify_teacher_assignments": list(DEFAULT_ASSIGNMENTS),
    "learnify_content": list(DEFAULT_CONTENT),
    "learnify_quizzes": list(DEFAULT_QUIZZES),
    "learnify_quiz_attempts": list(DEFAULT_QUIZ_ATTEMPTS),
    "learnify_fill_blanks": list(DEFAULT_FILL_BLANKS),
    "learnify_fill_blanks_attempts": list(DEFAULT_FILL_ATTEMPTS)
}

# ==========================================
# DATABASE HELPER UTILITIES
# ==========================================

def fetch_table(table_name: str) -> List[Dict[str, Any]]:
    """Fetches all records from a Supabase table. Falls back to in-memory storage if table does not exist."""
    if not supabase:
        return local_db[table_name]
    try:
        res = supabase.table(table_name).select("*").execute()
        return res.data
    except Exception as e:
        # Fallback to local DB and print diagnostic log
        print(f"DEBUG: Falling back to local cache for {table_name} (details: {e})")
        return local_db[table_name]

def write_record(table_name: str, record: Dict[str, Any]) -> Dict[str, Any]:
    """Writes (inserts or updates) a record in Supabase. Falls back to in-memory storage."""
    # Write to local cache first
    existing_index = next((i for i, item in enumerate(local_db[table_name]) if item.get("id") == record.get("id")), -1)
    if existing_index != -1:
        local_db[table_name][existing_index] = record
    else:
        local_db[table_name].append(record)

    if not supabase:
        return record
    try:
        supabase.table(table_name).upsert(record).execute()
        return record
    except Exception as e:
        print(f"DEBUG: Supabase write failed for {table_name}, synced in-memory (details: {e})")
        return record

def delete_record(table_name: str, record_id: str) -> bool:
    """Deletes a record from Supabase by ID. Falls back to in-memory storage."""
    # Delete from local cache
    local_db[table_name] = [item for item in local_db[table_name] if item.get("id") != record_id]
    
    if not supabase:
        return True
    try:
        supabase.table(table_name).delete().eq("id", record_id).execute()
        return True
    except Exception as e:
        print(f"DEBUG: Supabase delete failed for {table_name}, synced in-memory (details: {e})")
        return True

# ==========================================
# API ENDPOINTS
# ==========================================

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/auth/login")
def login(req: LoginRequest):
    users = fetch_table("learnify_users")
    user = next((u for u in users if u["username"].lower() == req.username.lower() and u["password"] == req.password), None)
    
    if not user:
        return {"success": False, "message": "Invalid Username or Password!"}
    
    if user.get("status") != "active":
        return {"success": False, "message": "Account is deactivated. Contact administrator."}
        
    return {"success": True, "user": user}

@app.post("/api/auth/register")
def register(user_data: Dict[str, Any]):
    write_record("learnify_users", user_data)
    return {"success": True, "user": user_data}

@app.get("/api/sync/pull")
def pull_sync():
    """Returns a full database snapshot of all collections to frontend."""
    return {
        "users": fetch_table("learnify_users"),
        "subjects": fetch_table("learnify_subjects"),
        "assignments": fetch_table("learnify_teacher_assignments"),
        "content": fetch_table("learnify_content"),
        "quizzes": fetch_table("learnify_quizzes"),
        "attempts": fetch_table("learnify_quiz_attempts"),
        "fill_blanks": fetch_table("learnify_fill_blanks"),
        "fill_attempts": fetch_table("learnify_fill_blanks_attempts")
    }

# Subjects
@app.post("/api/subjects")
def create_subject(subject: Dict[str, Any]):
    write_record("learnify_subjects", subject)
    return {"success": True}

@app.delete("/api/subjects/{subject_id}")
def delete_subject(subject_id: str):
    delete_record("learnify_subjects", subject_id)
    return {"success": True}

# Users
@app.post("/api/users")
def create_user(user: Dict[str, Any]):
    write_record("learnify_users", user)
    return {"success": True}

@app.put("/api/users/{user_id}")
def update_user(user_id: str, updates: Dict[str, Any]):
    users = fetch_table("learnify_users")
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.update(updates)
    write_record("learnify_users", user)
    return {"success": True, "user": user}

@app.delete("/api/users/{user_id}")
def delete_user(user_id: str):
    delete_record("learnify_users", user_id)
    return {"success": True}

# Teacher Assignments
@app.post("/api/teacher-assignments")
def create_assignment(assignment: Dict[str, Any]):
    write_record("learnify_teacher_assignments", assignment)
    return {"success": True}

@app.delete("/api/teacher-assignments/{assignment_id}")
def delete_assignment(assignment_id: str):
    delete_record("learnify_teacher_assignments", assignment_id)
    return {"success": True}

# Content Library
@app.post("/api/content")
def create_content(content: Dict[str, Any]):
    write_record("learnify_content", content)
    return {"success": True}

@app.delete("/api/content/{content_id}")
def delete_content(content_id: str):
    delete_record("learnify_content", content_id)
    return {"success": True}

# Quizzes
@app.post("/api/quizzes")
def create_quiz(quiz: Dict[str, Any]):
    write_record("learnify_quizzes", quiz)
    return {"success": True}

@app.delete("/api/quizzes/{quiz_id}")
def delete_quiz(quiz_id: str):
    delete_record("learnify_quizzes", quiz_id)
    return {"success": True}

# Quiz Attempts
@app.post("/api/quiz-attempts")
def create_quiz_attempt(attempt: Dict[str, Any]):
    write_record("learnify_quiz_attempts", attempt)
    return {"success": True}

# Fill in the Blanks
@app.post("/api/fill-blanks")
def create_fill_blanks(fb: Dict[str, Any]):
    write_record("learnify_fill_blanks", fb)
    return {"success": True}

@app.delete("/api/fill-blanks/{fb_id}")
def delete_fill_blanks(fb_id: str):
    delete_record("learnify_fill_blanks", fb_id)
    return {"success": True}

# Fill in the Blanks Attempts
@app.post("/api/fill-blanks-attempts")
def create_fill_blanks_attempt(attempt: Dict[str, Any]):
    write_record("learnify_fill_blanks_attempts", attempt)
    return {"success": True}

@app.put("/api/fill-blanks-attempts/{attempt_id}")
def update_fill_blanks_attempt(attempt_id: str, updates: Dict[str, Any]):
    attempts = fetch_table("learnify_fill_blanks_attempts")
    attempt = next((a for a in attempts if a["id"] == attempt_id), None)
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    attempt.update(updates)
    write_record("learnify_fill_blanks_attempts", attempt)
    return {"success": True, "attempt": attempt}

# ==========================================
# PAGE ROUTING (HTML Renders)
# ==========================================

@app.get("/")
def get_index():
    return FileResponse("public/index.html")

@app.get("/login/student")
def get_login_student():
    return FileResponse("public/login-student.html")

@app.get("/login/teacher")
def get_login_teacher():
    return FileResponse("public/login-teacher.html")

@app.get("/admin")
def get_login_admin():
    return FileResponse("public/login-admin.html")

@app.get("/admin/{page}")
def get_admin_page(page: str):
    if not page.endswith(".html"):
        path = f"public/admin/{page}.html"
    else:
        path = f"public/admin/{page}"
    if os.path.exists(path):
        return FileResponse(path)
    return FileResponse("public/index.html")

@app.get("/teacher/{page}")
def get_teacher_page(page: str):
    if not page.endswith(".html"):
        path = f"public/teacher/{page}.html"
    else:
        path = f"public/teacher/{page}"
    if os.path.exists(path):
        return FileResponse(path)
    return FileResponse("public/index.html")

@app.get("/student/{page}")
def get_student_page(page: str):
    if not page.endswith(".html"):
        path = f"public/student/{page}.html"
    else:
        path = f"public/student/{page}"
    if os.path.exists(path):
        return FileResponse(path)
    return FileResponse("public/index.html")

# Static assets mapping
app.mount("/assets", StaticFiles(directory="public/assets"), name="assets")

# Fallback route for all other requests
@app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE"])
def catch_all(request: Request, path_name: str):
    # If path exists in public directory, serve it, otherwise index.html
    local_path = f"public/{path_name}"
    if os.path.isfile(local_path):
        return FileResponse(local_path)
    return FileResponse("public/index.html")

# ==========================================
# START SERVER
# ==========================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    print(f"==================================================")
    print(f"  LEARNIFY: SMART LEARNING SYSTEM RUNNING")
    print(f"  Python FastAPI Backend + Supabase")
    print(f"  Local URL: http://localhost:{port}")
    print(f"==================================================")
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)
