import mongoose from "mongoose";
import { connectDB } from "../config/db";
import {
  cloneStarterData,
  purgeOwnedContent,
  TEMPLATE_EMAIL,
} from "../modules/onboarding/onboarding.service";
import { User } from "../modules/users/users.model";

async function run() {
  await connectDB();
  const users = await User.find({ email: { $ne: TEMPLATE_EMAIL } });
  console.log(`🌱 Cloning starter data to ${users.length} existing user(s)…`);
  for (const u of users) {
    await purgeOwnedContent(u._id); // reset any partial/previous clone
    await cloneStarterData(u._id);
    console.log(`  ✓ ${u.email}`);
  }
  console.log("✅ Done.");
  await mongoose.connection.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
