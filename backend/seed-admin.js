import { db } from './config/db.js';
import { hashPassword } from './utils/auth.js';

const createSuperAdmin = async () => {
  try {
    // Check if super admin already exists
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkQuery, ['admin@panimalarhms.com'], async (err, results) => {
      if (err) {
        console.error('Error checking super admin:', err);
        process.exit(1);
      }

      if (results.length === 0) {
        // Create super admin user
        const hashedPassword = await hashPassword('admin123');
        
        const insertQuery = `
          INSERT INTO users (name, email, password, role, department) 
          VALUES (?, ?, ?, ?, ?)
        `;
        
        db.query(insertQuery, ['Super Admin', 'admin@panimalarhms.com', hashedPassword, 'admin', 'Administration'], (err, result) => {
          if (err) {
            console.error('Error creating super admin:', err);
            process.exit(1);
          }
          
          console.log('✅ Super admin user created successfully!');
          console.log('📧 Email: admin@panimalarhms.com');
          console.log('🔑 Password: admin123');
          console.log('🌐 Login at: http://localhost:5000/api/auth/faculty/login');
          console.log('');
          console.log('⚠️  Please change the password after first login!');
          process.exit(0);
        });
      } else {
        console.log('ℹ️  Super admin user already exists');
        console.log('📧 Email: admin@panimalarhms.com');
        console.log('🔑 Password: admin123');
        console.log('🌐 Login at: http://localhost:5000/api/auth/faculty/login');
        process.exit(0);
      }
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// Wait for database connection then create admin
setTimeout(() => {
  createSuperAdmin();
}, 2000);
