import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

console.log("Attempting to connect to MySQL...");
console.log("Host:", process.env.DB_HOST);
console.log("User:", process.env.DB_USER);
console.log("Database:", process.env.DB_NAME);

// Create connection WITHOUT database first
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Connect
db.connect((err) => {
  if (err) {
    console.error("DB Connection Failed:", err);
    return;
  }
  console.log("MySQL Connected Successfully!");

  // Create DB if not exists
  db.query(
    `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`,
    (err, result) => {
      if (err) {
        console.error("Error creating database:", err);
        return;
      }

      console.log("Database created/verified successfully!");

      // Switch to DB
      db.changeUser({ database: process.env.DB_NAME }, (err) => {
        if (err) {
          console.error("Error switching to database:", err);
          return;
        }

        console.log("Now using database:", process.env.DB_NAME);

        // Create tables one by one with feedback
        createTablesWithFeedback();
      });
    }
  );
});

function createTablesWithFeedback() {
  const tables = [
    {
      name: 'users',
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100),
          email VARCHAR(100) UNIQUE,
          password VARCHAR(255),
          role ENUM('admin', 'hod', 'warden', 'student'),
          department VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
    },
    {
      name: 'students',
      sql: `
        CREATE TABLE IF NOT EXISTS students (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT UNIQUE,
          roll_no VARCHAR(20) UNIQUE,
          name VARCHAR(100),
          dob DATE,
          department VARCHAR(100),
          father_name VARCHAR(100),
          mother_name VARCHAR(100),
          father_phone VARCHAR(20),
          mother_phone VARCHAR(20),
          house_address TEXT,
          student_email VARCHAR(100),
          father_email VARCHAR(100),
          mother_email VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `
    },
    {
      name: 'hostels',
      sql: `
        CREATE TABLE IF NOT EXISTS hostels (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100),
          type ENUM('boys', 'girls'),
          block VARCHAR(10),
          year_category ENUM('1st_year', '2nd_year', '3rd_year', '4th_year', 'all_years'),
          total_rooms INT DEFAULT 0,
          total_beds INT DEFAULT 0,
          available_beds INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `
    },
    {
      name: 'rooms',
      sql: `
        CREATE TABLE IF NOT EXISTS rooms (
          id INT AUTO_INCREMENT PRIMARY KEY,
          hostel_id INT,
          room_number VARCHAR(10),
          capacity INT,
          FOREIGN KEY (hostel_id) REFERENCES hostels(id)
        )
      `
    },
    {
      name: 'beds',
      sql: `
        CREATE TABLE IF NOT EXISTS beds (
          id INT AUTO_INCREMENT PRIMARY KEY,
          room_id INT,
          bed_number INT,
          is_occupied BOOLEAN DEFAULT FALSE,
          student_id INT,
          FOREIGN KEY (room_id) REFERENCES rooms(id),
          FOREIGN KEY (student_id) REFERENCES students(id)
        )
      `
    },
    {
      name: 'leave_requests',
      sql: `
        CREATE TABLE IF NOT EXISTS leave_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          student_id INT,
          from_date DATE,
          to_date DATE,
          reason TEXT,
          status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
          approved_by INT,
          FOREIGN KEY (student_id) REFERENCES students(id),
          FOREIGN KEY (approved_by) REFERENCES users(id)
        )
      `
    },
    {
      name: 'room_change_requests',
      sql: `
        CREATE TABLE IF NOT EXISTS room_change_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          student_id INT,
          preferred_department VARCHAR(100),
          status ENUM('pending', 'approved', 'rejected'),
          assigned_room_id INT,
          FOREIGN KEY (student_id) REFERENCES students(id),
          FOREIGN KEY (assigned_room_id) REFERENCES rooms(id)
        )
      `
    },
    {
      name: 'billing',
      sql: `
        CREATE TABLE IF NOT EXISTS billing (
          id INT AUTO_INCREMENT PRIMARY KEY,
          student_id INT,
          semester VARCHAR(20),
          amount DECIMAL(10,2),
          status ENUM('paid', 'unpaid') DEFAULT 'unpaid',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES students(id)
        )
      `
    }
  ];

  let tableIndex = 0;

  function createNextTable() {
    if (tableIndex < tables.length) {
      const table = tables[tableIndex];
      
      db.query(table.sql, (err, result) => {
        if (err) {
          console.error(`Error creating table ${table.name}:`, err);
        } else {
          console.log(`Table '${table.name}' created successfully!`);
        }
        
        tableIndex++;
        createNextTable();
      });
    } else {
      console.log("\nAll tables created! Verifying...");
      
      // Verify tables were created
      db.query("SHOW TABLES", (err, results) => {
        if (err) {
          console.error("Error showing tables:", err);
        } else {
          console.log("\nTables in database:");
          results.forEach(row => {
            console.log("- " + Object.values(row)[0]);
          });
        }
        
        db.end();
      });
    }
  }

  createNextTable();
}
