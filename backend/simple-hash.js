import bcrypt from 'bcryptjs';

bcrypt.hash('hod123', 10).then(hash => {
  console.log(hash);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
