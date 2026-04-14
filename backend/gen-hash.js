import bcrypt from 'bcryptjs';
import fs from 'fs';

bcrypt.hash('hod123', 10, (err, hash) => {
  if (err) {
    fs.writeFileSync('hash-result.txt', 'ERROR: ' + err.message);
  } else {
    fs.writeFileSync('hash-result.txt', hash);
  }
  process.exit(0);
});
