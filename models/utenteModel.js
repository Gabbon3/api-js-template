import { pool } from '../config/db.js';
import bcrypt from "bcryptjs/dist/bcrypt.js";

export class UserModel {
    /**
     * Registra un utente sul db
     * @param {string} username 
     * @param {string} password 
     * @returns {string} id dell'utente appena inserito
     */
    static async registra(username, password) {
        // -- genero l'hash della password
        const password_hash = await bcrypt.hash(password, 10);
        // ---
        const [result] = await pool.execute(
            'INSERT INTO utente (username, password) VALUES(?, ?)',
            [username, password_hash]
        );
        // -- restituisco l'id appena generato
        return result.insertId;
    }
    /**
     * Cerca un utente tramite il suo username
     * @param {string} username 
     * @returns {Object | null} utente
     */
    static async cerca_username(username) {
        const [utenti_trovati] = await pool.execute(
            'SELECT * FROM utente WHERE username = ?',
            [username]
        );
        // -- restituisco l'utente
        return utenti_trovati[0];
    }
}