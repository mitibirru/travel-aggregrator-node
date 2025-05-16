import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';

import { connectDB } from './helpers/db';

dotenv.config();
connectDB();

const app = express();

app.use(
	cors({
		origin: process.env.CLIENT_URL,
		credentials: true
	})
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

const port = process.env.PORT;
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
