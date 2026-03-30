import pg from 'pg';
import { log } from '../utils/logger.js';
import { env } from '../config/env.js';

const { Pool } = pg;

export const pool = new Pool({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    port: env.DB_PORT || 5432,
});

pool.on('error', (err) => {
    log(`DB Error: ${err.message}`);
});

// SAFE predefined queries
export const queries = {
    get_users: "SELECT * FROM users LIMIT 10",
    get_chats: "SELECT * FROM chat_messages LIMIT 10",
    get_sessions: "SELECT * FROM chat_sessions LIMIT 10",
};

