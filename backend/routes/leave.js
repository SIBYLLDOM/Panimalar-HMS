import express from 'express';
import { db } from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all leave requests (admin/warden only)
router.get('/', authenticateToken, authorizeRoles('admin', 'warden'), (req, res) => {
  const query = `
    SELECT lr.*, s.name as student_name, s.roll_no, s.department,
           u.email as student_email, a.name as approved_by_name
    FROM leave_requests lr
    JOIN students s ON lr.student_id = s.id
    JOIN users u ON s.user_id = u.id
    LEFT JOIN users a ON lr.approved_by = a.id
    ORDER BY lr.created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get leave requests for a specific student
router.get('/student/:studentId', authenticateToken, (req, res) => {
  const { studentId } = req.params;
  
  // First get the student record to check permissions
  const getStudent = 'SELECT * FROM students WHERE id = ?';
  db.query(getStudent, [studentId], (err, studentResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (studentResults.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const student = studentResults[0];
    
    // Students can only view their own leave requests
    if (req.user.role === 'student' && req.user.id !== student.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const query = `
      SELECT lr.*, u.name as approved_by_name
      FROM leave_requests lr
      LEFT JOIN users u ON lr.approved_by = u.id
      WHERE lr.student_id = ?
      ORDER BY lr.created_at DESC
    `;
    db.query(query, [studentId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results);
    });
  });
});

// Create new leave request (student only)
router.post('/', authenticateToken, authorizeRoles('student'), (req, res) => {
  const { from_date, to_date, reason } = req.body;
  const user_id = req.user.id;
  
  if (!from_date || !to_date || !reason) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Get student record from user_id
  const getStudent = 'SELECT id FROM students WHERE user_id = ?';
  db.query(getStudent, [user_id], (err, studentResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (studentResults.length === 0) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    
    const student_id = studentResults[0].id;

    const query = 'INSERT INTO leave_requests (student_id, from_date, to_date, reason) VALUES (?, ?, ?, ?)';
    db.query(query, [student_id, from_date, to_date, reason], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({
        message: 'Leave request submitted successfully',
        leaveRequest: { id: result.insertId, student_id, from_date, to_date, reason, status: 'pending' }
      });
    });
  });
});

// Approve leave request (admin/warden only)
router.put('/:id/approve', authenticateToken, authorizeRoles('admin', 'warden'), (req, res) => {
  const { id } = req.params;
  const approved_by = req.user.id;
  
  const query = 'UPDATE leave_requests SET status = ?, approved_by = ? WHERE id = ?';
  db.query(query, ['approved', approved_by, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    res.json({ message: 'Leave request approved successfully' });
  });
});

// Reject leave request (admin/warden only)
router.put('/:id/reject', authenticateToken, authorizeRoles('admin', 'warden'), (req, res) => {
  const { id } = req.params;
  const approved_by = req.user.id;
  
  const query = 'UPDATE leave_requests SET status = ?, approved_by = ? WHERE id = ?';
  db.query(query, ['rejected', approved_by, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    res.json({ message: 'Leave request rejected successfully' });
  });
});

// Delete leave request (student can delete their own pending requests)
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  // First check if the request exists and belongs to the user
  const checkQuery = 'SELECT * FROM leave_requests WHERE id = ?';
  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    
    const leaveRequest = results[0];
    
    // Only admin/warden can delete any request, students can only delete their own pending requests
    if (req.user.role === 'student' && (leaveRequest.student_id !== req.user.id || leaveRequest.status !== 'pending')) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const deleteQuery = 'DELETE FROM leave_requests WHERE id = ?';
    db.query(deleteQuery, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Leave request deleted successfully' });
    });
  });
});

export default router;
