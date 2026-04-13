import express from 'express';
import { db } from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { hashPassword } from '../utils/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const query = 'SELECT id, name, email, role, department, created_at FROM users';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get user by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  // Users can only view their own profile unless they're admin
  if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const query = 'SELECT id, name, email, role, department, created_at FROM users WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  });
});

// Update user
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, email, role, department } = req.body;
  
  // Users can only update their own profile unless they're admin
  if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Only admin can change role
  if (req.user.role !== 'admin' && role) {
    return res.status(403).json({ error: 'Only admin can change user role' });
  }

  const query = 'UPDATE users SET name = ?, email = ?, role = ?, department = ? WHERE id = ?';
  db.query(query, [name, email, role, department, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User updated successfully' });
  });
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM users WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// Change password
router.put('/:id/password', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;
  
  // Users can only change their own password
  if (req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  // Get current user
  const getUser = 'SELECT password FROM users WHERE id = ?';
  db.query(getUser, [id], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { comparePassword } = await import('../utils/auth.js');
    const isCurrentPasswordValid = await comparePassword(currentPassword, results[0].password);
    
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedNewPassword = await hashPassword(newPassword);
    const updatePassword = 'UPDATE users SET password = ? WHERE id = ?';
    
    db.query(updatePassword, [hashedNewPassword, id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Password updated successfully' });
    });
  });
});

export default router;
