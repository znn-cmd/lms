// Script to switch Prisma schema from SQLite to PostgreSQL
// Run this before deploying to Vercel

const fs = require('fs');
const path = require('path');

const sqliteSchemaPath = path.join(__dirname, '../prisma/schema.prisma');
const postgresSchemaPath = path.join(__dirname, '../prisma/schema.postgres.prisma');
const backupPath = path.join(__dirname, '../prisma/schema.sqlite.backup.prisma');

// Backup current SQLite schema
if (fs.existsSync(sqliteSchemaPath)) {
  const sqliteSchema = fs.readFileSync(sqliteSchemaPath, 'utf8');
  fs.writeFileSync(backupPath, sqliteSchema);
  console.log('✅ SQLite schema backed up to schema.sqlite.backup.prisma');
}

// Copy PostgreSQL schema to main schema
if (fs.existsSync(postgresSchemaPath)) {
  const postgresSchema = fs.readFileSync(postgresSchemaPath, 'utf8');
  fs.writeFileSync(sqliteSchemaPath, postgresSchema);
  console.log('✅ Switched to PostgreSQL schema');
} else {
  console.error('❌ PostgreSQL schema file not found!');
  process.exit(1);
}

