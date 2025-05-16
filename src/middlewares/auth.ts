import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface CustomRequest extends Request {
	user?: any;
	token?: string;
}

export const auth = async (req: CustomRequest, res: Response, next: NextFunction) => {
	try {
		const token = req.header('Authorization')?.split(' ')[1];
		if (!token) {
			throw new Error('Authentication failed');
		}
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { _id: string };
		const user = await User.findOne({ _id: decoded._id, tokens: token });
		if (!user) {
			throw new Error('Authentication failed');
		}
		req.user = user;
		req.token = token;
		next();
	} catch (error) {
		res.status(401).send({ error: 'Please authenticate with valid token' });
	}
};
