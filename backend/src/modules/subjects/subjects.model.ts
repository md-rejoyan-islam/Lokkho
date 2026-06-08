import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISubject extends Document {
  moduleId: Types.ObjectId;
  name: string;
  marks: number;
  note: string;
  order: number;
  createdBy: Types.ObjectId;
}

const subjectSchema = new Schema<ISubject>(
  {
    moduleId: { type: Schema.Types.ObjectId, ref: "ExamModule", required: true, index: true },
    name: { type: String, required: true, trim: true },
    marks: { type: Number, default: 0 },
    note: { type: String, default: "" },
    order: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Subject = mongoose.model<ISubject>("Subject", subjectSchema);
