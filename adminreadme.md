# Atelier Dev Console & Credentials Readme

This document provides credentials and structural information for testing the local workspace database interfaces.

---

## 🔐 Secure Admin clearance Console
- **Route URL:** `/admin`
- **Security Clearances:** Enter any of the following credentials inside the authorization terminal (configured in `.env.local` environment file):
  - **Master Security Key:** `ARSHAD-SAMVRUDHI`
  - **Clearance Password:** `noor`

*Note: Clearances are retained inside the current `sessionStorage` session. Clicking "Exit Session" clears the access token.*

---

## 🎓 Student Dashboard Logins
To login as a student, use the sign-in form at `/auth/signin` with the following credentials:
- **Mock Student Email:** `jane.doe@atelier.com`
- **Password:** `password`

### Registering New Students:
- Go to `/auth/signup`, input details, and complete registration.
- This creates a new record in the master `students` list. You can view, edit, or delete this record from the **Students** tab in the `/admin` console.

---

## 🗃️ MySQL Database Schema & Tables
All entities are stored in a **MySQL** database configured via environment variables in `.env.local`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=atelier
```

The database and all tables are **auto-created on first startup**. Tables use the `atelier_` prefix:
1. `atelier_students`: Active user profiles (name, email, password, phone, college, grad year, XP, streak).
2. `atelier_courses`: Available curriculum tracks (title, description, price, instructor ID, badges, etc.).
3. `atelier_student_courses`: Join table mapping student enrollments to courses.
4. `atelier_schedule`: Up-to-date calendar timetables linked to courses.
5. `atelier_recordings`: Playback video recordings of completed classes linked to courses.
6. `atelier_materials` & `atelier_material_assets`: Reference resources and downloadable material assets.
7. `atelier_callbacks`: Mentor hotline support tickets queued by students.
8. `atelier_lecturers`: Lecturer profiles mapped to courses.
9. `atelier_transactions`: Cohort purchases and registration payments auditing logs.

---

## 🔄 Dynamic Server Actions Sync
- Database operations are safely isolated to the server via Next.js Server Actions (`src/app/actions.js`).
- Adding, editing, or deleting any resource in the `/admin` Command Center instantly updates the database, and views are refreshed across student workbench panels in real time.
- Scheduling callback requests inside the `/dashboard` workbench dynamically inserts a record into the `atelier_callbacks` table.
