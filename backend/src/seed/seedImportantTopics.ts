// Seeds Important Subjects + their Topics (subject-wise). Usage: npm run seed:topics
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../modules/users/users.model";
import { ImportantSubject } from "../modules/important-topics/important-topics.model";
import { ImportantTopic } from "../modules/important-topics/important-topics.model";
import importantTopicsData from "../../data/importantTopicsData.json";

async function run() {
  await connectDB();
  console.log("🌱 Seeding important subjects + topics…");

  let user =
    (await User.findOne({ email: "demo@lokkho.com" }));
  if (!user) {
    user = new User({ name: "Demo User", email: "demo@lokkho.com" });
    await user.setPassword("demo123");
    await user.save();
  }

  await Promise.all([ImportantSubject.deleteMany({}), ImportantTopic.deleteMany({})]);

  // group flat data by subject name
  const groups: Record<string, any[]> = {};
  for (const t of importantTopicsData) {
    const key = t.subject || "Other";
    (groups[key] ||= []).push(t);
  }

  let subjectCount = 0;
  let topicCount = 0;
  for (const [name, topics] of Object.entries(groups)) {
    const subject = await ImportantSubject.create({ name, createdBy: user._id });
    subjectCount++;
    await ImportantTopic.insertMany(
      topics.map((t) => ({
        subjectId: subject._id,
        title: t.title,
        priority: t.priority || "medium",
        note: t.note || "",
        createdBy: user._id,
      }))
    );
    topicCount += topics.length;
  }

  console.log(`✅ Inserted ${subjectCount} subjects & ${topicCount} topics.`);
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("Important-topics seed failed:", err);
  process.exit(1);
});
