import mongoose, { Schema, Document, Types } from "mongoose";

export const PROGRESS_STATUSES = [
  "not_started",
  "in_progress",
  "completed",
  "need_revision",
  "weak",
] as const;

export interface IUserTopicProgress extends Document {
  userId: Types.ObjectId;
  topicId: Types.ObjectId;
  moduleId?: Types.ObjectId;
  status: string;
  revisionDate?: Date;
  lastStudiedAt?: Date;
}

const userTopicProgressSchema = new Schema<IUserTopicProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true },
    moduleId: { type: Schema.Types.ObjectId, ref: "ExamModule", index: true },
    status: { type: String, enum: PROGRESS_STATUSES, default: "not_started" },
    revisionDate: { type: Date },
    lastStudiedAt: { type: Date },
  },
  { timestamps: true }
);
userTopicProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });

export const UserTopicProgress = mongoose.model<IUserTopicProgress>(
  "UserTopicProgress",
  userTopicProgressSchema
);

export interface IUserSubjectProgress extends Document {
  userId: Types.ObjectId;
  subjectId: Types.ObjectId;
  moduleId?: Types.ObjectId;
  status: string;
  revisionDate?: Date;
  lastStudiedAt?: Date;
}

const userSubjectProgressSchema = new Schema<IUserSubjectProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    moduleId: { type: Schema.Types.ObjectId, ref: "ExamModule", index: true },
    status: { type: String, enum: PROGRESS_STATUSES, default: "not_started" },
    revisionDate: { type: Date },
    lastStudiedAt: { type: Date },
  },
  { timestamps: true }
);
userSubjectProgressSchema.index({ userId: 1, subjectId: 1 }, { unique: true });

export const UserSubjectProgress = mongoose.model<IUserSubjectProgress>(
  "UserSubjectProgress",
  userSubjectProgressSchema
);
