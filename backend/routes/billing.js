import express from 'express';
import { db } from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all billing records (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const query = `
    SELECT b.*, s.name as student_name, s.roll_no, s.department,
           u.email as student_email
    FROM billing b
    JOIN students s ON b.student_id = s.id
    JOIN users u ON s.user_id = u.id
    ORDER BY b.created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get billing records for a specific student
router.get('/student/:studentId', authenticateToken, (req, res) => {
  const { studentId } = req.params;
  
  // First get student record to check permissions
  const getStudent = 'SELECT * FROM students WHERE id = ?';
  db.query(getStudent, [studentId], (err, studentResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (studentResults.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const student = studentResults[0];
    
    // Students can only view their own billing records
    if (req.user.role === 'student' && req.user.id !== student.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const query = `
      SELECT * FROM billing 
      WHERE student_id = ? 
      ORDER BY created_at DESC
    `;
    db.query(query, [studentId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results);
    });
  });
});

// Create new billing record (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { student_id, semester, amount } = req.body;
  
  if (!student_id || !semester || !amount) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if billing record already exists for this student and semester
  const checkQuery = 'SELECT * FROM billing WHERE student_id = ? AND semester = ?';
  db.query(checkQuery, [student_id, semester], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length > 0) {
      return res.status(400).json({ error: 'Billing record already exists for this student and semester' });
    }

    const query = 'INSERT INTO billing (student_id, semester, amount) VALUES (?, ?, ?)';
    db.query(query, [student_id, semester, amount], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({
        message: 'Billing record created successfully',
        billing: { id: result.insertId, student_id, semester, amount, status: 'unpaid' }
      });
    });
  });
});

// Update billing record (admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  const { semester, amount, status } = req.body;
  
  const query = 'UPDATE billing SET semester = ?, amount = ?, status = ? WHERE id = ?';
  db.query(query, [semester, amount, status, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Billing record not found' });
    }
    res.json({ message: 'Billing record updated successfully' });
  });
});

// Mark billing as paid (admin only)
router.put('/:id/pay', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  
  const query = 'UPDATE billing SET status = ? WHERE id = ?';
  db.query(query, ['paid', id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Billing record not found' });
    }
    res.json({ message: 'Billing marked as paid successfully' });
  });
});

// Mark billing as unpaid (admin only)
router.put('/:id/unpay', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  
  const query = 'UPDATE billing SET status = ? WHERE id = ?';
  db.query(query, ['unpaid', id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Billing record not found' });
    }
    res.json({ message: 'Billing marked as unpaid successfully' });
  });
});

// Delete billing record (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM billing WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Billing record not found' });
    }
    res.json({ message: 'Billing record deleted successfully' });
  });
});

// Get billing summary for a student
router.get('/student/:studentId/summary', authenticateToken, (req, res) => {
  const { studentId } = req.params;
  
  // Students can only view their own billing summary
  if (req.user.role !== 'admin' && req.user.id !== parseInt(studentId)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const query = `
    SELECT 
      COUNT(*) as total_records,
      SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid,
      SUM(CASE WHEN status = 'unpaid' THEN amount ELSE 0 END) as total_unpaid,
      SUM(amount) as total_amount
    FROM billing 
    WHERE student_id = ?
  `;
  db.query(query, [studentId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results[0]);
  });
});

// Get billing summary for all students (admin only)
router.get('/summary/all', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as total_records,
      SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid,
      SUM(CASE WHEN status = 'unpaid' THEN amount ELSE 0 END) as total_unpaid,
      SUM(amount) as total_amount
    FROM billing
  `;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results[0]);
  });
});

export default router;
