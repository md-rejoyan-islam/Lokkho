import mongoose, { Schema, Document, Types } from "mongoose";

// General "things a job seeker should know" — documents, process, tips, circulars.
export const RESOURCE_CATEGORIES = ["documents", "process", "tips", "circular", "general"] as const;

export interface IResource extends Document {
  title: string;
  category: string;
  content: string;
  link: string;
  tags: string[];
  createdBy: Types.ObjectId;
}

const resourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, enum: RESOURCE_CATEGORIES, default: "general", index: true },
    content: { type: String, default: "" },
    link: { type: String, default: "" },
    tags: { type: [String], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Resource = mongoose.model<IResource>("Resource", resourceSchema);
