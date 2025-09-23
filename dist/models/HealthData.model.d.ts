import mongoose, { Document } from 'mongoose';
export interface IHealthData extends Document {
    userId: mongoose.Types.ObjectId;
    type: string;
    value: number;
    unit: string;
    date: Date;
    source: string;
    sourceVersion?: string;
    device?: string;
    appleHealthId?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IHealthData, {}, {}, {}, mongoose.Document<unknown, {}, IHealthData, {}, {}> & IHealthData & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=HealthData.model.d.ts.map