import express from 'express';
import { db } from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all room change requests (admin/warden only)
router.get('/', authenticateToken, authorizeRoles('admin', 'warden'), (req, res) => {
  const query = `
    SELECT rcr.*, s.name as student_name, s.roll_no, s.department,
           u.email as student_email,
           r.room_number as current_room_number, h.name as current_hostel_name,
           ar.room_number as assigned_room_number, ah.name as assigned_hostel_name
    FROM room_change_requests rcr
    JOIN students s ON rcr.student_id = s.id
    JOIN users u ON s.user_id = u.id
    LEFT JOIN beds b ON b.student_id = s.id
    LEFT JOIN rooms r ON b.room_id = r.id
    LEFT JOIN hostels h ON r.hostel_id = h.id
    LEFT JOIN rooms ar ON rcr.assigned_room_id = ar.id
    LEFT JOIN hostels ah ON ar.hostel_id = ah.id
    ORDER BY rcr.created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get room change requests for a specific student
router.get('/student/:studentId', authenticateToken, (req, res) => {
  const { studentId } = req.params;
  
  // Students can only view their own room change requests
  if (req.user.role !== 'admin' && req.user.role !== 'warden' && req.user.id !== parseInt(studentId)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const query = `
    SELECT rcr.*, r.room_number as current_room_number, h.name as current_hostel_name,
           ar.room_number as assigned_room_number, ah.name as assigned_hostel_name
    FROM room_change_requests rcr
    JOIN users u ON rcr.student_id = u.id
    LEFT JOIN beds b ON b.student_id = u.id
    LEFT JOIN rooms r ON b.room_id = r.id
    LEFT JOIN hostels h ON r.hostel_id = h.id
    LEFT JOIN rooms ar ON rcr.assigned_room_id = ar.id
    LEFT JOIN hostels ah ON ar.hostel_id = ah.id
    WHERE rcr.student_id = ?
    ORDER BY rcr.created_at DESC
  `;
  db.query(query, [studentId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Create new room change request (student only)
router.post('/', authenticateToken, authorizeRoles('student'), (req, res) => {
  const { preferred_department } = req.body;
  const user_id = req.user.id;
  
  if (!preferred_department) {
    return res.status(400).json({ error: 'Preferred department is required' });
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

    // Check if student already has a pending room change request
    const checkQuery = 'SELECT * FROM room_change_requests WHERE student_id = ? AND status = "pending"';
    db.query(checkQuery, [student_id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (results.length > 0) {
        return res.status(400).json({ error: 'You already have a pending room change request' });
      }

      const query = 'INSERT INTO room_change_requests (student_id, preferred_department) VALUES (?, ?)';
      db.query(query, [student_id, preferred_department], (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({
          message: 'Room change request submitted successfully',
          roomChangeRequest: { id: result.insertId, student_id, preferred_department, status: 'pending' }
        });
      });
    });
  });
});

// Approve room change request (admin/warden only)
router.put('/:id/approve', authenticateToken, authorizeRoles('admin', 'warden'), (req, res) => {
  const { id } = req.params;
  const { assigned_room_id } = req.body;
  
  if (!assigned_room_id) {
    return res.status(400).json({ error: 'Assigned room ID is required' });
  }

  // Get the room change request to find the student
  const getRequest = 'SELECT * FROM room_change_requests WHERE id = ?';
  db.query(getRequest, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Room change request not found' });
    }

    const request = results[0];
    
    // Check if the assigned room has available beds
    const checkBeds = 'SELECT COUNT(*) as occupied FROM beds WHERE room_id = ? AND is_occupied = TRUE';
    db.query(checkBeds, [assigned_room_id], (err, bedResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Get room capacity
      const getRoomCapacity = 'SELECT capacity FROM rooms WHERE id = ?';
      db.query(getRoomCapacity, [assigned_room_id], (err, roomResults) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (roomResults.length === 0) {
          return res.status(404).json({ error: 'Room not found' });
        }

        const capacity = roomResults[0].capacity;
        const occupied = bedResults[0].occupied;
        
        if (occupied >= capacity) {
          return res.status(400).json({ error: 'No available beds in the assigned room' });
        }

        // Find an available bed
        const findBed = 'SELECT id FROM beds WHERE room_id = ? AND is_occupied = FALSE LIMIT 1';
        db.query(findBed, [assigned_room_id], (err, bedResults) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          if (bedResults.length === 0) {
            return res.status(400).json({ error: 'No available beds found' });
          }

          const bedId = bedResults[0].id;
          
          // Deallocate student's current bed
          const deallocateCurrent = 'UPDATE beds SET is_occupied = FALSE, student_id = NULL WHERE student_id = ?';
          db.query(deallocateCurrent, [request.student_id], (err) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }

            // Allocate new bed
            const allocateNew = 'UPDATE beds SET is_occupied = TRUE, student_id = ? WHERE id = ?';
            db.query(allocateNew, [request.student_id, bedId], (err) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' });
              }

              // Update room change request
              const updateRequest = 'UPDATE room_change_requests SET status = ?, assigned_room_id = ? WHERE id = ?';
              db.query(updateRequest, ['approved', assigned_room_id, id], (err) => {
                if (err) {
                  return res.status(500).json({ error: 'Database error' });
                }
                res.json({ message: 'Room change request approved and bed allocated successfully' });
              });
            });
          });
        });
      });
    });
  });
});

// Reject room change request (admin/warden only)
router.put('/:id/reject', authenticateToken, authorizeRoles('admin', 'warden'), (req, res) => {
  const { id } = req.params;
  
  const query = 'UPDATE room_change_requests SET status = ? WHERE id = ?';
  db.query(query, ['rejected', id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Room change request not found' });
    }
    res.json({ message: 'Room change request rejected successfully' });
  });
});

// Delete room change request (student can delete their own pending requests)
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  // First check if the request exists and belongs to the user
  const checkQuery = 'SELECT * FROM room_change_requests WHERE id = ?';
  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Room change request not found' });
    }
    
    const request = results[0];
    
    // Only admin/warden can delete any request, students can only delete their own pending requests
    if (req.user.role === 'student' && (request.student_id !== req.user.id || request.status !== 'pending')) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const deleteQuery = 'DELETE FROM room_change_requests WHERE id = ?';
    db.query(deleteQuery, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Room change request deleted successfully' });
    });
  });
});

export default router;
