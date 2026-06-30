import { db } from './index';

async function verify() {
  console.log('----------------------------------------------------');
  console.log('Database Connection Verification Script');
  console.log('----------------------------------------------------');
  
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is not defined.');
    console.error('Please configure DATABASE_URL in your environment or .env file.');
    process.exit(1);
  }

  console.log('Connecting to Neon PostgreSQL...');
  try {
    const result = await db.$queryRaw<Array<{ connected: number }>>`SELECT 1 as connected`;
    console.log('SUCCESS: Connection verified successfully.');
    console.log('Database returned:', result);
    process.exit(0);
  } catch (error) {
    console.error('ERROR: Failed to connect to the database.');
    console.error(error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

verify();
