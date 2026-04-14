import mysql from "mysql2";
import dotenv from "dotenv";
import bcrypt from 'bcryptjs';

dotenv.config();

// Test database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
  
  console.log("✅ Connected to database successfully!");
  console.log("📊 Database:", process.env.DB_NAME);
  
  // Generate hashed password for HOD
  const password = 'hod123';
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error("❌ Error hashing password:", err);
      db.end();
      process.exit(1);
    }
    
    console.log("\n🔐 HOD Credentials:");
    console.log("Password:", password);
    console.log("Hashed Password:", hash);
    
    console.log("\n📝 SQL Insert Query:");
    console.log("```sql");
    console.log(`INSERT INTO users (name, email, password, role, department) 
VALUES ('HOD User', 'hod@panimalarhms.com', '${hash}', 'hod', 'Computer Science');`);
    console.log("```");
    
    db.end();
  });
});
