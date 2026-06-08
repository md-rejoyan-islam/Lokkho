import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBook extends Document {
  title: string;
  author: string;
  subject: string;
  examModuleId?: Types.ObjectId;
  description: string;
  coverUrl: string;
  buyLink: string;
  recommendedBy: Types.ObjectId;
}

const bookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, default: "", trim: true },
    subject: { type: String, default: "", trim: true, index: true },
    examModuleId: { type: Schema.Types.ObjectId, ref: "ExamModule" },
    description: { type: String, default: "" },
    coverUrl: { type: String, default: "" },
    buyLink: { type: String, default: "" },
    recommendedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Book = mongoose.model<IBook>("Book", bookSchema);
