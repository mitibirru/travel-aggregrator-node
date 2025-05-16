import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
	name: string;
	email: string;
	password?: string;
	authProvider: 'email' | 'google' | 'apple' | 'instagram' | 'facebook';
	authProviderId?: string;
	tokens: string[];
	priceAlerts: mongoose.Types.ObjectId[];
	favoriteFlights: mongoose.Types.ObjectId[];
	favoriteHotels: mongoose.Types.ObjectId[];
	generateAuthToken: () => Promise<string>;
	comparePassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String
	},
	authProvider: {
		type: String,
		enum: ['email', 'google', 'apple', 'instagram', 'facebook'],
		required: true
	},
	authProviderId: {
		type: String
	},
	tokens: {
		type: [String]
	},
	priceAlerts: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'PriceAlert'
		}
	],
	favoriteFlights: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'FavouriteFlight'
		}
	],
	favoriteHotels: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'FavouriteHotel'
		}
	]
});

// Pre-save hook for password hashing (only for email auth)
userSchema.pre('save', async function (next) {
	if (this.isModified('password') && this.password) {
		this.password = await bcrypt.hash(this.password, 8);
	}
	next();
});

// Method to generate JWT token
userSchema.methods.generateAuthToken = async function () {
	const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET!, { expiresIn: '15m' });
	this.tokens.push(token);
	await this.save();
	return token;
};

// Method to compare password (for email auth)
userSchema.methods.comparePassword = async function (password: string) {
	return await bcrypt.compare(password, this.password || '');
};

export default mongoose.model<IUser>('User', userSchema);
