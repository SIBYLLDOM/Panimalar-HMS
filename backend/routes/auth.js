import express from 'express';
import { db } from '../config/db.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Check if user already exists
    const checkUser = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUser, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Insert new user
      const insertUser = 'INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)';
      db.query(insertUser, [name, email, hashedPassword, role, department], (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Error creating user' });
        }

        const token = generateToken({ id: result.insertId, email, role });
        res.status(201).json({
          message: 'User created successfully',
          token,
          user: { id: result.insertId, name, email, role, department }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Register a student with detailed information
router.post('/register-student', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      department,
      roll_no,
      dob,
      father_name,
      mother_name,
      father_phone,
      mother_phone,
      house_address,
      student_email,
      father_email,
      mother_email
    } = req.body;

    if (!name || !email || !password || !department || !roll_no || !dob) {
      return res.status(400).json({ error: 'Required fields: name, email, password, department, roll_no, dob' });
    }

    // Check if user already exists
    const checkUser = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUser, [email], async (err, userResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (userResults.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Check if roll number already exists
      const checkRollNo = 'SELECT * FROM students WHERE roll_no = ?';
      db.query(checkRollNo, [roll_no], (err, rollResults) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (rollResults.length > 0) {
          return res.status(400).json({ error: 'Roll number already exists' });
        }

        // Hash password
        hashPassword(password).then(hashedPassword => {
          // Start transaction
          db.beginTransaction((err) => {
            if (err) {
              return res.status(500).json({ error: 'Transaction error' });
            }

            // Insert user
            const insertUser = 'INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)';
            db.query(insertUser, [name, email, hashedPassword, 'student', department], (err, userResult) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ error: 'Error creating user' });
                });
              }

              const userId = userResult.insertId;

              // Insert student details
              const insertStudent = `
                INSERT INTO students (
                  user_id, roll_no, name, dob, department, father_name, mother_name,
                  father_phone, mother_phone, house_address, student_email, father_email, mother_email
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;
              
              db.query(insertStudent, [
                userId, roll_no, name, dob, department, father_name, mother_name,
                father_phone, mother_phone, house_address, student_email, father_email, mother_email
              ], (err, studentResult) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json({ error: 'Error creating student profile' });
                  });
                }

                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => {
                      res.status(500).json({ error: 'Transaction commit error' });
                    });
                  }

                  const token = generateToken({ id: userId, email, role: 'student' });
                  res.status(201).json({
                    message: 'Student registered successfully',
                    token,
                    user: { 
                      id: userId, 
                      name, 
                      email, 
                      role: 'student', 
                      department,
                      student_id: studentResult.insertId
                    }
                  });
                });
              });
            });
          });
        }).catch(error => {
          res.status(500).json({ error: 'Password hashing error' });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Student login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const getUser = 'SELECT u.*, s.id as student_id, s.roll_no FROM users u LEFT JOIN students s ON u.id = s.user_id WHERE u.email = ? AND u.role = ?';
    db.query(getUser, [email, 'student'], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid student credentials' });
      }

      const user = results[0];
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid student credentials' });
      }

      const token = generateToken({ id: user.id, email: user.email, role: user.role });
      res.json({
        message: 'Student login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          student_id: user.student_id,
          roll_no: user.roll_no
        },
        redirect: '/student'
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Faculty login (admin, HOD, warden)
router.post('/faculty/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const getUser = 'SELECT * FROM users WHERE email = ? AND role IN (?, ?, ?)';
    db.query(getUser, [email, 'admin', 'hod', 'warden'], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid faculty credentials' });
      }

      const user = results[0];
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid faculty credentials' });
      }

      const token = generateToken({ id: user.id, email: user.email, role: user.role });
      res.json({
        message: 'Faculty login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        },
        redirect: `/${user.role}`
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
