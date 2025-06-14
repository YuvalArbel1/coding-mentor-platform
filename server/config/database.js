/**
 * Database configuration and connection pool
 * @module config/database
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

/**
 * PostgreSQL connection pool
 * @type {pg.Pool}
 */
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // 10 seconds
    query_timeout: 10000,
    statement_timeout: 10000,
});

/**
 * Keep-alive query to prevent connection timeout
 */
setInterval(async () => {
    try {
        await pool.query('SELECT 1');
    } catch (err) {
        console.log('Keep-alive query failed:', err.message);
    }
}, 30000); // Every 30 seconds

/**
 * Test database connection
 */
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
});

// Test connection on startup
(async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Initial database connection successful');
        client.release();
    } catch (err) {
        console.error('❌ Initial database connection failed:', err.message);
    }
})();

export default pool;