// Seeds demo job-applications for the demo user. Usage: npm run seed:applications
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../modules/users/users.model";
import { JobApplication } from "../modules/applications/applications.model";
import applicationsData from "../../data/applicationsData.json";

async function run() {
  await connectDB();
  console.log("🌱 Seeding job applications…");

  let user =
    (await User.findOne({ email: "demo@lokkho.com" }));
  if (!user) {
    user = new User({ name: "Demo User", email: "demo@lokkho.com" });
    await user.setPassword("demo123");
    await user.save();
  }

  await JobApplication.deleteMany({ userId: user._id });
  const docs = applicationsData.map((a) => ({ ...a, userId: user._id }));
  const inserted = await JobApplication.insertMany(docs);

  const applied = inserted.filter((a) => a.isApplied).length;
  console.log(
    `✅ Inserted ${inserted.length} applications for ${user.email} — ${applied} applied, ${inserted.length - applied} not applied.`
  );

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("Applications seed failed:", err);
  process.exit(1);
});
