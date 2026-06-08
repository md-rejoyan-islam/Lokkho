import mongoose, { Schema, Document, Types } from "mongoose";

export const TOPIC_PRIORITIES = ["low", "medium", "high"] as const;
export const TOPIC_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export interface ITopic extends Document {
  subjectId: Types.ObjectId;
  moduleId: Types.ObjectId;
  title: string;
  priority: string;
  difficulty: string;
  order: number;
  createdBy: Types.ObjectId;
}

const topicSchema = new Schema<ITopic>(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
    moduleId: { type: Schema.Types.ObjectId, ref: "ExamModule", required: true, index: true },
    title: { type: String, required: true, trim: true },
    priority: { type: String, enum: TOPIC_PRIORITIES, default: "medium" },
    difficulty: { type: String, enum: TOPIC_DIFFICULTIES, default: "medium" },
    order: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Topic = mongoose.model<ITopic>("Topic", topicSchema);
