import { RefreshTokenModel } from "../models/refreshTokenModel.js";
import { AccessToken } from "../utils/tokenUtils.js";

export class RefreshTokenController {
    /**
     * Genera un nuovo access token
     * @param {Request} req 
     * @param {Response} res 
     * @returns 
     */
    static async nuovo_access_token(req, res) {
        const refresh_token = req.cookies.refresh_token;
        if (!refresh_token) return res.sendStatus(403);
        // ---
        const user_agent = req.get('user-agent');
        const ip_address = '';
        // -- verifico il refresh token
        const payload = await RefreshTokenModel.verifica(refresh_token, user_agent, ip_address);
        if (!payload) return res.sendStatus(403);
        // -- genero il nuovo access token e lo salvo come cookie
        const nuovo_access_token = AccessToken.genera_access_token(payload.user_id);
        res.cookie('access_token', nuovo_access_token, {
            httpOnly: true,
            secure: AccessToken.secure_option,
            maxAge: AccessToken.access_token_cookie_lifetime
        });
        // -- aggiorno l'ultimo utilizzo del refresh token
        RefreshTokenModel.aggiorna(refresh_token);
        // --
        return res.status(201).json({ 'access_token': nuovo_access_token });
    }
    /**
     * Restituisce tutti i token associati ad un utente
     * @param {Request} req 
     * @param {Response} res 
     */
    static async ottieni_tutti(req, res) {
        const user_id = req.user.sub;
        // ---
        const tokens = await RefreshTokenModel.ottieni_tutti(user_id);
        // ---
        res.status(200).json(tokens);
    }
}