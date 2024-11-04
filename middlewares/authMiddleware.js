import { AccessToken } from "../utils/tokenUtils.js";

/**
 * Middleware per la verifica del jwt e refresh 
 * dell'access token se scaduto
 * @param {Request} req 
 * @param {Response} res 
 * @param {Function} next 
 */
export const verifica_jwt = (req, res, next) => {
    const access_token = req.cookies.access_token;
    // -- verifico che esista
    if (!access_token) {
        return res.sendStatus(401)
            .json({ error: "Token di accesso mancante" });
    }
    // -- verifico che l'access token sia valido
    const payload = AccessToken.verifica_access_token(access_token);
    if (!payload) {
        // - provo a rigenerare l'access token
        // - se va a buon fine vuol dire che il token è valido ed è stato rigenerato correttamente
        // return TokenUtils.refresh_token(req, res);
        return res.sendStatus(401)
            .json({ error: "Token di accesso mancante" });
    }
    // -- se è tutto ok aggiungo il payload dell'utente alla request
    req.user = payload;
    // -- passo al prossimo payload o controller
    next();
}