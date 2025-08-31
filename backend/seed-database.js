require('dotenv').config();
const { User, initializeDatabase } = require('./models');
const EncryptionUtil = require('./utils/encryption');

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

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with test users...\n');

    // Initialize database
    await initializeDatabase();

    // Create test users
    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email: userData.email } });
        
        if (existingUser) {
          console.log(`⚠️  User ${userData.email} already exists, skipping...`);
          continue;
        }

        // Encrypt/hash sensitive data
        const nameHash = EncryptionUtil.hashSensitiveData(userData.name);
        const dobEncrypted = EncryptionUtil.encryptSensitiveData(userData.dob);
        const mobileHash = EncryptionUtil.hashSensitiveData(userData.mobile);

        // Create user
        const user = await User.create({
          email: userData.email,
          password: userData.password, // Will be hashed by model hook
          name_hash: nameHash,
          dob_encrypted: dobEncrypted,
          mobile_hash: mobileHash,
          gender: userData.gender
        });

        console.log(`✅ Created user: ${userData.email}`);
        console.log(`   Name: ${EncryptionUtil.maskForDisplay(userData.name, 'name')}`);
        console.log(`   Mobile: ${EncryptionUtil.maskForDisplay(userData.mobile, 'mobile')}`);
        console.log(`   Age: ${new Date().getFullYear() - new Date(userData.dob).getFullYear()} years\n`);

      } catch (error) {
        console.error(`❌ Failed to create user ${userData.email}:`, error.message);
      }
    }

    console.log('🎉 Database seeding completed!\n');
    console.log('📧 Login Credentials:');
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email} | Password: ${user.password}`);
    });

    console.log('\n🚀 Next Steps:');
    console.log('1. Start backend: npm run dev');
    console.log('2. Start frontend: cd ../frontend && npm start');
    console.log('3. Navigate to http://localhost:3000');
    console.log('4. Login with any of the credentials above');

    process.exit(0);

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Run seeder
seedDatabase();
