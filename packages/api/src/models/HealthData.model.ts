import mongoose, { Schema, Document } from 'mongoose';

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

const HealthDataSchema = new Schema<IHealthData>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  value: { type: Number, required: true },
  unit: { type: String, required: true },
  date: { type: Date, required: true },
  source: { type: String, required: true },
  sourceVersion: { type: String },
  device: { type: String },
  appleHealthId: { type: String, sparse: true }
}, { timestamps: true });

HealthDataSchema.index({ userId: 1, type: 1, date: -1 });
HealthDataSchema.index({ appleHealthId: 1 }, { unique: true, sparse: true });

export default mongoose.model<IHealthData>('HealthData', HealthDataSchema);