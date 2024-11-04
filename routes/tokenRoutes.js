import express from "express";
import rateLimit from "express-rate-limit";
import { RefreshTokenController } from "../controllers/refreshTokenController.js";
import { verifica_jwt } from "../middlewares/authMiddleware.js";
// -- router
const router = express.Router();
// -- rate Limiter per le auth routes
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: "Troppe richieste, riprova più tardi",
});
router.use(limiter);
// -- le routes con i controller associati
// /auth/token
router.post('/refresh', verifica_jwt, RefreshTokenController.nuovo_access_token);
router.get('/', verifica_jwt, RefreshTokenController.ottieni_tutti);

export default router;