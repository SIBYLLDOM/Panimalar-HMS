import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error("Connection failed:", err);
    return;
  }
  
  console.log("Connected to database successfully!");
  
  db.query("SHOW TABLES", (err, results) => {
    if (err) {
      console.error("Error showing tables:", err);
    } else {
      console.log("Tables in database:");
      results.forEach(row => {
        console.log("- " + Object.values(row)[0]);
      });
      console.log(`Total tables: ${results.length}`);
    }
    
    db.end();
  });
});
