import { RefreshTokenService } from "../services/refreshTokenService.js";
import { TokenUtils } from "../utils/tokenUtils.js";

export class RefreshTokenController {
    constructor() {
        this.service = new RefreshTokenService();
    }
    /**
     * Genera un nuovo access token se il refresh token è valido
     * @param {*} req 
     * @param {*} res 
     */
    generate_access_token = async (req, res) => {
        try {
            const token_id = req.cookies.refresh_token;
            const user_agent = req.get('user-agent');
            // ---
            const refresh_token = await this.service.verify(token_id, user_agent);
            if (!refresh_token) return res.sendStatus(403);
            // ---
            const access_token = await TokenUtils.genera_access_token(refresh_token.user_id);
            // -- aggiorno l'ultimo utilizzo del refresh token
            await this.service.update_last_used(token_id);
            res.status(201).json({ access_token });
        } catch (error) {
            console.warn(error);
            res.sendStatus(500)
        }
    }
    /**
     * Restituisce tutti i token associati ad un utente
     * @param {*} req 
     * @param {*} res 
     */
    get_all = async (req, res) => {
        try {
            const tokens = await this.service.get_all(req.user.uid);
            res.status(200).json( tokens );
        } catch (error) {
            console.warn(error);
            res.sendStatus(500)
        }
    }
    /**
     * Revoca o riattiva un refresh token
     * @param {*} req body { token_id, revoke }
     * @param {*} res 
     */
    revoke = async (req, res) => {
        try {
            const { token_id, revoke } = req.body;
            await this.service.revoke(token_id, revoke);
            res.status(200).json({ "revoked": revoke });
        } catch (error) {
            console.warn(error);
            res.sendStatus(500)
        }
    }
    /**
     * Revoca tutti i refresh token associati ad un utente
     * @param {*} req 
     * @param {*} res 
     */
    revoke_all = async (req, res) => {
        try {
            await this.service.revoke_all(req.user.uid);
            res.sendStatus(200);
        } catch (error) {
            console.warn(error);
            res.sendStatus(500)
        }
    }
}