import express from 'express';
import { register, login } from '../controllers/authController';
import { auth } from '../middlewares/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, (req, res) => {
	res.status(200).json({
		success: true,
		message: 'User profile fetched successfully',
		// @ts-ignore
		data: { user: req.user }
	});
});

export default router;
