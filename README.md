# StaffSync - Modern Human Resource Management Solution (HRMS)

**StaffSync** is a full-stack, enterprise-grade web application built using the **MERN Stack (MongoDB, Express.js, React.js, and Node.js)**. It streamlines, digitizes, and automates core human resource operations within organizations, providing dedicated portals and role-based workflows for **HR Personnel**, **Managers**, and **Employees**.

---

## 🌟 Key Features by Role

### 👑 1. HR Personnel & Administrators
- **Executive HR Dashboard:** High-level organizational KPIs, total headcount, active departments, real-time daily attendance rates, and pending time-off counters.
- **Employee Directory Management (CRUD):** 
  - Onboard new employees with position, department, initial credentials, supervisor assignment, and compensation details.
  - Edit employee records, department transfers, promotions, or status changes (*Active*, *On Leave*, *Terminated*).
  - Search and filter by name, role, department, and employment status.
- **Organizational Attendance Tracking:** View daily attendance audit logs across departments with clock-in/out timestamps, tardiness flags, and calculated hours.
- **Leave Request Approvals:** Approve or reject leave applications company-wide with custom supervisor notes and automated balance deduction.
- **Company Announcements Board:** Broadcast news, policy changes, holiday schedules, and urgent alerts with priority badges (*Urgent*, *High*, *Medium*, *Low*).
- **Training & Development Hub:** Publish training courses, assign them to entire departments or active employees, and track completion percentages.

### 👔 2. Department Managers
- **Team Management Hub:** View direct reports and departmental team members.
- **Team Leave Approvals:** Review leave applications submitted by department team members; approve or reject requests with reviewer comments.
- **Team Attendance Monitoring:** Track daily shift check-ins and punctuality for the team.
- **Skills & Training Oversight:** Assign department-specific programs and monitor progress completion rates.
- **Access to Announcements:** Stay aligned with corporate notices and leadership memos.

### 💻 3. Employees
- **Self-Service Attendance Clock:** 
  - One-click **Clock In** and **Clock Out** with live timestamps.
  - Automatic tardiness detection (after 9:30 AM flagged as *Late*).
  - Calculated work duration and monthly attendance log history.
- **Leave Management & Balances:**
  - Real-time leave balance cards (*Annual Vacation*, *Sick Leave*, *Casual/Personal*).
  - Interactive "Apply for Leave" modal with calendar picker, automatic day counter, and quota validation.
  - Track leave request statuses (*Pending*, *Approved*, *Rejected*) and supervisor remarks.
- **Personal Profile Management:** Maintain contact phone numbers, home address, and emergency contact details.
- **Learning & Training Dashboard:** View assigned courses, launch modules, and update progress percentages (0% to 100% completion).
- **Company Notice Board:** Read company announcements filtered by relevance.

---

## 🔑 Demo Login Credentials

The database comes pre-seeded with realistic records and 3 core demo accounts for instantaneous testing:

| Role | Email | Password | Name | Position |
| :--- | :--- | :--- | :--- | :--- |
| **👑 HR Admin** | `hr@staffsync.com` | `password123` | Sarah Jenkins | VP of Human Resources |
| **👔 Manager** | `manager@staffsync.com` | `password123` | Marcus Vance | Director of Engineering |
| **💻 Employee** | `employee@staffsync.com` | `password123` | Alex Rivera | Senior Frontend Developer |

> **Tip:** The login page and top navbar include **1-Click Fast Demo Buttons** to switch personas instantly without retyping credentials.

---

## 🛠️ Technology Stack

- **Frontend:**
  - **React 18** (Vite build system for rapid HMR)
  - **Tailwind CSS** (Modern responsive design, custom palettes)
  - **Lucide React** (Consistent modern iconography)
  - **React Router v6** (Protected routes & RBAC navigation)
  - **Axios** (JWT authorization interceptors)

- **Backend:**
  - **Node.js** & **Express.js** (RESTful API architecture)
  - **MongoDB** & **Mongoose** (Document schemas, indexes, relationships)
  - **JSON Web Tokens (JWT)** (Stateless secure authentication)
  - **Bcrypt.js** (Salted password hashing)
  - **CORS** & **Dotenv** (Security & environment configuration)

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (running locally on port 27017 or a MongoDB Atlas URI)

### 1. Database Seeding (Pre-populate Sample Data)
In the project root, run:
```bash
npm run seed
```
*This populates 8 users across 7 departments, realistic attendance logs, sample leave requests, company announcements, and training courses.*

### 2. Start Both Backend & Frontend
To run the full stack concurrently:
```bash
npm start
```
Or start each service separately:
- **Backend Server (Port 5000):**
  ```bash
  npm run server
  ```
- **Frontend Client (Port 3000):**
  ```bash
  npm run client
  ```

