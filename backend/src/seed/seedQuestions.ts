// Seeds real previous-year-style questions, linked to modules (and subjects) by name.
// Usage: npm run seed:questions
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../modules/users/users.model";
import { ExamModule } from "../modules/exam-modules/exam-modules.model";
import { Subject } from "../modules/subjects/subjects.model";
import { Question } from "../modules/questions/questions.model";
import questionsData from "../../data/questionsData.json";

async function run() {
  await connectDB();
  console.log("🌱 Seeding questions…");

  let user =
    (await User.findOne({ email: "demo@lokkho.com" }));
  if (!user) {
    user = new User({ name: "Demo User", email: "demo@lokkho.com" });
    await user.setPassword("demo123");
    await user.save();
  }

  const fallback = await ExamModule.findOne();
  let inserted = 0;
  let skipped = 0;

  // Clear previously-seeded sample questions (keep user-created ones is hard; we
  // simply remove ones matching our seeded question texts to stay idempotent).
  const texts = questionsData.map((q) => q.questionText);
  await Question.deleteMany({ questionText: { $in: texts }, createdBy: user._id });

  for (const q of questionsData as any[]) {
    const module =
      (await ExamModule.findOne({ title: q.module })) || fallback;
    if (!module) {
      skipped++;
      continue;
    }
    // best-effort subject link within that module
    let subjectId;
    if (q.subject) {
      const subj = await Subject.findOne({ moduleId: module._id, name: q.subject });
      if (subj) subjectId = subj._id;
    }

    await Question.create({
      moduleId: module._id,
      subjectId,
      year: q.year,
      examName: q.examName,
      type: "mcq",
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      createdBy: user._id,
    });
    inserted++;
  }

  console.log(`✅ Inserted ${inserted} questions (${skipped} skipped).`);
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("Questions seed failed:", err);
  process.exit(1);
});
