import express from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "../controllers/authController.js";
import { verifica_jwt } from "../middlewares/authMiddleware.js";
// Router
const router = express.Router();
// Rate Limiter per le auth routes
const limiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 minuti
    max: 20, // massimo 10 richieste per 2 minuti
    message: "Troppe richieste, riprova più tardi",
});
router.use(limiter);
// -- le routes con i controller associati
router.post('/registrati', AuthController.registra);
router.post('/accedi', AuthController.accedi);
router.post('/refresh', AuthController.refresh_token);
router.get('/cke', verifica_jwt, AuthController.cke);

export default router;