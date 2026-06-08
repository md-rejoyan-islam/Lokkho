import mongoose, { Schema, Document, Types } from "mongoose";

export const JOB_CATEGORIES = ["government", "non_government", "other"] as const;

export interface IJob extends Document {
  title: string;
  organization: string;
  category: string;
  pensionIncluded: boolean;
  sector: string;
  qualification: string;
  ageLimit: string;
  salaryScale: string;
  description: string;
  applyLink: string;
  source: string;
  deadline?: Date;
  tags: string[];
  createdBy: Types.ObjectId;
}

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    organization: { type: String, default: "", trim: true },
    category: { type: String, enum: JOB_CATEGORIES, default: "government", index: true },
    pensionIncluded: { type: Boolean, default: false, index: true },
    sector: { type: String, default: "" },
    qualification: { type: String, default: "" },
    ageLimit: { type: String, default: "" },
    salaryScale: { type: String, default: "" },
    description: { type: String, default: "" },
    applyLink: { type: String, default: "" },
    source: { type: String, default: "" },
    deadline: { type: Date },
    tags: { type: [String], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

jobSchema.index({ title: "text", organization: "text", description: "text" });

export const Job = mongoose.model<IJob>("Job", jobSchema);
