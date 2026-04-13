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
  const { name, type, block, year_category } = req.body;
  
  if (!name || !type || !block || !year_category) {
    return res.status(400).json({ error: 'Name, type, block, and year category are required' });
  }

  const query = 'INSERT INTO hostels (name, type, block, year_category) VALUES (?, ?, ?, ?)';
  db.query(query, [name, type, block, year_category], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({
      message: 'Hostel created successfully',
      hostel: { id: result.insertId, name, type, block, year_category, total_rooms: 0, total_beds: 0, available_beds: 0 }
    });
  });
});

// Update hostel (admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  const { name, type, block, year_category } = req.body;
  
  const query = 'UPDATE hostels SET name = ?, type = ?, block = ?, year_category = ? WHERE id = ?';
  db.query(query, [name, type, block, year_category, id], (err, result) => {
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

// Create rooms for a hostel (admin only)
router.post('/:id/rooms', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  const { room_number, capacity } = req.body;
  
  if (!room_number || !capacity) {
    return res.status(400).json({ error: 'Room number and capacity are required' });
  }

  const query = 'INSERT INTO rooms (hostel_id, room_number, capacity) VALUES (?, ?, ?)';
  db.query(query, [id, room_number, capacity], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Update hostel room count
    const updateRoomCount = 'UPDATE hostels SET total_rooms = total_rooms + 1 WHERE id = ?';
    db.query(updateRoomCount, [id], (updateErr) => {
      if (updateErr) {
        console.error('Error updating room count:', updateErr);
      }
    });

    res.status(201).json({
      message: 'Room created successfully',
      room: { id: result.insertId, hostel_id: id, room_number, capacity }
    });
  });
});

// Create beds for a room (admin only)
router.post('/rooms/:roomId/beds', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { roomId } = req.params;
  const { number_of_beds } = req.body;
  
  if (!number_of_beds || number_of_beds <= 0) {
    return res.status(400).json({ error: 'Number of beds is required and must be greater than 0' });
  }

  // Get room info to get hostel_id
  const getRoom = 'SELECT hostel_id FROM rooms WHERE id = ?';
  db.query(getRoom, [roomId], (err, roomResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (roomResults.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const hostel_id = roomResults[0].hostel_id;
    const bedPromises = [];
    
    // Create multiple beds
    for (let i = 1; i <= number_of_beds; i++) {
      const createBed = new Promise((resolve, reject) => {
        const query = 'INSERT INTO beds (room_id, bed_number) VALUES (?, ?)';
        db.query(query, [roomId, i], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      bedPromises.push(createBed);
    }

    Promise.all(bedPromises)
      .then(() => {
        // Update hostel bed counts
        const updateBedCount = 'UPDATE hostels SET total_beds = total_beds + ?, available_beds = available_beds + ? WHERE id = ?';
        db.query(updateBedCount, [number_of_beds, number_of_beds, hostel_id], (updateErr) => {
          if (updateErr) {
            console.error('Error updating bed count:', updateErr);
          }
        });

        res.status(201).json({
          message: `${number_of_beds} beds created successfully`,
          beds_created: number_of_beds
        });
      })
      .catch((error) => {
        res.status(500).json({ error: 'Error creating beds' });
      });
  });
});

// Get hostel statistics
router.get('/:id/stats', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      h.*,
      COUNT(DISTINCT r.id) as actual_rooms,
      COUNT(b.id) as actual_beds,
      COUNT(CASE WHEN b.is_occupied = TRUE THEN 1 END) as occupied_beds
    FROM hostels h
    LEFT JOIN rooms r ON h.id = r.hostel_id
    LEFT JOIN beds b ON r.id = b.room_id
    WHERE h.id = ?
    GROUP BY h.id
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    
    const hostel = results[0];
    hostel.occupancy_rate = hostel.actual_beds > 0 ? 
      Math.round((hostel.occupied_beds / hostel.actual_beds) * 100) : 0;
    
    res.json(hostel);
  });
});

export default router;
