import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UID } from './uid.js';

dotenv.config();

export class TokenUtils {
    static ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
    static REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
    // -- proprietà dei jwt o cookie
    static secure_option = false;
    // -- tempo di vita dei token in millisecondi
    static access_token_lifetime = 60 * 60 * 1000; // 1 ora
    static refresh_token_lifetime = 60 * 60 * 24 * 14 * 1000; // 14 giorni
    static cke_lifetime = 60 * 60 * 24 * 31 * 1000; // 1 mese

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
                exp: now + this.access_token_lifetime / 1000, // 1h
            },
            this.ACCESS_TOKEN_SECRET
        );
    }

    /**
     * Genera un refresh token con scadenza di 1 settimana
     * @param {number} uid - ID dell'utente
     * @returns {string} - refresh token
     */
    static genera_refresh_token(uid) {
        const now = Math.floor(Date.now() / 1000);
        const tid = UID.genera(3);
        // ---
        return jwt.sign(
            {
                tid: tid,
                uid: uid,
                iat: now,
                exp: now + this.refresh_token_lifetime / 1000, // 7 giorni
            },
            this.REFRESH_TOKEN_SECRET
        );
    }

    /**
     * Verifica un access token
     * @param {string} access_token - Il token da verificare
     * @returns {Promise<Object>} - L'oggetto utente decodificato se valido
     */
    static verifica_access_token(access_token) {
        return this.verifica_token(access_token, this.ACCESS_TOKEN_SECRET);
    }

    /**
     * Verifica un refresh token
     * @param {string} refresh_token - Il token da verificare
     * @returns {Promise<Object>} - L'oggetto utente decodificato se valido
     */
    static verifica_refresh_token(refresh_token) {
        return this.verifica_token(refresh_token, this.REFRESH_TOKEN_SECRET);
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

    /**
     * Rigenera l'access token se il refresh token viene validato
     * @param {Request} req 
     * @param {Response} res
     * @returns {Response}
     */
    static refresh_token(req, res) {
        const refresh_token = req.cookies.refresh_token;
        if (!refresh_token) return res.sendStatus(403);
        // -- verifico che sia valido il refresh token
        const payload = TokenUtils.verifica_refresh_token(refresh_token);
        if (!payload) {
            return res.status(403).json({ error: 'Token invalido o scaduto' });
        }
        // --
        const nuovo_access_token = TokenUtils.genera_access_token(payload);
        res.cookie('access_token', nuovo_access_token, {
            httpOnly: true,
            secure: this.secure_option, // da mettere true in produzione
            maxAge: TokenUtils.access_token_lifetime / 1000
        });
        // ---
        res.user = payload;
        // ---
        return res.status(200).json({ message: 'Access token rinnovato' });
    }
}
