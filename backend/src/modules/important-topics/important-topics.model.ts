import mongoose, { Schema, Document, Types } from "mongoose";
import { MODULE_CATEGORIES } from "../exam-modules/exam-modules.model";
import { PROGRESS_STATUSES } from "../progress/progress.model";

export const IMPORTANT_PRIORITIES = ["high", "medium", "low"] as const;

// ---- Important Subject (grouping) ----
export interface IImportantSubject extends Document {
  name: string;
  note: string;
  createdBy: Types.ObjectId;
}

const importantSubjectSchema = new Schema<IImportantSubject>(
  {
    name: { type: String, required: true, trim: true },
    note: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const ImportantSubject = mongoose.model<IImportantSubject>(
  "ImportantSubject",
  importantSubjectSchema
);

// ---- Important Topic ----
export interface IImportantTopic extends Document {
  title: string;
  subjectId?: Types.ObjectId;
  subject: string;
  category: string;
  priority: string;
  note: string;
  tags: string[];
  createdBy: Types.ObjectId;
}

const importantTopicSchema = new Schema<IImportantTopic>(
  {
    title: { type: String, required: true, trim: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "ImportantSubject", index: true },
    subject: { type: String, default: "", trim: true },
    category: { type: String, enum: MODULE_CATEGORIES, default: "Other" },
    priority: { type: String, enum: IMPORTANT_PRIORITIES, default: "medium", index: true },
    note: { type: String, default: "" },
    tags: { type: [String], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const ImportantTopic = mongoose.model<IImportantTopic>("ImportantTopic", importantTopicSchema);

// ---- Personal status on important topics ----
export interface IUserImportantProgress extends Document {
  userId: Types.ObjectId;
  importantTopicId: Types.ObjectId;
  importantSubjectId?: Types.ObjectId;
  status: string;
}

const userImportantProgressSchema = new Schema<IUserImportantProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    importantTopicId: { type: Schema.Types.ObjectId, ref: "ImportantTopic", required: true },
    importantSubjectId: { type: Schema.Types.ObjectId, ref: "ImportantSubject", index: true },
    status: { type: String, enum: PROGRESS_STATUSES, default: "not_started" },
  },
  { timestamps: true }
);
userImportantProgressSchema.index({ userId: 1, importantTopicId: 1 }, { unique: true });

export const UserImportantProgress = mongoose.model<IUserImportantProgress>(
  "UserImportantProgress",
  userImportantProgressSchema
);
