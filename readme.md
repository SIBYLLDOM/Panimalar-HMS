# 🧑‍🏫 HOD MODULE — HOSTEL MANAGEMENT SYSTEM

## 📌 Overview

This module is designed for the **Head of Department (HOD)** role in the Hostel Management System.
It provides complete control over  **student monitoring, leave approvals, and analytics dashboards** .

The UI must follow a **professional design** with:

* 🎨 Theme: **Blue & White**
* 📍 Layout: **Left Sidebar Navigation**
* 📊 Focus: **Data-driven dashboard + approvals**

---

# 🎯 CORE FEATURES

## 1. 📊 Dashboard (Main Page)

The HOD dashboard should display  **real-time statistics** :

### 🔹 Cards (Top Section)

* Total Students (Department-wise)
* Pending Leave Requests
* Approved Leaves
* Rejected Leaves

### 🔹 Charts

* 📈 Leave Trends (Weekly / Monthly)
* 📊 Leave Status Distribution (Pie Chart)

### 🔹 Recent Activity

* Latest leave requests
* Recently approved/rejected leaves

---

## 2. 📝 Leave Management

### 🔹 Features:

* View all leave requests
* Filter by:
  * Status (Pending / Approved / Rejected)
  * Date
  * Student name / roll number

### 🔹 Actions:

* ✅ Approve leave
* ❌ Reject leave

### 🔹 Table Columns:

* Student Name
* Roll Number
* Department
* From Date
* To Date
* Reason
* Status
* Action Buttons

---

## 3. 👨‍🎓 Student Management (View Only)

### 🔹 Features:

* View all students in HOD’s department
* Search & filter students

### 🔹 Details:

* Name
* Roll Number
* Department
* Room Number
* Contact Info

---

## 4. 🔍 Student Profile Page

### 🔹 Shows:

* Full student details
* Room allocation
* Leave history
* Contact info (parents + student)

---

## 5. 🔔 Notifications (Optional but recommended)

* New leave requests
* Status updates

---

# 🧱 FOLDER STRUCTURE

```
src/
│
├── components/
│   └── HOD/
│       ├── Dashboard.jsx
│       ├── LeaveManagement.jsx
│       ├── Students.jsx
│       ├── StudentProfile.jsx
│       ├── Sidebar.jsx
│       ├── Header.jsx
│
├── pages/
│   └── HOD/
│       ├── HODDashboardPage.jsx
│
├── services/
│   └── hodService.js
│
├── assets/
│   └── css/
│       └── hod/
│           ├── dashboard.css
│           ├── sidebar.css
│           ├── table.css
│           ├── forms.css
│
├── routes/
│   └── hodRoutes.jsx
```

---

# 🎨 UI REQUIREMENTS

## Sidebar (Left Navigation)

* Fixed left sidebar
* Blue background (#0d6efd or similar)
* White text/icons
* Menu items:
  * Dashboard
  * Leave Requests
  * Students
  * Logout

## Header (Top Bar)

* White background
* Page title
* Profile icon (optional)

---

# 🔌 API INTEGRATION

## Base URL

```
http://localhost:5000
```

## Endpoints

### Leave Requests

* GET `/leave-requests`
* PUT `/leave/:id/approve`
* PUT `/leave/:id/reject`

### Students

* GET `/students`
* GET `/students/:id`

---

# ⚙️ FUNCTIONAL REQUIREMENTS

* Role-based access (HOD only)
* Protected routes
* API integration using Axios
* Loading states & error handling
* Clean reusable components

---

# 📊 DASHBOARD DATA FORMAT (EXPECTED)

```json
{
  "totalStudents": 120,
  "pendingLeaves": 15,
  "approvedLeaves": 80,
  "rejectedLeaves": 25
}
```

---

# 🧠 TECH STACK

* React (Vite)
* Axios
* React Router
* Chart Library (Recharts or Chart.js)
* CSS (modular / separate files)

---

# 💎 UX REQUIREMENTS

* Responsive design
* Clean spacing
* Hover effects on buttons
* Table pagination
* Search functionality

---

# 🚀 BONUS FEATURES (OPTIONAL)

* Export leave data (CSV)
* Dark mode toggle
* Notifications panel

---

# ✅ FINAL GOAL

Deliver a **professional HOD dashboard** with:

* Clean UI
* Fully functional leave approval system
* Real-time statistics
* Scalable component structure

---

# 🧩 NOTES

* Keep components reusable
* Maintain separation of concerns
* Follow clean code practices

---

🔥 This module should feel like a  **real enterprise admin panel** , not just a student project.
