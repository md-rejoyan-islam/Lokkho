import mongoose, { Schema, Document, Types } from "mongoose";

export const PLAN_ITEM_STATUSES = ["pending", "completed", "missed", "rescheduled"] as const;

export interface PlanItem {
  topicId?: Types.ObjectId;
  text?: string;
  targetMinutes: number;
  status: string;
}

export interface IStudyPlan extends Document {
  userId: Types.ObjectId;
  date: string;
  items: PlanItem[];
}

const planItemSchema = new Schema<PlanItem>(
  {
    topicId: { type: Schema.Types.ObjectId, ref: "Topic" },
    text: { type: String, trim: true },
    targetMinutes: { type: Number, default: 0 },
    status: { type: String, enum: PLAN_ITEM_STATUSES, default: "pending" },
  },
  { _id: true }
);

const studyPlanSchema = new Schema<IStudyPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // Stored as YYYY-MM-DD string for easy per-day querying.
    date: { type: String, required: true, index: true },
    items: { type: [planItemSchema], default: [] },
  },
  { timestamps: true }
);
studyPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

export const StudyPlan = mongoose.model<IStudyPlan>("StudyPlan", studyPlanSchema);
