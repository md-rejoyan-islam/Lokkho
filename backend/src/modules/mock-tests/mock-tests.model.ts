import mongoose, { Schema, Document, Types } from "mongoose";

export interface MockAnswer {
  questionId?: Types.ObjectId;
  selected: string;
  correct: boolean;
}

export interface IMockTestAttempt extends Document {
  userId: Types.ObjectId;
  moduleId: Types.ObjectId;
  score: number;
  total: number;
  answers: MockAnswer[];
}

const answerSchema = new Schema<MockAnswer>(
  {
    questionId: { type: Schema.Types.ObjectId, ref: "Question" },
    selected: { type: String, default: "" },
    correct: { type: Boolean, default: false },
  },
  { _id: false }
);

const mockTestAttemptSchema = new Schema<IMockTestAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    moduleId: { type: Schema.Types.ObjectId, ref: "ExamModule", required: true, index: true },
    score: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    answers: { type: [answerSchema], default: [] },
  },
  { timestamps: true }
);

export const MockTestAttempt = mongoose.model<IMockTestAttempt>("MockTestAttempt", mockTestAttemptSchema);
