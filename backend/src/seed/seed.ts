// Seeds sample data. Usage: npm run seed
import mongoose from "mongoose";
import { env } from "../config/env";
import { connectDB } from "../config/db";
import { User } from "../modules/users/users.model";
import { ExamModule } from "../modules/exam-modules/exam-modules.model";
import { Subject } from "../modules/subjects/subjects.model";
import { Topic } from "../modules/topics/topics.model";
import { Question } from "../modules/questions/questions.model";
import { Book } from "../modules/books/books.model";
import { Job } from "../modules/jobs/jobs.model";
import { Resource } from "../modules/resources/resources.model";
import jobsData from "../../data/jobsData.json";

async function run() {
  await connectDB();
  console.log("🌱 Seeding…");

  // Wipe content collections (keeps it idempotent for dev)
  await Promise.all([
    ExamModule.deleteMany({}),
    Subject.deleteMany({}),
    Topic.deleteMany({}),
    Question.deleteMany({}),
    Book.deleteMany({}),
    Job.deleteMany({}),
    Resource.deleteMany({}),
  ]);

  // Demo user
  let user = await User.findOne({ email: "demo@lokkho.com" });
  if (!user) {
    user = new User({ name: "Demo User", email: "demo@lokkho.com" });
    await user.setPassword("demo123");
    await user.save();
  }
  const uid = user._id;

  // ---- BCS module ----
  const bcs = await ExamModule.create({
    title: "BCS Preliminary",
    category: "BCS",
    description: "Bangladesh Civil Service preliminary preparation.",
    totalMarks: 200,
    durationMinutes: 120,
    examPattern: [
      { section: "Bangla", marks: 35, questionCount: 35 },
      { section: "English", marks: 35, questionCount: 35 },
      { section: "Bangladesh Affairs", marks: 30, questionCount: 30 },
      { section: "International Affairs", marks: 20, questionCount: 20 },
      { section: "Math", marks: 15, questionCount: 15 },
      { section: "Mental Ability", marks: 15, questionCount: 15 },
      { section: "Science", marks: 15, questionCount: 15 },
      { section: "ICT", marks: 15, questionCount: 15 },
      { section: "Ethics", marks: 10, questionCount: 10 },
      { section: "Geography", marks: 10, questionCount: 10 },
    ],
    createdBy: uid,
  });

  const english = await Subject.create({
    moduleId: bcs._id,
    name: "English",
    marks: 35,
    order: 2,
    createdBy: uid,
  });
  const prep = await Topic.create({
    subjectId: english._id,
    moduleId: bcs._id,
    title: "Preposition",
    priority: "high",
    difficulty: "medium",
    createdBy: uid,
  });
  await Topic.create({
    subjectId: english._id,
    moduleId: bcs._id,
    title: "Tense",
    priority: "high",
    createdBy: uid,
  });

  await Question.create({
    moduleId: bcs._id,
    subjectId: english._id,
    topicId: prep._id,
    year: 2023,
    examName: "BCS Preliminary",
    type: "mcq",
    questionText: "He is good ___ mathematics.",
    options: ["in", "at", "on", "with"],
    correctAnswer: "at",
    explanation: "good at + subject/skill",
    createdBy: uid,
  });

  // ---- Railway module (the user's example) ----
  const railway = await ExamModule.create({
    title: "Railway Exam (Grade-2)",
    category: "Railway",
    description: "Bangladesh Railway recruitment exam preparation.",
    totalMarks: 100,
    durationMinutes: 90,
    examPattern: [
      { section: "Bangla", marks: 20, questionCount: 20 },
      { section: "English", marks: 20, questionCount: 20 },
      { section: "Math", marks: 20, questionCount: 20 },
      { section: "General Knowledge", marks: 20, questionCount: 20 },
      { section: "Technical/Mechanical", marks: 20, questionCount: 20 },
    ],
    createdBy: uid,
  });
  const railMath = await Subject.create({
    moduleId: railway._id,
    name: "Math",
    marks: 20,
    order: 3,
    createdBy: uid,
  });
  await Topic.create({
    subjectId: railMath._id,
    moduleId: railway._id,
    title: "Percentage",
    priority: "medium",
    createdBy: uid,
  });

  // ---- Books ----
  await Book.insertMany([
    {
      title: "Professor's BCS Preliminary Digest",
      author: "Professor's Publication",
      subject: "BCS",
      examModuleId: bcs._id,
      description: "Comprehensive BCS preliminary guide.",
      recommendedBy: uid,
    },
    {
      title: "Saifur's English Grammar",
      author: "Saifur Rahman Khan",
      subject: "English",
      description: "Popular grammar book for competitive exams.",
      recommendedBy: uid,
    },
  ]);

  // ---- Jobs (real sector data, 30+) ----
  await Job.insertMany(jobsData.map((j) => ({ ...j, createdBy: uid })));

  // ---- Resources ----
  await Resource.insertMany([
    {
      title: "চাকরির আবেদনে যেসব ডকুমেন্ট লাগে",
      category: "documents",
      content:
        "জাতীয় পরিচয়পত্র, শিক্ষাগত সনদ, পাসপোর্ট সাইজ ছবি, স্বাক্ষর, অভিজ্ঞতা সনদ (যদি থাকে)।",
      tags: ["documents", "application"],
      createdBy: uid,
    },
    {
      title: "সরকারি চাকরির পেনশন সম্পর্কে জানুন",
      category: "general",
      content:
        "সরকারি চাকরিতে নির্দিষ্ট চাকরিকাল পূর্ণ হলে অবসরে পেনশন ও আনুতোষিক পাওয়া যায়।",
      tags: ["pension", "govt"],
      createdBy: uid,
    },
  ]);

  console.log("✅ Seed complete. Demo login: demo@lokkho.com / demo123");
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
