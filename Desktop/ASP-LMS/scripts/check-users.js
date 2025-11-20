/**
 * Script to check if users exist in database
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking users in database...\n');

  try {
    // Check if users exist
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        fullName: true,
        passwordHash: true,
      },
    });

    console.log(`Found ${users.length} users:\n`);

    for (const user of users) {
      console.log(`Username: ${user.username}`);
      console.log(`Role: ${user.role}`);
      console.log(`Full Name: ${user.fullName}`);
      console.log(`Password Hash: ${user.passwordHash.substring(0, 20)}...`);
      
      // Test password verification
      const testPassword = user.username === 'user' ? 'user' : 'hr';
      const isValid = await bcrypt.compare(testPassword, user.passwordHash);
      console.log(`Password '${testPassword}' verification: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      console.log('---\n');
    }

    if (users.length === 0) {
      console.log('❌ No users found! Database needs to be seeded.');
      console.log('Run: npm run db:seed');
    } else if (users.length < 2) {
      console.log('⚠️  Not all users found. Expected: user and hr');
    } else {
      console.log('✅ Users found!');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P1001') {
      console.error('Cannot reach database. Check DATABASE_URL.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();

