import mongoose, { Schema, Document, Types } from "mongoose";

export interface INote extends Document {
  userId: Types.ObjectId;
  moduleId?: Types.ObjectId;
  subjectId?: Types.ObjectId;
  topicId?: Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
}

const noteSchema = new Schema<INote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    moduleId: { type: Schema.Types.ObjectId, ref: "ExamModule" },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject" },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Note = mongoose.model<INote>("Note", noteSchema);
