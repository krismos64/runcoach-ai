import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  height: number;
  currentWeight: number;
  targetWeight: number;
  biologicalSex: 'male' | 'female';
  vo2Max?: number;
  restingHeartRate?: number;
  maxHeartRate?: number;
  targetRace: {
    type: 'semi-marathon' | 'marathon' | '10k' | '5k';
    date: Date;
    targetTime?: number;
  };
  preferences: {
    weeklyWorkouts: number;
    preferredDays: string[];
    preferredTime: 'morning' | 'afternoon' | 'evening';
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  height: { type: Number, required: true },
  currentWeight: { type: Number, required: true },
  targetWeight: { type: Number, required: true },
  biologicalSex: { type: String, enum: ['male', 'female'], required: true },
  vo2Max: { type: Number },
  restingHeartRate: { type: Number },
  maxHeartRate: { type: Number },
  targetRace: {
    type: { type: String, enum: ['semi-marathon', 'marathon', '10k', '5k'], default: 'semi-marathon' },
    date: { type: Date, required: true },
    targetTime: { type: Number }
  },
  preferences: {
    weeklyWorkouts: { type: Number, default: 3 },
    preferredDays: [{ type: String }],
    preferredTime: { type: String, enum: ['morning', 'afternoon', 'evening'], default: 'morning' }
  }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);