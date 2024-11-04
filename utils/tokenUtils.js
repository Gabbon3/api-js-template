import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UID } from './uid.js';

dotenv.config();

export class AccessToken {
    static TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
    // -- proprietà dei jwt o cookie
    static secure_option = false;
    // -- tempo di vita dei token in millisecondi
    static access_token_lifetime = 60 * 60; // 1 ora
    static cke_lifetime = 60 * 60 * 24 * 31; // 31 giorni
    // -- tempo di vita dei cookie
    static access_token_cookie_lifetime = 60 * 60 * 1000; // 31 giorni
    static refresh_token_cookie_lifetime = 60 * 60 * 1000; // 31 giorni
    static cke_cookie_lifetime = 60 * 60 * 24 * 31 * 1000; // 31 giorni

    /**
     * Genera un access token con scadenza di 1 ora
     * @param {number} uid - ID dell'utente
     * @returns {string} - access token
     */
    static genera_access_token(uid) {
        const now = Math.floor(Date.now() / 1000);
        // ---
        return jwt.sign(
            {
                sub: uid,
                iat: now,
                exp: now + this.access_token_lifetime,
            },
            this.TOKEN_SECRET
        );
    }

    /**
     * Verifica un access token
     * @param {string} access_token - Il token da verificare
     * @returns {Promise<Object>} - L'oggetto utente decodificato se valido
     */
    static verifica_access_token(access_token) {
        return this.verifica_token(access_token, this.TOKEN_SECRET);
    }

    /**
     * Verifica un token generico
     * @param {string} token - access o refresh token
     * @param {string} secret - Segreto dell'access o del refresh token
     * @returns {Promise<Object>} - L'oggetto utente decodificato se valido
     */
    static verifica_token(token, secret) {
        try {
            // -- provo a verificare il jwt
            // -- se invalido lancerà un errore quindi lo catturo
            // -- e restituisco null
            return jwt.verify(token, secret);
        } catch (error) {
            // -- il token non è valido
            return null;
        }
    }
}
