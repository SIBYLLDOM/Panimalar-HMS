USE panimalar_hostel_management;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('admin', 'hod', 'warden', 'student'),
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- STUDENTS
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
);

-- HOSTELS
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
);

-- ROOMS
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hostel_id INT,
  room_number VARCHAR(10),
  capacity INT,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id)
);

-- BEDS
CREATE TABLE IF NOT EXISTS beds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT,
  bed_number INT,
  is_occupied BOOLEAN DEFAULT FALSE,
  student_id INT,
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- LEAVE REQUESTS
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
);

-- ROOM CHANGE
CREATE TABLE IF NOT EXISTS room_change_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  preferred_department VARCHAR(100),
  status ENUM('pending', 'approved', 'rejected'),
  assigned_room_id INT,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (assigned_room_id) REFERENCES rooms(id)
);

-- BILLING
CREATE TABLE IF NOT EXISTS billing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  semester VARCHAR(20),
  amount DECIMAL(10,2),
  status ENUM('paid', 'unpaid') DEFAULT 'unpaid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);
