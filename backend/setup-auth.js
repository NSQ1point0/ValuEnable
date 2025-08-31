const crypto = require('crypto');
const bcrypt = require('bcryptjs');

console.log('🔐 Generating Secure Keys for Benefit Illustration Module\n');

// Generate secure JWT secret (256-bit)
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('JWT_SECRET=' + jwtSecret);

// Generate secure encryption key (256-bit)
const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log('ENCRYPTION_KEY=' + encryptionKey);

console.log('\n📝 Copy these keys to your .env file for maximum security!\n');

console.log('=== Test User Credentials ===');
console.log('You can register users through the application, or use these test credentials:\n');

// Test user data
const testUsers = [
  {
    email: 'john.doe@example.com',
    password: 'TestUser123!',
    name: 'John Doe',
    mobile: '9876543210',
    dob: '1990-01-15',
    gender: 'M'
  },
  {
    email: 'jane.smith@example.com', 
    password: 'TestUser456!',
    name: 'Jane Smith',
    mobile: '9876543211',
    dob: '1985-06-20',
    gender: 'F'
  },
  {
    email: 'admin@valueenable.com',
    password: 'Admin789!',
    name: 'Admin User',
    mobile: '9999999999',
    dob: '1980-03-10',
    gender: 'M'
  }
];

console.log('📧 Test Login Credentials:');
testUsers.forEach((user, index) => {
  console.log(`\n${index + 1}. User: ${user.name}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Password: ${user.password}`);
  console.log(`   Age: ${new Date().getFullYear() - new Date(user.dob).getFullYear()} years`);
});

console.log('\n🎯 Sample Policy Data (matches spreadsheet):');
console.log('- DOB: 1999-12-12 (Age: 25)');
console.log('- Gender: M');
console.log('- Sum Assured: ₹12,00,000');
console.log('- Modal Premium: ₹80,000');
console.log('- Premium Frequency: Yearly');
console.log('- Policy Term: 18 years');
console.log('- Premium Paying Term: 10 years');

console.log('\n🚀 Usage Instructions:');
console.log('1. Update your .env file with the generated keys above');
console.log('2. Start the backend: npm run dev');
console.log('3. Start the frontend: cd ../frontend && npm start');
console.log('4. Navigate to http://localhost:3000');
console.log('5. Register a new user or use the test credentials above');
console.log('6. Use the sample policy data to test calculations');

console.log('\n✅ Setup Complete!');

// Also generate hashed passwords for reference
console.log('\n🔧 Hashed Passwords (for database reference):');
testUsers.forEach((user) => {
  const hashedPassword = bcrypt.hashSync(user.password, 10);
  console.log(`${user.email}: ${hashedPassword}`);
});

console.log('\n⚠️  Security Note:');
console.log('- Always use the generated secure keys in production');
console.log('- Never commit .env files to version control');
console.log('- Rotate keys regularly in production environments');
console.log('- Use different keys for different environments (dev/staging/prod)');
