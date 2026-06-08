// Seeds real exam-guides (modules). Idempotent: removes same-title guides then inserts.
// Preserves other existing modules (e.g. the demo BCS/Railway with subjects). Usage: npm run seed:modules
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../modules/users/users.model";
import { ExamModule } from "../modules/exam-modules/exam-modules.model";
import examGuidesData from "../../data/examGuidesData.json";

async function run() {
  await connectDB();
  console.log("🌱 Seeding exam guides…");

  let user =
    (await User.findOne({ email: "demo@lokkho.com" }));
  if (!user) {
    user = new User({ name: "Demo User", email: "demo@lokkho.com" });
    await user.setPassword("demo123");
    await user.save();
  }

  const titles = examGuidesData.map((g) => g.title);
  await ExamModule.deleteMany({ title: { $in: titles } });

  const docs = examGuidesData.map((g) => ({ ...g, createdBy: user._id }));
  const inserted = await ExamModule.insertMany(docs);

  const total = await ExamModule.countDocuments();
  console.log(`✅ Inserted ${inserted.length} exam guides. Total modules now: ${total}.`);

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("Modules seed failed:", err);
  process.exit(1);
});
