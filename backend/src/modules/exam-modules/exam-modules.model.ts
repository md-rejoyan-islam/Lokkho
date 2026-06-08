import mongoose, { Schema, Document, Types } from "mongoose";

export const MODULE_CATEGORIES = ["BCS", "Bank", "Primary", "NTRCA", "Railway", "Other"] as const;

export interface PatternRow {
  section: string;
  marks: number;
  questionCount: number;
}

export interface IExamModule extends Document {
  title: string;
  category: string;
  description: string;
  totalMarks: number;
  durationMinutes: number;
  examPattern: PatternRow[];
  minCgpa: string;
  degree: string;
  eligibility: string;
  createdBy: Types.ObjectId;
}

const patternRowSchema = new Schema<PatternRow>(
  {
    section: { type: String, required: true, trim: true },
    marks: { type: Number, default: 0 },
    questionCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const examModuleSchema = new Schema<IExamModule>(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, default: "Other", trim: true, index: true },
    description: { type: String, default: "" },
    totalMarks: { type: Number, default: 0 },
    durationMinutes: { type: Number, default: 0 },
    examPattern: { type: [patternRowSchema], default: [] },
    minCgpa: { type: String, default: "" },
    degree: { type: String, default: "" },
    eligibility: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

examModuleSchema.index({ title: "text", description: "text" });

export const ExamModule = mongoose.model<IExamModule>("ExamModule", examModuleSchema);
