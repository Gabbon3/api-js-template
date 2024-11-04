import bcrypt from "bcryptjs/dist/bcrypt.js";
import { UserModel } from "../models/utenteModel.js";
import { AccessToken } from "../utils/tokenUtils.js";
import { Cripto } from "../utils/cryptoUtils.js";
import { RefreshTokenModel } from "../models/refreshTokenModel.js";

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
                const access_token = AccessToken.genera_access_token(utente.id);
                // -- elimino quello vecchio se esiste
                const user_agent_hash = Cripto.hash(req.get('user-agent'), { algorithm: 'md5', encoding: 'hex' });
                RefreshTokenModel.rimuovi_precedenti(utente.id, user_agent_hash);
                // -- genero il nuovo refresh token
                const refresh_token = await RefreshTokenModel.nuovo(utente.id, req.get('user-agent'), '');
                if (!refresh_token) throw new Error("Refresh token non valido");
                // ---
                const cke = Cripto.random_bytes(32, 'base64');
                // -- imposto i cookie
                res.cookie('access_token', access_token, {
                    httpOnly: true,
                    secure: AccessToken.secure_option, // da mettere true in produzione
                    maxAge: AccessToken.access_token_cookie_lifetime,
                    sameSite: 'Strict',
                    path: '/', // disponibile per tutte le route
                });
                res.cookie('refresh_token', refresh_token, {
                    httpOnly: true,
                    secure: AccessToken.secure_option, // da mettere true in produzione
                    maxAge: AccessToken.refresh_token_cookie_lifetime, // 14 giorni
                    sameSite: 'Strict',
                    path: '/auth/token/refresh',
                });
                res.cookie('cke', cke, {
                    httpOnly: true,
                    secure: AccessToken.secure_option, // da mettere true in produzione
                    maxAge: AccessToken.cke_cookie_lifetime,
                    sameSite: 'Strict',
                    path: '/auth', // disponibile solo per le route auth
                });
                // --
                res.status(200).json({
                    access_token,
                    refresh_token,
                    cke,
                    uid: utente.id
                });
            } else {
                res.status(401).json({ error: `Username o password errati` });
            }
        } catch (error) {
            console.warn(error);
            res.status(500).json({ error: `Errore durante l'accesso` });
        }
    }

    /**
     * CKE = Cookie KEy
     * Rigenera la cke restituendo sia quella nuova che la precedente
     * @param {Request} req 
     * @param {Response} res
     */
    static cke(req, res) {
        const cke_precedente = req.cookies.cke ?? null;
        const cke_nuova = Cripto.random_bytes(32, 'base64');
        // ---
        res.cookie('cke', cke_nuova, {
            httpOnly: true,
            secure: false, // da mettere true in produzione
            maxAge: AccessToken.cke_lifetime,
            sameSite: 'Strict',
            path: '/auth', // disponibile solo per le route auth
        });
        // ---
        res.status(200).json({
            cke_precedente, 
            cke_nuova
        });
    }
}