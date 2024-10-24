import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import auth_routes from './routes/authRoutes.js';

dotenv.config();

/**
 * MIDDLEWARES
 * qui ci sono i middleware che verranno utilizzati in tutte le routes
 */
const app = express();
app.use(express.json());
app.use(cookieParser());

/**
 * ROUTES
 */
app.use('/auth', auth_routes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});