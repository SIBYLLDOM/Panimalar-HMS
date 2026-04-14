import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'panimalar_hostel_management'
});
const queries = {
  departmentStudents: 'SELECT COUNT(*) as count FROM students WHERE department = ?',
  departmentLeaveRequests: 'SELECT COUNT(*) as count FROM leave_requests lr JOIN students s ON lr.student_id = s.id WHERE s.department = ? AND lr.status = "pending"',
  departmentRoomChanges: 'SELECT COUNT(*) as count FROM room_change_requests rcr JOIN students s ON rcr.student_id = s.id WHERE s.department = ? AND rcr.status = "pending"'
};
Object.entries(queries).forEach(([key, query]) => {
  db.query(query, ['CSE'], (err, result) => {
    if (err) console.error(key, err);
    else console.log(key, result);
  });
});
setTimeout(() => process.exit(0), 1000);
