import { hashPassword } from './utils/auth.js';
import { db } from './config/db.js';

const createHOD = async () => {
  try {
    const hashedPassword = await hashPassword('hod123');
    
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkQuery, ['hod@panimalarhms.com'], async (err, results) => {
      if (err) {
        console.error('Error checking HOD:', err);
        process.exit(1);
      }

      if (results.length === 0) {
        const insertQuery = `INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)`;
        db.query(insertQuery, ['HOD User', 'hod@panimalarhms.com', hashedPassword, 'hod', 'Computer Science'], (err, result) => {
          if (err) {
            console.error('Error creating HOD:', err);
            process.exit(1);
          }
          
          console.log('✅ HOD user created successfully!');
          console.log('📧 Email: hod@panimalarhms.com');
          console.log('🔑 Password: hod123');
          console.log('🌐 Login at: http://localhost:5000/api/auth/faculty/login');
          process.exit(0);
        });
      } else {
        console.log('ℹ️ HOD user already exists');
        console.log('📧 Email: hod@panimalarhms.com');
        console.log('🔑 Password: hod123');
        process.exit(0);
      }
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

setTimeout(() => {
  createHOD();
}, 2000);
