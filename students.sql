-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 14, 2026 at 08:58 AM
-- Server version: 8.4.7
-- PHP Version: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `panimalar_hostel_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
CREATE TABLE IF NOT EXISTS `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `roll_no` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reg_no` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `father_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mother_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `father_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mother_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `house_address` text COLLATE utf8mb4_unicode_ci,
  `student_email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `father_email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mother_email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roll_no` (`roll_no`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `roll_no`, `reg_no`, `name`, `dob`, `department`, `father_name`, `mother_name`, `father_phone`, `mother_phone`, `house_address`, `student_email`, `father_email`, `mother_email`, `created_at`) VALUES
(2, '2023PECCS495', '211423104631', 'Arun Kumar', '2005-03-12', 'CSE', 'Ravi Kumar', 'Lakshmi Ravi', '9876543210', '9876543211', 'Chennai, Tamil Nadu', 'arun@gmail.com', 'ravi@gmail.com', 'lakshmi@gmail.com', '2026-04-14 08:43:51'),
(3, '2023PECCS496', '211423104632', 'Vishal R', '2005-07-25', 'CSE', 'Ramesh R', 'Sita R', '9876543212', '9876543213', 'Coimbatore, Tamil Nadu', 'vishal@gmail.com', 'ramesh@gmail.com', 'sita@gmail.com', '2026-04-14 08:43:51'),
(4, '2023PECCS497', '211423104633', 'Karthik S', '2004-11-02', 'IT', 'Suresh S', 'Meena S', '9876543214', '9876543215', 'Madurai, Tamil Nadu', 'karthik@gmail.com', 'suresh@gmail.com', 'meena@gmail.com', '2026-04-14 08:43:51'),
(5, '2023PECCS498', '211423104634', 'Rahul M', '2005-01-19', 'ECE', 'Manoj M', 'Priya M', '9876543216', '9876543217', 'Salem, Tamil Nadu', 'rahul@gmail.com', 'manoj@gmail.com', 'priya@gmail.com', '2026-04-14 08:43:51'),
(6, '2023PECCS499', '211423104635', 'Deepak P', '2004-09-14', 'EEE', 'Prakash P', 'Anita P', '9876543218', '9876543219', 'Trichy, Tamil Nadu', 'deepak@gmail.com', 'prakash@gmail.com', 'anita@gmail.com', '2026-04-14 08:43:51'),
(9, '2023PECS550', '211423104686', 'Aakash R', '2005-01-12', 'CSE', 'Ramesh R', 'Latha R', '9876600001', '9876600002', 'Chennai', 'aakash@gmail.com', 'ramesh@gmail.com', 'latha@gmail.com', '2026-04-14 08:56:10'),
(10, '2023PECS551', '211423104687', 'Bhuvan K', '2004-07-19', 'IT', 'Kumar K', 'Revathi K', '9876600003', '9876600004', 'Coimbatore', 'bhuvan@gmail.com', 'kumar@gmail.com', 'revathi@gmail.com', '2026-04-14 08:56:10'),
(11, '2023PECS552', '211423104688', 'Chandru S', '2005-03-08', 'ECE', 'Selvam S', 'Kala S', '9876600005', '9876600006', 'Madurai', 'chandru@gmail.com', 'selvam@gmail.com', 'kala@gmail.com', '2026-04-14 08:56:10'),
(12, '2023PECS553', '211423104689', 'Dinesh P', '2004-11-21', 'EEE', 'Prakash P', 'Anitha P', '9876600007', '9876600008', 'Salem', 'dinesh@gmail.com', 'prakash@gmail.com', 'anitha@gmail.com', '2026-04-14 08:56:10'),
(13, '2023PECS554', '211423104690', 'Elango V', '2005-06-02', 'CSE', 'Velu V', 'Meena V', '9876600009', '9876600010', 'Trichy', 'elango@gmail.com', 'velu@gmail.com', 'meena@gmail.com', '2026-04-14 08:56:10'),
(14, '2023PECS555', '211423104691', 'Firoz M', '2004-02-14', 'IT', 'Mohammed M', 'Ayesha M', '9876600011', '9876600012', 'Erode', 'firoz@gmail.com', 'mohammed@gmail.com', 'ayesha@gmail.com', '2026-04-14 08:56:10'),
(15, '2023PECS556', '211423104692', 'Gopinath T', '2005-09-27', 'ECE', 'Thiru T', 'Radha T', '9876600013', '9876600014', 'Vellore', 'gopi@gmail.com', 'thiru@gmail.com', 'radha@gmail.com', '2026-04-14 08:56:10'),
(16, '2023PECS557', '211423104693', 'Harish K', '2004-05-30', 'EEE', 'Kannan K', 'Sujatha K', '9876600015', '9876600016', 'Chennai', 'harish@gmail.com', 'kannan@gmail.com', 'sujatha@gmail.com', '2026-04-14 08:56:10'),
(17, '2023PECS558', '211423104694', 'Irfan A', '2005-08-11', 'CSE', 'Ahamed A', 'Fathima A', '9876600017', '9876600018', 'Coimbatore', 'irfan@gmail.com', 'ahamed@gmail.com', 'fathima@gmail.com', '2026-04-14 08:56:10'),
(18, '2023PECS559', '211423104695', 'Jeeva R', '2004-12-03', 'IT', 'Ravi R', 'Anitha R', '9876600019', '9876600020', 'Madurai', 'jeeva@gmail.com', 'ravi@gmail.com', 'anitha@gmail.com', '2026-04-14 08:56:10'),
(19, '2023PECS560', '211423104696', 'Karthi S', '2005-04-25', 'ECE', 'Suresh S', 'Meena S', '9876600021', '9876600022', 'Salem', 'karthi@gmail.com', 'suresh@gmail.com', 'meena@gmail.com', '2026-04-14 08:56:10'),
(20, '2023PECS561', '211423104697', 'Lokesh M', '2004-01-17', 'EEE', 'Murugan M', 'Kala M', '9876600023', '9876600024', 'Trichy', 'lokesh@gmail.com', 'murugan@gmail.com', 'kala@gmail.com', '2026-04-14 08:56:10'),
(21, '2023PECS562', '211423104698', 'Manoj P', '2005-07-06', 'CSE', 'Prabu P', 'Latha P', '9876600025', '9876600026', 'Erode', 'manoj@gmail.com', 'prabu@gmail.com', 'latha@gmail.com', '2026-04-14 08:56:10'),
(22, '2023PECS563', '211423104699', 'Naveen V', '2004-10-28', 'IT', 'Velan V', 'Raji V', '9876600027', '9876600028', 'Vellore', 'naveen@gmail.com', 'velan@gmail.com', 'raji@gmail.com', '2026-04-14 08:56:10'),
(23, '2023PECS564', '211423104700', 'Omprakash K', '2005-02-09', 'ECE', 'Kumar K', 'Revathi K', '9876600029', '9876600030', 'Chennai', 'om@gmail.com', 'kumar@gmail.com', 'revathi@gmail.com', '2026-04-14 08:56:10'),
(24, '2023PECS565', '211423104701', 'Pradeep R', '2004-06-13', 'EEE', 'Rajan R', 'Divya R', '9876600031', '9876600032', 'Coimbatore', 'pradeep@gmail.com', 'rajan@gmail.com', 'divya@gmail.com', '2026-04-14 08:56:10'),
(25, '2023PECS566', '211423104702', 'Quresh A', '2005-09-01', 'CSE', 'Ali A', 'Zara A', '9876600033', '9876600034', 'Madurai', 'quresh@gmail.com', 'ali@gmail.com', 'zara@gmail.com', '2026-04-14 08:56:10'),
(26, '2023PECS567', '211423104703', 'Ranjith S', '2004-03-22', 'IT', 'Sekar S', 'Lalitha S', '9876600035', '9876600036', 'Salem', 'ranjith@gmail.com', 'sekar@gmail.com', 'lalitha@gmail.com', '2026-04-14 08:56:10'),
(27, '2023PECS568', '211423104704', 'Sathya K', '2005-11-15', 'ECE', 'Karthi K', 'Meera K', '9876600037', '9876600038', 'Trichy', 'sathya@gmail.com', 'karthi@gmail.com', 'meera@gmail.com', '2026-04-14 08:56:10'),
(28, '2023PECS569', '211423104705', 'Thiru M', '2004-08-05', 'EEE', 'Mani M', 'Kala M', '9876600039', '9876600040', 'Erode', 'thiru@gmail.com', 'mani@gmail.com', 'kala@gmail.com', '2026-04-14 08:56:10');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
