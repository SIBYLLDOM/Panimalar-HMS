import bcrypt from 'bcryptjs';
import fs from 'fs';

const password = 'hod123';
bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  
  const output = {
    password: password,
    hashed_password: hash,
    sql_query: `INSERT INTO users (name, email, password, role, department) VALUES ('HOD User', 'hod@panimalarhms.com', '${hash}', 'hod', 'Computer Science');`
  };
  
  fs.writeFileSync('hod-credentials.json', JSON.stringify(output, null, 2));
  console.log('HOD credentials generated and saved to hod-credentials.json');
});
