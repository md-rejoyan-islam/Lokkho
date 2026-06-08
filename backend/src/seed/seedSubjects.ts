// Seeds real subjects + topics into modules that have none (from each module's
// examPattern sections + the syllabus topic library). Non-destructive: skips
// modules that already have subjects. Usage: npm run seed:subjects
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../modules/users/users.model";
import { ExamModule } from "../modules/exam-modules/exam-modules.model";
import { Subject } from "../modules/subjects/subjects.model";
import { Topic } from "../modules/topics/topics.model";
import { topicsForSection, noteForSection } from "./subjectTopicsData";

async function run() {
  await connectDB();
  console.log("🌱 Seeding subjects + topics…");

  let user =
    (await User.findOne({ email: "demo@lokkho.com" }));
  if (!user) {
    user = new User({ name: "Demo User", email: "demo@lokkho.com" });
    await user.setPassword("demo123");
    await user.save();
  }

  const modules = await ExamModule.find();
  let subjectsCreated = 0;
  let topicsCreated = 0;
  let modulesTouched = 0;

  for (const m of modules) {
    if (!m.examPattern?.length) continue;

    // Re-runnable: clear previously auto-seeded subjects/topics for this module.
    const subs = await Subject.find({ moduleId: m._id }).select("_id");
    if (subs.length) {
      await Topic.deleteMany({ subjectId: { $in: subs.map((s) => s._id) } });
      await Subject.deleteMany({ moduleId: m._id });
    }

    modulesTouched++;
    for (let i = 0; i < m.examPattern.length; i++) {
      const section = m.examPattern[i];
      const subject = await Subject.create({
        moduleId: m._id,
        name: section.section,
        marks: section.marks || 0,
        note: noteForSection(section.section),
        order: i,
        createdBy: user._id,
      });
      subjectsCreated++;

      const topics = topicsForSection(section.section);
      if (topics.length) {
        await Topic.insertMany(
          topics.map((t, ti) => ({
            subjectId: subject._id,
            moduleId: m._id,
            title: t,
            priority: ti < 4 ? "high" : "medium",
            difficulty: "medium",
            order: ti,
            createdBy: user._id,
          }))
        );
        topicsCreated += topics.length;
      }
    }
  }

  console.log(
    `✅ Touched ${modulesTouched} modules — created ${subjectsCreated} subjects & ${topicsCreated} topics.`
  );

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("Subjects seed failed:", err);
  process.exit(1);
});
