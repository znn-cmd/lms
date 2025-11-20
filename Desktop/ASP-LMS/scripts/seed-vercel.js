/**
 * Script to seed Vercel database
 * Usage: node scripts/seed-vercel.js
 * 
 * Make sure DATABASE_URL is set in .env.local (from Vercel)
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🌱 Seeding Vercel database...\n');

try {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is not set!');
    console.log('\nTo get DATABASE_URL:');
    console.log('1. Go to Vercel Dashboard → Storage → Your Postgres Database');
    console.log('2. Copy the Connection String');
    console.log('3. Add it to .env.local: DATABASE_URL="postgres://..."');
    console.log('4. Or run: vercel env pull .env.local');
    process.exit(1);
  }

  console.log('✓ DATABASE_URL is set');
  console.log('✓ Running migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  console.log('\n✓ Running seed...');
  execSync('npm run db:seed', { stdio: 'inherit' });

  console.log('\n✅ Database seeded successfully!');
  console.log('\nYou can now login with:');
  console.log('  Student: user / user');
  console.log('  HR: hr / hr');
} catch (error) {
  console.error('\n❌ Error seeding database:', error.message);
  process.exit(1);
}

