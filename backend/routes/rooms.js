import express from 'express';
import { db } from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all rooms
router.get('/', authenticateToken, (req, res) => {
  const query = `
    SELECT r.*, h.name as hostel_name, h.type as hostel_type, h.block
    FROM rooms r
    JOIN hostels h ON r.hostel_id = h.id
  `;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get room by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT r.*, h.name as hostel_name, h.type as hostel_type, h.block
    FROM rooms r
    JOIN hostels h ON r.hostel_id = h.id
    WHERE r.id = ?
  `;
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(results[0]);
  });
});

// Create new room (admin/warden only)
router.post('/', authenticateToken, authorizeRoles('admin', 'warden'), (req, res) => {
  const { hostel_id, room_number, capacity } = req.body;
  
  if (!hostel_id || !room_number || !capacity) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = 'INSERT INTO rooms (hostel_id, room_number, capacity) VALUES (?, ?, ?)';
  db.query(query, [hostel_id, room_number, capacity], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({
      message: 'Room created successfully',
      room: { id: result.insertId, hostel_id, room_number, capacity }
    });
  });
});

// Update room (admin/warden only)
router.put('/:id', authenticateToken, authorizeRoles('admin', 'warden'), (req, res) => {
  const { id } = req.params;
  const { hostel_id, room_number, capacity } = req.body;
  
  const query = 'UPDATE rooms SET hostel_id = ?, room_number = ?, capacity = ? WHERE id = ?';
  db.query(query, [hostel_id, room_number, capacity, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ message: 'Room updated successfully' });
  });
});

// Delete room (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM rooms WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ message: 'Room deleted successfully' });
  });
});

// Get beds in a room
router.get('/:id/beds', authenticateToken, (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT b.*, s.name as student_name, s.roll_no,
           u.email as student_email
    FROM beds b
    LEFT JOIN students s ON b.student_id = s.id
    LEFT JOIN users u ON s.user_id = u.id
    WHERE b.room_id = ?
    ORDER BY b.bed_number
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Add bed to room (admin/warden only)
router.post('/:id/beds', authenticateToken, authorizeRoles('admin', 'warden'), (req, res) => {
  const { id } = req.params;
  const { bed_number } = req.body;
  
  if (!bed_number) {
    return res.status(400).json({ error: 'Bed number is required' });
  }

  const query = 'INSERT INTO beds (room_id, bed_number) VALUES (?, ?)';
  db.query(query, [id, bed_number], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({
      message: 'Bed added successfully',
      bed: { id: result.insertId, room_id: id, bed_number, is_occupied: false }
    });
  });
});

// Allocate bed to student (admin/warden only)
router.put('/beds/:bedId/allocate', authenticateToken, authorizeRoles('admin', 'warden'), (req, res) => {
  const { bedId } = req.params;
  const { student_id } = req.body;
  
  if (!student_id) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  // Check if bed is already occupied
  const checkBed = 'SELECT * FROM beds WHERE id = ?';
  db.query(checkBed, [bedId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Bed not found' });
    }
    if (results[0].is_occupied) {
      return res.status(400).json({ error: 'Bed is already occupied' });
    }

    const query = 'UPDATE beds SET is_occupied = TRUE, student_id = ? WHERE id = ?';
    db.query(query, [student_id, bedId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Bed allocated successfully' });
    });
  });
});

// Deallocate bed (admin/warden only)
router.put('/beds/:bedId/deallocate', authenticateToken, authorizeRoles('admin', 'warden'), (req, res) => {
  const { bedId } = req.params;
  
  const query = 'UPDATE beds SET is_occupied = FALSE, student_id = NULL WHERE id = ?';
  db.query(query, [bedId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Bed not found' });
    }
    res.json({ message: 'Bed deallocated successfully' });
  });
});

export default router;
