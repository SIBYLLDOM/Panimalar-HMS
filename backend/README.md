# Panimalar Hostel Management System Backend

A comprehensive Node.js backend API for managing hostel operations including user authentication, room allocation, leave requests, and billing.

## Features

- **User Management**: Registration, login, role-based access control
- **Hostel Management**: Create and manage hostels, rooms, and beds
- **Leave Requests**: Students can request leave, admins/wardens can approve/reject
- **Room Change Requests**: Students can request room changes with automated bed allocation
- **Billing System**: Generate and manage student billing records
- **Authentication**: JWT-based secure authentication with role-based permissions

## User Roles

- **admin**: Full system access
- **hod**: Department-specific access
- **warden**: Hostel management access
- **student**: Limited access to own data

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/register-student` - Register student with detailed information
- `POST /api/auth/login` - Student login (redirects to /student)
- `POST /api/auth/faculty/login` - Faculty login (admin/HOD/warden, redirects to /{role})

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)
- `PUT /api/users/:id/password` - Change password

### Students
- `GET /api/students` - Get all students (admin/warden/hod only)
- `GET /api/students/:id` - Get student by ID
- `GET /api/students/user/:userId` - Get student by user ID
- `POST /api/students` - Create student profile (admin only)
- `PUT /api/students/:id` - Update student information
- `DELETE /api/students/:id` - Delete student (admin only)
- `GET /api/students/department/:department` - Get students by department (admin/warden/hod only)

### Hostels
- `GET /api/hostels` - Get all hostels
- `GET /api/hostels/:id` - Get hostel by ID
- `POST /api/hostels` - Create hostel (admin only)
- `PUT /api/hostels/:id` - Update hostel (admin only)
- `DELETE /api/hostels/:id` - Delete hostel (admin only)
- `GET /api/hostels/:id/rooms` - Get hostel with rooms and beds

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID
- `POST /api/rooms` - Create room (admin/warden only)
- `PUT /api/rooms/:id` - Update room (admin/warden only)
- `DELETE /api/rooms/:id` - Delete room (admin only)
- `GET /api/rooms/:id/beds` - Get beds in a room
- `POST /api/rooms/:id/beds` - Add bed to room (admin/warden only)
- `PUT /api/rooms/beds/:bedId/allocate` - Allocate bed to student (admin/warden only)
- `PUT /api/rooms/beds/:bedId/deallocate` - Deallocate bed (admin/warden only)

### Leave Requests
- `GET /api/leave` - Get all leave requests (admin/warden only)
- `GET /api/leave/student/:studentId` - Get student's leave requests
- `POST /api/leave` - Create leave request (student only)
- `PUT /api/leave/:id/approve` - Approve leave request (admin/warden only)
- `PUT /api/leave/:id/reject` - Reject leave request (admin/warden only)
- `DELETE /api/leave/:id` - Delete leave request

### Room Change Requests
- `GET /api/room-change` - Get all room change requests (admin/warden only)
- `GET /api/room-change/student/:studentId` - Get student's room change requests
- `POST /api/room-change` - Create room change request (student only)
- `PUT /api/room-change/:id/approve` - Approve room change request (admin/warden only)
- `PUT /api/room-change/:id/reject` - Reject room change request (admin/warden only)
- `DELETE /api/room-change/:id` - Delete room change request

### Billing
- `GET /api/billing` - Get all billing records (admin only)
- `GET /api/billing/student/:studentId` - Get student's billing records
- `POST /api/billing` - Create billing record (admin only)
- `PUT /api/billing/:id` - Update billing record (admin only)
- `PUT /api/billing/:id/pay` - Mark as paid (admin only)
- `PUT /api/billing/:id/unpay` - Mark as unpaid (admin only)
- `DELETE /api/billing/:id` - Delete billing record (admin only)
- `GET /api/billing/student/:studentId/summary` - Get billing summary for student
- `GET /api/billing/summary/all` - Get billing summary for all students (admin only)

### Dashboard
- `GET /api/dashboard/student` - Student dashboard (student only)
- `GET /api/dashboard/admin` - Admin dashboard (admin only)
- `GET /api/dashboard/hod` - HOD dashboard (HOD only)
- `GET /api/dashboard/warden` - Warden dashboard (warden only)

## Database Schema

The system uses MySQL with the following tables:
- `users` - User accounts and roles (authentication)
- `students` - Detailed student information linked to users
- `hostels` - Hostel information
- `rooms` - Room details
- `beds` - Bed allocation
- `leave_requests` - Leave request management
- `room_change_requests` - Room change requests
- `billing` - Billing records

### Students Table Structure
- `id` - Primary key
- `user_id` - Foreign key to users table
- `roll_no` - Student roll number (unique)
- `name` - Student full name
- `dob` - Date of birth
- `department` - Academic department
- `father_name` - Father's name
- `mother_name` - Mother's name
- `father_phone` - Father's phone number
- `mother_phone` - Mother's phone number
- `house_address` - Residential address
- `student_email` - Student's personal email
- `father_email` - Father's email
- `mother_email` - Mother's email
- `created_at` - Record creation timestamp

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=panimalar_hostel_management
JWT_SECRET=your_jwt_secret
```

3. Start the server:
```bash
npm run dev
```

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control
- Input validation
- SQL injection prevention with parameterized queries

## Error Handling

All endpoints return consistent error responses:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
