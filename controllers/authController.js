import bcrypt from "bcryptjs/dist/bcrypt.js";
import { UserModel } from "../models/utenteModel.js";
import { TokenUtils } from "../utils/tokenUtils.js";

export class AuthController {
    /**
     * Effettua la registrazione di un nuovo utente
     * @param {Request} req 
     * @param {Response} res 
     */
    static async registra(req, res) {
        const { username, password } = req.body;
        try {
            const uid = await UserModel.registra(username, password);
            res.status(201).json({ uid });
        } catch (error) {
            console.warn(error);
            res.status(500).json({ error: 'Errore durante la registrazione' });
        }
    }
    /**
     * Effettua il login, impostando i jwt in caso di login effettuato con successo
     * @param {Request} req 
     * @param {Response} res 
     */
    static async accedi(req, res) {
        const { username, password } = req.body;
        try {
            const utente = await UserModel.cerca_username(username);
            const password_is_correct = await bcrypt.compare(password, utente.password);
            // ---
            if (utente && password_is_correct) {
                const access_token = TokenUtils.genera_access_token(utente.id);
                const refresh_token = TokenUtils.genera_refresh_token(utente.id);
                // -- imposto i cookie
                res.cookie('access_token', access_token, {
                    httpOnly: true,
                    secure: false, // da mettere true in produzione
                    maxAge: TokenUtils.access_token_lifetime,
                    sameSite: 'Strict',
                    path: '/', // disponibile per tutte le route
                });
                res.cookie('refresh_token', refresh_token, {
                    httpOnly: true,
                    secure: false, // da mettere true in produzione
                    maxAge: TokenUtils.refresh_token_lifetime,
                    sameSite: 'Strict',
                    path: '/api/auth/refresh', // disponibile solo per la route refresh
                });
                // --
                res.status(200).json({
                    access_token,
                    refresh_token,
                    uid: utente.id
                });
            } else {
                res.status(401).json({ error: 'Username o password errati' });
            }
        } catch (error) {
            console.warn(error);
            res.status(500).json({ error: 'Errore durante l\'accesso' });
        }
    }
    /**
     * Rigenera l'access token se il refresh token viene validato
     * @param {Request} req 
     * @param {Response} res
     */
    static refresh_token(req, res) {
        const refresh_token = req.cookies.refresh_token;
        if (!refresh_token) return res.sendStatus(403);
        // -- verifico che sia valido il refresh token
        const payload = TokenUtils.verifica_refresh_token(refresh_token);
        if (!payload) {
            return res.status(403).json({ error: 'Refresh token invalido o scaduto' });
        }
        // --
        const nuovo_access_token = TokenUtils.genera_access_token(payload);
        res.cookie('access_token', nuovo_access_token, {
            httpOnly: true,
            secure: false, // da mettere true in produzione
            maxAge: TokenUtils.access_token_lifetime
        });
        // ---
        return res.status(200).json({ access_token: nuovo_access_token });
    }
}