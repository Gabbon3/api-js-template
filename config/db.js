import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // -- opzioni aggiuntive
    // - se true, le richieste verranno messe in coda, fino a quando non sarà disponibile una connessione libera
    waitForConnections: true,
    connectionLimit: 100,
});