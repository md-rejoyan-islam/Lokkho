import mongoose, { Schema, Document, Types } from "mongoose";

export const STAGE_STATUSES = ["pending", "passed", "failed"] as const;

export interface Stage {
  name: string;
  status: string;
}

export interface IJobApplication extends Document {
  userId: Types.ObjectId;
  jobName: string;
  organization: string;
  isApplied: boolean;
  appliedDate?: Date;
  examDate?: Date;
  stages: Stage[];
  notes: string;
  link: string;
}

// A configurable selection stage, e.g. "Preliminary", "Written", "Viva".
const stageSchema = new Schema<Stage>(
  {
    name: { type: String, required: true, trim: true },
    status: { type: String, enum: STAGE_STATUSES, default: "pending" },
  },
  { _id: true }
);

const jobApplicationSchema = new Schema<IJobApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobName: { type: String, required: true, trim: true },
    organization: { type: String, default: "", trim: true },
    isApplied: { type: Boolean, default: false, index: true },
    appliedDate: { type: Date },
    examDate: { type: Date },
    stages: { type: [stageSchema], default: [] },
    notes: { type: String, default: "" },
    link: { type: String, default: "" },
  },
  { timestamps: true }
);

export const JobApplication = mongoose.model<IJobApplication>("JobApplication", jobApplicationSchema);
