# 🐝 Atelier — The Sphere Hive Learning Workbench

Welcome to the **Atelier** platform, a high-fidelity, interactive cohort portal. This application integrates an administrative control dashboard, a student sandbox workbench, real-time mentorship hotlines, and a secure authentication center, all powered by a live **MySQL** relational database backend.

---

## 🗺️ System Architecture

The following flowchart outlines the end-to-end data lifecycle of the application, showing how React client-side states interact with Next.js Server Actions and connection-pooled MySQL databases.

```mermaid
graph TD
    Client["Web Browser (Client Side React)"]
    ServerActions["Next.js Server Actions (src/app/actions.js)"]
    MySQL["MySQL Database (localhost:3306)"]
    DBHelper["Database Pool & Init Helper (src/utils/db-sql.js)"]

    Client -- "1. Invokes Server Action" --> ServerActions
    ServerActions -- "2. Invokes Query/Execute Helper" --> DBHelper
    DBHelper -- "3. Acquires Connection & Executes SQL" --> MySQL
    MySQL -- "4. Returns Dataset" --> DBHelper
    DBHelper -- "5. Formats SnakeCase / Parses CSV Arrays" --> ServerActions
    ServerActions -- "6. Sends Response Payload" --> Client
```

---

## 🗃️ Database Entity Relationship Diagram (ERD)

All tables use the `atelier_` prefix to isolate database namespaces. The schema defines clear foreign keys and cascading rules to maintain database integrity:

```mermaid
erDiagram
    atelier_students {
        int id PK
        varchar name
        varchar email UK
        varchar phone
        varchar college
        varchar grad_year
        int xp
        int streak
        varchar password
        text bio
        varchar github
        varchar linkedin
        varchar portfolio
        text skills
    }
    atelier_lecturers {
        int id PK
        varchar name
        varchar email
        varchar expertise
        text bio
    }
    atelier_courses {
        int id PK
        varchar title
        text description
        varchar image
        text badges
        varchar price
        varchar original_price
        varchar discount
        int instructor_id FK
    }
    atelier_student_courses {
        int student_id PK, FK
        int course_id PK, FK
    }
    atelier_schedule {
        int id PK
        int course_id FK
        varchar time
        varchar title
        varchar type
    }
    atelier_recordings {
        int id PK
        int course_id FK
        varchar title
        varchar date
        varchar image
    }
    atelier_materials {
        int id PK
        int course_id FK
        varchar title
    }
    atelier_material_assets {
        int id PK
        int material_id FK
        varchar name
        varchar size
        varchar type
    }
    atelier_callbacks {
        int id PK
        varchar student_name
        varchar phone
        text topic
        varchar time
        varchar status
    }
    atelier_transactions {
        int id PK
        int student_id FK
        varchar student_name
        int course_id FK
        varchar course_title
        varchar amount
        varchar timestamp
        varchar status
    }

    atelier_lecturers ||--o{ atelier_courses : teaches
    atelier_courses ||--o{ atelier_student_courses : "has enrollments"
    atelier_students ||--o{ atelier_student_courses : enrolls
    atelier_courses ||--o{ atelier_schedule : schedules
    atelier_courses ||--o{ atelier_recordings : records
    atelier_courses ||--o{ atelier_materials : contains
    atelier_materials ||--o{ atelier_material_assets : holds
    atelier_students ||--o{ atelier_transactions : pays
    atelier_courses ||--o{ atelier_transactions : purchases
```

---

## 🔐 Authentication & Session Flow

Atelier features an integrated session manager using LocalStorage to enforce authentication states and route guards.

```mermaid
graph TD
    Start([User opens Atelier])
    AuthCheck{Has Session in LocalStorage?}
    SigninPage[Sign In Page /auth/signin]
    Dashboard[Learning Workbench /dashboard]
    SignupPage[Sign Up Page /auth/signup]
    ForgotPassword[Forgot Password Page /auth/forgot-password]
    DB[(MySQL Student Record)]

    Start --> AuthCheck
    AuthCheck -- "No" --> SigninPage
    AuthCheck -- "Yes" --> Dashboard

    SigninPage -- "Click Sign Up" --> SignupPage
    SigninPage -- "Click Forgot Password" --> ForgotPassword
    SigninPage -- "Enter Credentials & Submit" --> VerifyAuth{Verify Password}
    VerifyAuth -- "Correct" --> SaveSession[Save to LocalStorage] --> Dashboard
    VerifyAuth -- "Incorrect" --> ShowError[Display Error Message] --> SigninPage

    SignupPage -- "Enter Details & Register" --> DBInsert[Insert new student in DB] --> SaveSession
    ForgotPassword -- "Enter Email, Phone & New Password" --> DBUpdate[Update password in DB if matches] --> SigninPage
```

---

## 🚀 Getting Started

### 1. Environment Configurations
Configure the local MySQL server parameters in the `.env.local` file inside the root directory:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=atelier

NEXT_PUBLIC_MASTER_SECURITY_KEY=ARSHAD-SAMVRUDHI
NEXT_PUBLIC_CLEARANCE_PASSWORD=noor
```

### 2. Install & Start Development Server
```bash
# Install dependencies
npm install

# Run the next.js development workspace
npm run dev
```
*Note: The MySQL database and all required tables are automatically created and seeded with default data profiles upon launching the application.*

---

## 🧪 Testing Credentials

### 🔐 Secure Admin Console
- **Route Link:** `/admin`
- **Verification Credentials:**
  - **Master Security Key:** `ARSHAD-SAMVRUDHI`
  - **Clearance Password:** `noor`

### 🎓 Student Dashboard Login
- **Route Link:** `/auth/signin`
- **Default Profile Credentials:**
  - **Student Email:** `jane.doe@atelier.com`
  - **Password:** `password`

---

## 📁 Route Catalog

- `/` — Premium brand landing page detailing features, cohort comparisons, and testimonials.
- `/courses` — Public course catalog displaying active cohort tracks loaded directly from the database.
- `/admin` — Secure console providing full CRUD management capabilities over students, courses, schedules, resources, callbacks, instructors, and transaction logs.
- `/admin/courses/[id]` — Detailed breakdown of registered students in a cohort, providing audit capabilities.
- `/admin/lecturers/[id]` — Lecturer profile showcasing assigned cohorts and active students metrics.
- `/auth/signin` — Authenticates student details against the MySQL student schema.
- `/auth/signup` — Registers new profiles and hooks up default courses.
- `/auth/forgot-password` — Password reset form validating email profiles.
- `/dashboard` — Learning workbench containing tech-tree pathways, sandbox environments, and callback hotlines.
- `/dashboard/explore` — Explore catalog allowing students to purchase tracks.
- `/dashboard/my-courses` — Workspace selector containing purchased programs.
- `/dashboard/live` — Timetables, live room class links, and recorded archives.
- `/dashboard/materials` — Downloadable PDF slide checklists and repository resources.
- `/dashboard/profile` — Student portfolio editor updates names, contacts, biography details, social URLs, and core skills lists.
