import { UAParser } from 'ua-parser-js';
import { pool } from '../config/db.js';
import { UID } from '../utils/uid.js';
import { Cripto } from '../utils/cryptoUtils.js';
import { date } from '../utils/dateUtils.js';

/*
CREATE TABLE `refresh_token` (
  `id` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `device_name` varchar(25) NOT NULL DEFAULT '*',
  `user_agent_hash` varchar(32) NOT NULL COMMENT 'MD5',
  `user_agent_summary` varchar(100) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `iat` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_used_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_revoked` tinyint(1) DEFAULT 0
)
*/
export class RefreshTokenModel {
    static max_tempo_inattivita = 30 * 24 * 60 * 60 * 1000; // 30 giorni in millisecondi
    /**
     * salva un nuovo refresh token sul db
     * @param {string} user_id 
     * @param {string} user_agent 
     * @param {string} ip_address 
     */
    static async genera(user_id, user_agent = '', ip_address = '') {
        const token = UID.genera(12);
        // ---
        const ua = UAParser(user_agent);
        const user_agent_summary = `${ua.browser.name ?? ''}-${ua.browser.major ?? ''}-${ua.os.name ?? ''}-${ua.os.version ?? ''}`;
        const user_agent_hash = Cripto.hash(user_agent, { algorithm: 'md5', encoding: 'hex' });
        // ---
        const sql = `
            INSERT INTO refresh_token(id, user_id, user_agent_summary, user_agent_hash, ip_address)
            VALUES (?, ?, ?, ?, ?)
        `;
        // ---
        const [result] = await pool.execute(sql, [token, user_id, user_agent_summary, user_agent_hash, ip_address]);
        // ---
        return result.affectedRows === 1 ? token : null;
    }
    /**
     * Verifica la validità dei refresh token restituendo le informazioni associate se valido
     * @param {string} refresh_token 
     * @param {string} user_agent 
     * @param {string} ip_address 
     * @returns {boolean | Object}
     */
    static async verifica(token_id, user_agent, ip_address) {
        const refresh_token = await this.ottieni(token_id);
        // -- se il token non esiste non è valido
        if (!refresh_token) return false;
        // -- se il token è stato revocato non è valido
        if (refresh_token.is_revoked === 1) return false;
        // -- se il token è inutilizzato da piu di 30 giorni non è piu valido
        const scadenza = refresh_token.last_used_at.getTime() + this.max_tempo_inattivita;
        if (scadenza < Date.now()) return false;
        // -- se l'user agent non corrisponde non è valido
        const user_agent_hash = Cripto.hash(user_agent, { algorithm: 'md5', encoding: 'hex' });
        if (user_agent_hash != refresh_token.user_agent_hash) return false;
        // ---
        return refresh_token;
    }
    /**
     * Aggiorna la data di ultimo utilizzo
     * @param {string} token_id 
     */
    static async aggiorna_ultimo_utilizzo(token_id) {
        const sql = `
            UPDATE refresh_token
            SET last_used_at = ?
            WHERE id = ?
        `;
        // ---
        const [result] = await pool.execute(sql, [new Date(), token_id]);
        // ---
        return result.affectedRows === 1;
    }
    /**
     * Restituisce un refresh token
     * @param {string} token_id 
     * @returns 
     */
    static async ottieni(token_id) {
        const [result] = await pool.execute(`SELECT * FROM refresh_token WHERE id = ?`, [token_id]);
        // ---
        return result[0] ?? null;
    }
    /**
     * Restituisce la lista di tutti i refresh token associati ad un utente
     * @param {string} user_id 
     * @returns 
     */
    static async ottieni_tutti(user_id) {
        const [result] = await pool.execute(`SELECT * FROM refresh_token WHERE user_id = ?`, [user_id]);
        // ---
        return result ?? null;
    }
    /**
     * Rimuove dal db tutti i refresh token associato ad un dispositivo
     * @param {string} user_id 
     * @param {string} user_agent_hash - hash dell'user agent per identificare velocemente il dispositivo
     * @param {Date} cutoff - data di riferimento da usare per eliminare i token antecedenti ad essa
     * @returns {boolean}
     */
    static async rimuovi_precedenti(user_id, user_agent_hash, cutoff = new Date()) {
        const [result] = await pool.execute(`DELETE FROM refresh_token WHERE user_id = ? AND user_agent_hash = ? AND iat < ?`, [user_id, user_agent_hash, cutoff]);
        // ---
        return result.affectedRows >= 1;
    }
    static async revoca(token_id, flag) {

    }
}