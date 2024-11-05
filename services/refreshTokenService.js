import { UAParser } from "ua-parser-js";
import { RefreshToken } from "../models/refreshToken.js";
import { UID } from "../utils/uid.js";
import { Cripto } from "../utils/cryptoUtils.js";

export class RefreshTokenService {
    /**
     * Crea un nuovo refresh token salvandolo sul db e restituendolo
     * @param {string} user_id
     * @param {string} user_agent
     * @returns {string}
     */
    async create(user_id, user_agent) {
        const token_id = UID.genera(6, true);
        // -- User Agent
        const ua = UAParser(user_agent);
        const user_agent_summary = `${ua.browser.name ?? ""}-${
            ua.browser.major ?? ""
        }-${ua.os.name ?? ""}-${ua.os.version ?? ""}`;
        const user_agent_hash = this.user_agent_hash(user_agent);
        // ---
        const token = await RefreshToken.create({
            id: token_id,
            user_id,
            user_agent_summary,
            user_agent_hash,
        });
        // ---
        return token ? token_id : null;
    }
    /**
     * Aggiorna il campo last used di un token
     * @param {string} token_id
     * @returns
     */
    async update_last_used(token_id) {
        return await RefreshToken.update(
            { last_used_at: new Date() },
            { where: { id: token_id } }
        );
    }
    /**
     * Revoca no un token
     * @param {string} token_id
     * @param {boolean} is_revoked
     */
    async revoke(token_id, is_revoked) {
        return await RefreshToken.update(
            { is_revoked },
            { where: { id: token_id } }
        );
    }
    /**
     * Revoca tutti i token associati ad un utente
     * @param {string} user_id
     * @returns
     */
    async revoke_all(user_id) {
        return await RefreshToken.update(
            { is_revoked: true },
            { where: { user_id } }
        );
    }
    /**
     * Restituisce tutti i token associati ad un utente
     * @param {string} user_id
     * @returns
     */
    async get_all(user_id) {
        return await RefreshToken.findAll({ where: { user_id } });
    }
    /**
     * Elimina tutti i token associati ad un utente e ad un dispositivo
     * utile per non accumulare token sullo stesso dispositivo
     * @param {string} user_id
     * @param {string} user_agent_hash
     * @returns
     */
    async delete_old_tokens(user_id, user_agent_hash) {
        return await RefreshToken.destroy({
            where: {
                user_id,
                user_agent_hash,
            },
        });
    }
    /**
     * Verifica la validità dei refresh token restituendo le informazioni associate se valido
     * @param {string} token_id
     * @param {string} user_agent
     * @param {string} ip_address
     * @returns {boolean | Object}
     */
    async verify(token_id, user_agent, ip_address) {
        const refresh_token = await RefreshToken.findByPk(token_id);
        // -- se il token non esiste non è valido
        if (!refresh_token) return false;
        // -- se il token è stato revocato non è valido
        if (refresh_token.is_revoked === true) return false;
        // -- se il token è inutilizzato da piu di 30 giorni non è piu valido
        const scadenza =
            refresh_token.last_used_at.getTime() + this.max_tempo_inattivita;
        if (scadenza < Date.now()) return false;
        // -- se l'user agent non corrisponde non è valido
        const user_agent_hash = this.user_agent_hash(user_agent);
        if (user_agent_hash != refresh_token.user_agent_hash) return false;
        // ---
        return refresh_token;
    }
    /**
     * Crea l'hash MD5 dell'user agent restituendo in formato hex
     * @param {string} user_agent
     * @returns {string} hex string
     */
    user_agent_hash(user_agent) {
        return Cripto.hash(user_agent, { algorithm: "md5", encoding: "hex" });
    }
}
