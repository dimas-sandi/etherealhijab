const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkMySQL() {
  console.log('Attempting to connect to MySQL database and push schema...');
  try {
    // Generate Prisma client first
    console.log('Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Try to push schema
    console.log('Running Prisma db push for MySQL...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    
    console.log('MySQL setup succeeded! Running database seeding...');
    execSync('node prisma/seed.js', { stdio: 'inherit' });
    console.log('Seeding completed successfully!');
    return true;
  } catch (err) {
    return false;
  }
}

function switchToSQLite() {
  console.log('\n--- Switching database provider to SQLite for local development ---');
  
  // Modify schema.prisma
  const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
  if (fs.existsSync(schemaPath)) {
    let schema = fs.readFileSync(schemaPath, 'utf8');
    schema = schema.replace('provider = "mysql"', 'provider = "sqlite"');
    // Remove @db.Text as SQLite doesn't use it
    schema = schema.replaceAll(' @db.Text', '');
    fs.writeFileSync(schemaPath, schema, 'utf8');
    console.log('✔ Modified prisma/schema.prisma to use SQLite provider.');
  } else {
    console.error('Error: schema.prisma not found at ' + schemaPath);
    return;
  }

  // Modify .env
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    // Swap the MySQL URL for SQLite
    envContent = envContent.replace(
      'DATABASE_URL="mysql://root:password@localhost:3306/ethereal_hijab"',
      'DATABASE_URL="file:./dev.db"'
    );
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✔ Modified backend/.env to use database file dev.db.');
  }

  console.log('Generating Prisma Client for SQLite...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('Running Prisma DB push for SQLite...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✔ Prisma DB push succeeded! Seeding database...');
    execSync('node prisma/seed.js', { stdio: 'inherit' });
    console.log('✔ SQLite seeding completed successfully!');
    console.log('\nDatabase is now running on SQLite. You can start the server with: npm run dev');
  } catch (err) {
    console.error('❌ SQLite database setup failed:', err.message);
  }
}

// Check arguments
const useSqlite = process.argv.includes('--sqlite');
if (useSqlite) {
  switchToSQLite();
} else {
  const success = checkMySQL();
  if (!success) {
    console.log('\n================================================================');
    console.log('❌ DATABASE SETUP WARNING: Failed to connect to MySQL database.');
    console.log('This is normal if MySQL is not installed, running, or has a different password.');
    console.log('Please verify the DATABASE_URL in backend/.env.');
    console.log('\nTo run this project instantly using SQLite instead, please run:');
    console.log('  node setup.js --sqlite');
    console.log('================================================================\n');
  }
}
