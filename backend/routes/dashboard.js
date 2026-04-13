import express from 'express';
import { db } from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Student dashboard
router.get('/student', authenticateToken, authorizeRoles('student'), (req, res) => {
  const user_id = req.user.id;
  
  // Get student information
  const getStudent = `
    SELECT s.*, u.email as user_email 
    FROM students s 
    JOIN users u ON s.user_id = u.id 
    WHERE s.user_id = ?
  `;
  
  db.query(getStudent, [user_id], (err, studentResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (studentResults.length === 0) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    
    const student = studentResults[0];
    
    // Get student's current room allocation
    const getRoom = `
      SELECT b.id as bed_id, b.bed_number, r.room_number, h.name as hostel_name, h.type as hostel_type
      FROM beds b
      JOIN rooms r ON b.room_id = r.id
      JOIN hostels h ON r.hostel_id = h.id
      WHERE b.student_id = ? AND b.is_occupied = TRUE
    `;
    
    db.query(getRoom, [student.id], (err, roomResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Get recent leave requests
      const getLeaveRequests = `
        SELECT * FROM leave_requests 
        WHERE student_id = ? 
        ORDER BY created_at DESC 
        LIMIT 5
      `;
      
      db.query(getLeaveRequests, [student.id], (err, leaveResults) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Get billing summary
        const getBillingSummary = `
          SELECT 
            COUNT(*) as total_records,
            SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid,
            SUM(CASE WHEN status = 'unpaid' THEN amount ELSE 0 END) as total_unpaid,
            SUM(amount) as total_amount
          FROM billing 
          WHERE student_id = ?
        `;
        
        db.query(getBillingSummary, [student.id], (err, billingResults) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          
          res.json({
            message: 'Student dashboard data',
            student: student,
            room: roomResults[0] || null,
            recentLeaveRequests: leaveResults,
            billingSummary: billingResults[0] || {
              total_records: 0,
              total_paid: 0,
              total_unpaid: 0,
              total_amount: 0
            }
          });
        });
      });
    });
  });
});

// Admin dashboard
router.get('/admin', authenticateToken, authorizeRoles('admin'), (req, res) => {
  // Get system statistics
  const queries = {
    totalStudents: 'SELECT COUNT(*) as count FROM students',
    totalHostels: 'SELECT COUNT(*) as count FROM hostels',
    totalRooms: 'SELECT COUNT(*) as count FROM rooms',
    totalBeds: 'SELECT COUNT(*) as count FROM beds',
    occupiedBeds: 'SELECT COUNT(*) as count FROM beds WHERE is_occupied = TRUE',
    pendingLeaveRequests: 'SELECT COUNT(*) as count FROM leave_requests WHERE status = "pending"',
    pendingRoomChanges: 'SELECT COUNT(*) as count FROM room_change_requests WHERE status = "pending"',
    unpaidBills: 'SELECT COUNT(*) as count FROM billing WHERE status = "unpaid"'
  };
  
  const results = {};
  let completed = 0;
  const totalQueries = Object.keys(queries).length;
  
  Object.entries(queries).forEach(([key, query]) => {
    db.query(query, (err, result) => {
      if (err) {
        console.error(`Error in ${key} query:`, err);
        results[key] = 0;
      } else {
        results[key] = result[0].count;
      }
      
      completed++;
      if (completed === totalQueries) {
        res.json({
          message: 'Admin dashboard data',
          statistics: results,
          occupancyRate: results.totalBeds > 0 ? 
            Math.round((results.occupiedBeds / results.totalBeds) * 100) : 0
        });
      }
    });
  });
});

// HOD dashboard
router.get('/hod', authenticateToken, authorizeRoles('hod'), (req, res) => {
  const department = req.user.department;
  
  // Get department-specific statistics
  const queries = {
    departmentStudents: `SELECT COUNT(*) as count FROM students WHERE department = ?`,
    departmentLeaveRequests: `SELECT COUNT(*) as count FROM leave_requests lr 
                          JOIN students s ON lr.student_id = s.id 
                          WHERE s.department = ? AND lr.status = "pending"`,
    departmentRoomChanges: `SELECT COUNT(*) as count FROM room_change_requests rcr 
                           JOIN students s ON rcr.student_id = s.id 
                           WHERE s.department = ? AND rcr.status = "pending"`
  };
  
  const results = {};
  let completed = 0;
  const totalQueries = Object.keys(queries).length;
  
  Object.entries(queries).forEach(([key, query]) => {
    db.query(query, [department, department, department], (err, result) => {
      if (err) {
        console.error(`Error in ${key} query:`, err);
        results[key] = 0;
      } else {
        results[key] = result[0].count;
      }
      
      completed++;
      if (completed === totalQueries) {
        res.json({
          message: 'HOD dashboard data',
          department,
          statistics: results
        });
      }
    });
  });
});

// Warden dashboard
router.get('/warden', authenticateToken, authorizeRoles('warden'), (req, res) => {
  // Get hostel management statistics
  const queries = {
    totalHostels: 'SELECT COUNT(*) as count FROM hostels',
    totalRooms: 'SELECT COUNT(*) as count FROM rooms',
    totalBeds: 'SELECT COUNT(*) as count FROM beds',
    occupiedBeds: 'SELECT COUNT(*) as count FROM beds WHERE is_occupied = TRUE',
    pendingLeaveRequests: 'SELECT COUNT(*) as count FROM leave_requests WHERE status = "pending"',
    pendingRoomChanges: 'SELECT COUNT(*) as count FROM room_change_requests WHERE status = "pending"'
  };
  
  const results = {};
  let completed = 0;
  const totalQueries = Object.keys(queries).length;
  
  Object.entries(queries).forEach(([key, query]) => {
    db.query(query, (err, result) => {
      if (err) {
        console.error(`Error in ${key} query:`, err);
        results[key] = 0;
      } else {
        results[key] = result[0].count;
      }
      
      completed++;
      if (completed === totalQueries) {
        res.json({
          message: 'Warden dashboard data',
          statistics: results,
          occupancyRate: results.totalBeds > 0 ? 
            Math.round((results.occupiedBeds / results.totalBeds) * 100) : 0
        });
      }
    });
  });
});

export default router;
