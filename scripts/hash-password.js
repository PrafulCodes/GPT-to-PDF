const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.log('Usage: node scripts/hash-password.js <your_password>');
  process.exit(1);
}

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('\n==================================================');
console.log('ADMIN PASSWORD HASH GENERATED SUCCESSFULLY');
console.log('==================================================');
console.log(`Password: ${password}`);
console.log(`Hash:     ${hash}`);
console.log('==================================================');
console.log('\nCopy and paste the Hash above into your environment variables:');
console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
console.log('==================================================\n');
