import express from 'express';
import { db } from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all students (admin/warden/hod only)
router.get('/', authenticateToken, authorizeRoles('admin', 'warden', 'hod'), (req, res) => {
  const query = `
    SELECT s.*, u.email as user_email, u.role
    FROM students s
    JOIN users u ON s.user_id = u.id
    ORDER BY s.roll_no
  `;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get student by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT s.*, u.email as user_email, u.role
    FROM students s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ?
  `;
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Check if user has permission to view this student
    const student = results[0];
    if (req.user.role === 'student' && req.user.id !== student.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(student);
  });
});

// Get student by user ID
router.get('/user/:userId', authenticateToken, (req, res) => {
  const { userId } = req.params;
  
  // Students can only view their own profile
  if (req.user.role === 'student' && req.user.id !== parseInt(userId)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const query = `
    SELECT s.*, u.email as user_email, u.role
    FROM students s
    JOIN users u ON s.user_id = u.id
    WHERE s.user_id = ?
  `;
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(results[0]);
  });
});

// Create new student profile (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { 
    user_id, 
    roll_no, 
    name, 
    dob, 
    department, 
    father_name, 
    mother_name, 
    father_phone, 
    mother_phone, 
    house_address, 
    student_email, 
    father_email, 
    mother_email 
  } = req.body;
  
  if (!user_id || !roll_no || !name || !dob || !department) {
    return res.status(400).json({ error: 'Required fields: user_id, roll_no, name, dob, department' });
  }

  // Check if user exists and is a student
  const checkUser = 'SELECT * FROM users WHERE id = ? AND role = ?';
  db.query(checkUser, [user_id, 'student'], (err, userResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (userResults.length === 0) {
      return res.status(400).json({ error: 'User not found or is not a student' });
    }

    // Check if student profile already exists
    const checkStudent = 'SELECT * FROM students WHERE user_id = ? OR roll_no = ?';
    db.query(checkStudent, [user_id, roll_no], (err, studentResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (studentResults.length > 0) {
        return res.status(400).json({ error: 'Student profile already exists for this user or roll number' });
      }

      const query = `
        INSERT INTO students (
          user_id, roll_no, name, dob, department, father_name, mother_name, 
          father_phone, mother_phone, house_address, student_email, father_email, mother_email
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.query(query, [
        user_id, roll_no, name, dob, department, father_name, mother_name,
        father_phone, mother_phone, house_address, student_email, father_email, mother_email
      ], (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({
          message: 'Student profile created successfully',
          student: { 
            id: result.insertId, 
            user_id, roll_no, name, dob, department, father_name, mother_name,
            father_phone, mother_phone, house_address, student_email, father_email, mother_email
          }
        });
      });
    });
  });
});

// Update student information
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { 
    roll_no, 
    name, 
    dob, 
    department, 
    father_name, 
    mother_name, 
    father_phone, 
    mother_phone, 
    house_address, 
    student_email, 
    father_email, 
    mother_email 
  } = req.body;
  
  // First get the student to check permissions
  const getStudent = 'SELECT * FROM students WHERE id = ?';
  db.query(getStudent, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const student = results[0];
    
    // Check permissions: students can only update their own profile, others can update any
    if (req.user.role === 'student' && req.user.id !== student.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const query = `
      UPDATE students SET 
        roll_no = ?, name = ?, dob = ?, department = ?, father_name = ?, mother_name = ?,
        father_phone = ?, mother_phone = ?, house_address = ?, student_email = ?, 
        father_email = ?, mother_email = ?
      WHERE id = ?
    `;
    
    db.query(query, [
      roll_no, name, dob, department, father_name, mother_name,
      father_phone, mother_phone, house_address, student_email, 
      father_email, mother_email, id
    ], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.json({ message: 'Student information updated successfully' });
    });
  });
});

// Delete student (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM students WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  });
});

// Get students by department
router.get('/department/:department', authenticateToken, authorizeRoles('admin', 'warden', 'hod'), (req, res) => {
  const { department } = req.params;
  
  const query = `
    SELECT s.*, u.email as user_email
    FROM students s
    JOIN users u ON s.user_id = u.id
    WHERE s.department = ?
    ORDER BY s.roll_no
  `;
  db.query(query, [department], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

export default router;
