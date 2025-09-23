"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = __importDefault(require("../models/User.model"));
class AuthController {
    async register(req, res) {
        try {
            const { email, password, firstName, lastName, dateOfBirth, height, currentWeight, targetWeight, biologicalSex, targetRace } = req.body;
            const existingUser = await User_model_1.default.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already registered' });
            }
            const user = new User_model_1.default({
                email,
                password,
                firstName,
                lastName,
                dateOfBirth: new Date(dateOfBirth),
                height,
                currentWeight,
                targetWeight,
                biologicalSex,
                targetRace: {
                    type: targetRace.type || 'semi-marathon',
                    date: new Date(targetRace.date),
                    targetTime: targetRace.targetTime
                },
                preferences: {
                    weeklyWorkouts: 3,
                    preferredDays: ['monday', 'wednesday', 'saturday'],
                    preferredTime: 'morning'
                }
            });
            await user.save();
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
            res.status(201).json({
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User_model_1.default.findOne({ email });
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
            res.json({
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getProfile(req, res) {
        try {
            const user = await User_model_1.default.findById(req.userId).select('-password');
            res.json(user);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async updateProfile(req, res) {
        try {
            const updates = req.body;
            delete updates.password;
            delete updates.email;
            const user = await User_model_1.default.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
            res.json(user);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map