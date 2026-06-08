// Seeds ONLY the Job collection with real sector data. Other collections untouched.
// Usage: npm run seed:jobs
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../modules/users/users.model";
import { Job } from "../modules/jobs/jobs.model";
import jobsData from "../../data/jobsData.json";

async function run() {
  await connectDB();
  console.log("🌱 Seeding jobs…");

  // Owner: demo user if present, else the first user, else create demo.
  let user =
    (await User.findOne({ email: "demo@lokkho.com" }));
  if (!user) {
    user = new User({ name: "Demo User", email: "demo@lokkho.com" });
    await user.setPassword("demo123");
    await user.save();
  }

  await Job.deleteMany({});
  const docs = jobsData.map((j) => ({ ...j, createdBy: user._id }));
  const inserted = await Job.insertMany(docs);

  const gov = inserted.filter((j) => j.category === "government").length;
  const nonGov = inserted.filter((j) => j.category === "non_government").length;
  const pension = inserted.filter((j) => j.pensionIncluded).length;
  console.log(
    `✅ Inserted ${inserted.length} jobs — ${gov} govt, ${nonGov} non-govt, ${pension} pension-included.`
  );

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("Job seed failed:", err);
  process.exit(1);
});
