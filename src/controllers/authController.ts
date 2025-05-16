import { Request, Response } from 'express';
import User from '../models/User';
import { isValidEmail } from '../helpers/validation';

export const register = async (req: Request, res: Response) => {
	try {
		const { email, name, password } = req.body;
		if (!name || !email || !password || !isValidEmail(email)) {
			const missingFields = [];
			if (!name) missingFields.push('name');
			if (!email) missingFields.push('email');
			if (!password) missingFields.push('password');
			throw new Error(`Please provide missing fields - ${missingFields.join(',')}`);
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).send({ error: 'Email already exists' });
		}
		const user = await User.create({ email, name, password, authProvider: 'email' });
		await user.save();
		const token = await user.generateAuthToken();
		res.status(201).json({
			success: true,
			message: 'User registered successfully',
			data: { token }
		});
	} catch (error) {
		res.status(400).json({ error, success: false });
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
		if (!email || !password || !isValidEmail(email)) {
			const missingFields = [];
			if (!email) missingFields.push('email');
			if (!password) missingFields.push('password');
			throw new Error(`Please provide missing fields - ${missingFields.join(',')}`);
		}
		const user = await User.findOne({ email });
		if (!user || !(await user.comparePassword(password))) {
			res.status(401).json({ message: 'Invalid email or password', success: false });
		}
		const token = await user!.generateAuthToken();
		res.status(200).json({
			success: true,
			message: 'User logged in successfully',
			data: { token }
		});
	} catch (error) {
		res.status(400).json({ error, success: false });
	}
};
