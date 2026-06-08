import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  setPassword(plain: string): Promise<void>;
  comparePassword(plain: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (plain: string): Promise<void> {
  this.passwordHash = await bcrypt.hash(plain, 10);
};

userSchema.methods.comparePassword = function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash);
};

// Never leak passwordHash in JSON responses.
userSchema.set("toJSON", {
  transform(_doc, ret: any) {
    delete ret.passwordHash;
    return ret;
  },
});

export const User = mongoose.model<IUser>("User", userSchema);
