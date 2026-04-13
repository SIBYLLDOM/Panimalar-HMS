import express from 'express';
import { db } from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all hostels
router.get('/', authenticateToken, (req, res) => {
  const query = 'SELECT * FROM hostels';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get hostel by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM hostels WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    res.json(results[0]);
  });
});

// Create new hostel (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { name, type, block } = req.body;
  
  if (!name || !type) {
    return res.status(400).json({ error: 'Name and type are required' });
  }

  const query = 'INSERT INTO hostels (name, type, block) VALUES (?, ?, ?)';
  db.query(query, [name, type, block], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({
      message: 'Hostel created successfully',
      hostel: { id: result.insertId, name, type, block }
    });
  });
});

// Update hostel (admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  const { name, type, block } = req.body;
  
  const query = 'UPDATE hostels SET name = ?, type = ?, block = ? WHERE id = ?';
  db.query(query, [name, type, block, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    res.json({ message: 'Hostel updated successfully' });
  });
});

// Delete hostel (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM hostels WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    res.json({ message: 'Hostel deleted successfully' });
  });
});

// Get hostel with rooms and beds
router.get('/:id/rooms', authenticateToken, (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT r.*, b.id as bed_id, b.bed_number, b.is_occupied, b.student_id,
           u.name as student_name, u.email as student_email
    FROM rooms r
    LEFT JOIN beds b ON r.id = b.room_id
    LEFT JOIN users u ON b.student_id = u.id
    WHERE r.hostel_id = ?
    ORDER BY r.room_number, b.bed_number
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Group results by room
    const rooms = {};
    results.forEach(row => {
      if (!rooms[row.id]) {
        rooms[row.id] = {
          id: row.id,
          hostel_id: row.hostel_id,
          room_number: row.room_number,
          capacity: row.capacity,
          beds: []
        };
      }
      
      if (row.bed_id) {
        rooms[row.id].beds.push({
          id: row.bed_id,
          bed_number: row.bed_number,
          is_occupied: row.is_occupied,
          student_id: row.student_id,
          student_name: row.student_name,
          student_email: row.student_email
        });
      }
    });
    
    res.json(Object.values(rooms));
  });
});

export default router;
