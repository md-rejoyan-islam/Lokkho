import mongoose, { Schema, Document, Types } from "mongoose";

export const QUESTION_TYPES = ["mcq", "written"] as const;

export interface IQuestion extends Document {
  moduleId: Types.ObjectId;
  subjectId?: Types.ObjectId;
  topicId?: Types.ObjectId;
  year?: number;
  examName?: string;
  type: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  createdBy: Types.ObjectId;
}

const questionSchema = new Schema<IQuestion>(
  {
    moduleId: { type: Schema.Types.ObjectId, ref: "ExamModule", required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", index: true },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", index: true },
    year: { type: Number },
    examName: { type: String, trim: true },
    type: { type: String, enum: QUESTION_TYPES, default: "mcq" },
    questionText: { type: String, required: true },
    options: { type: [String], default: [] },
    correctAnswer: { type: String, default: "" },
    explanation: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Question = mongoose.model<IQuestion>("Question", questionSchema);
