import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.model.d.ts.map