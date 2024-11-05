import { UserService } from "../services/userService.js";
import { TokenUtils } from "../utils/tokenUtils.js";

export class UserController {
    constructor() {
        this.service = new UserService();
    }
    /**
     * Registra utente
     * @param {Request} req 
     * @param {Response} res 
     */
    registra = async (req, res) => {
        try {
            const { username, password } = req.body;
            // ---
            const user = await this.service.registra(username, password);
            res.status(201).json({ message: 'Utente registrato con successo', user });
        } catch (error) {
            console.warn(error);
            res.status(400).json({ error: 'Errore durante la registrazione' });   
        }
    }
    /**
     * Accede
     * @param {Request} req 
     * @param {Response} res 
     */
    accedi = async (req, res) => {
        try {
            const { username, password } = req.body;
            const user_agent = req.get('user-agent');
            // -- Access Token
            const { access_token, refresh_token, user } = await this.service.accedi(username, password, user_agent);
            this.set_token_cookies(res, access_token, refresh_token);
            // ---
            res.status(201).json({
                access_token,
                refresh_token
            });
        } catch (error) {
            console.warn(error);
            res.sendStatus(401);
        }
    }
    /**
     * Imposta nei cookie l'access e il refresh token
     * @param {Response} res 
     * @param {string} access_token 
     * @param {string} refresh_token 
     */
    set_token_cookies = (res, access_token, refresh_token) => {
        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: TokenUtils.secure_option, // da mettere true in produzione
            maxAge: TokenUtils.access_token_cookie_lifetime,
            sameSite: 'Strict',
            path: '/', // disponibile per tutte le route
        });
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: TokenUtils.secure_option, // da mettere true in produzione
            maxAge: TokenUtils.refresh_token_cookie_lifetime,
            sameSite: 'Strict',
            path: '/auth/token/refresh',
        });
    }
}