### 3. Open in Browser
Visit **`http://localhost:3000`** in your browser.

---

## 📁 Project Architecture

```
college project/
├── package.json              # Root package running concurrent scripts
├── README.md                 # Project documentation and guide
│
├── server/                   # Backend Express & MongoDB API
│   ├── .env                  # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   ├── package.json
│   └── src/
│       ├── server.js         # Express app entry & route mounting
│       ├── config/
│       │   └── db.js         # Mongoose connection handler
│       ├── models/
│       │   ├── User.js       # Employee schema with bcrypt hashing & roles
│       │   ├── Attendance.js # Daily clock-in/out records & hours
│       │   ├── Leave.js      # Leave requests & approval status
│       │   ├── Announcement.js # Notice board posts with priority & department
│       │   └── Training.js   # Course modules & employee progress
│       ├── middleware/
│       │   ├── auth.js       # JWT validation & role authorization (RBAC)
│       │   └── errorHandler.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── employeeController.js
│       │   ├── attendanceController.js
│       │   ├── leaveController.js
│       │   ├── announcementController.js
│       │   ├── trainingController.js
│       │   └── dashboardController.js
│       ├── routes/           # REST endpoints
│       └── seed/
│           └── seed.js       # Database initialization script
│
└── client/                   # Frontend React & Vite application
    ├── package.json
    ├── vite.config.js        # Port 3000 & API proxy configuration
    ├── tailwind.config.js    # Styling & color system
    └── src/
        ├── App.jsx           # Route definitions & RBAC gates
        ├── main.jsx
        ├── index.css
        ├── context/
        │   └── AuthContext.jsx # Global auth state & quick persona switcher
        ├── services/
        │   └── api.js        # Axios instance with auth interceptor
        ├── components/
        │   ├── common/       # Modal, LoadingSpinner, ProtectedRoute
        │   └── layout/       # Sidebar, Navbar, MainLayout
        └── pages/
            ├── Login.jsx     # Modern login with 1-click demo personas
            ├── Dashboard.jsx # Role-adaptive analytics & KPI widgets
            ├── Employees.jsx # Directory with search, filters, CRUD modals
            ├── Attendance.jsx# Live digital clock, clock in/out, audit log
            ├── Leaves.jsx    # Balance meters, apply modal, approve/reject
            ├── Announcements.jsx # Company notice board & publishing modal
            ├── Trainings.jsx # Courses, progress sliders, syllabus details
            └── Profile.jsx   # Personal records & emergency contact form
```

---

## 📡 REST API Reference Summary

| Endpoint | Method | Role | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/login` | POST | Public | Authenticate user & issue JWT token |
| `/api/auth/me` | GET | All | Retrieve current user profile |
| `/api/auth/profile` | PUT | All | Update personal info & emergency contact |
| `/api/dashboard/stats` | GET | All | Role-tailored metrics & summary |
| `/api/employees` | GET | HR / Mgr | List employees with search & filters |
| `/api/employees` | POST | HR | Onboard new employee |
| `/api/employees/:id` | PUT | HR | Update employee details |
| `/api/employees/:id` | DELETE | HR | Remove employee record |
| `/api/attendance/clock-in` | POST | All | Record clock-in timestamp |
| `/api/attendance/clock-out` | POST | All | Record clock-out & calculate duration |
| `/api/attendance/today` | GET | All | Get current day's clock status |
| `/api/attendance/my` | GET | All | Get personal attendance history |
| `/api/attendance/all` | GET | HR / Mgr | Organizational / department attendance logs |
| `/api/leaves/apply` | POST | All | Submit new leave application |
| `/api/leaves/my` | GET | All | Get personal leave history & balances |
| `/api/leaves` | GET | HR / Mgr | List pending/all leave requests |
| `/api/leaves/:id/status` | PUT | HR / Mgr | Approve or reject leave request |
| `/api/announcements` | GET | All | Get company announcements |
| `/api/announcements` | POST | HR | Publish new company announcement |
| `/api/announcements/:id` | DELETE | HR | Remove an announcement |
| `/api/trainings` | GET | HR / Mgr | List all training programs |
| `/api/trainings/my` | GET | All | Get user's assigned training modules |
| `/api/trainings` | POST | HR / Mgr | Create and assign training program |
| `/api/trainings/:id/progress` | PUT | All | Update course progress percentage |

---

## 🎓 College Project Highlights
- **Clear Separation of Concerns:** Modular MVC architecture with controllers, models, and routes on the backend.
- **Enterprise Security:** JWT tokens with HTTP bearer headers, bcrypt encrypted passwords, and role authorization middleware.
- **Data Integrity:** Compound MongoDB indexes (e.g. 1 attendance record per user per day), validation checks on leave balances.
- **Modern UX:** Fully responsive layouts, interactive modals, real-time live clock, status badges, and 1-click persona testing.

