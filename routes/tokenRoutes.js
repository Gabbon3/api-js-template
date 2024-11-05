import express from "express";
import rateLimit from "express-rate-limit";
import { RefreshTokenController } from "../controllers/refreshTokenController.js";
import { verify_access_token } from "../middlewares/authMiddleware.js";
// -- router
const router = express.Router();
// -- controller
const controller = new RefreshTokenController();
// -- rate Limiter per le auth routes
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: "Troppe richieste, riprova più tardi",
});
router.use(limiter);
router.use(verify_access_token);
// -- le routes con i controller associati
// /auth/token
router.post('/refresh', controller.generate_access_token);
router.post('/revoke', controller.revoke);
router.post('/revoke-all', controller.revoke_all);
router.get('/', controller.get_all);

export default router;