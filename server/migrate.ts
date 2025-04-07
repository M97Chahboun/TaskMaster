import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const main = async () => {
    try {
        const db = drizzle(pool);
        console.log('Running migrations...');
        await migrate(db, { migrationsFolder: './migrations' });
        console.log('Migrations completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error performing migrations:', error);
        process.exit(1);
    }
};

main();