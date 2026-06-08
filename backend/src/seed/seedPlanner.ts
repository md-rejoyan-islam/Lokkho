// Seeds demo study-plans for the demo user around "today". Usage: npm run seed:planner
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../modules/users/users.model";
import { StudyPlan } from "../modules/study-plans/study-plans.model";

// Local YYYY-MM-DD for an offset (in days) from today.
function dateStr(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// Rotating templates → applied across many days for realistic demo data.
const TEMPLATES = [
  [
    { text: "English — Tense revision", targetMinutes: 60 },
    { text: "Math — Percentage practice", targetMinutes: 90 },
    { text: "GK — Liberation War", targetMinutes: 45 },
  ],
  [
    { text: "Bangla — সন্ধি ও সমাস", targetMinutes: 60 },
    { text: "ICT — Number System", targetMinutes: 45 },
    { text: "Mock test (Bank)", targetMinutes: 60 },
  ],
  [
    { text: "English — Preposition & Article", targetMinutes: 60 },
    { text: "Math — Profit & Loss", targetMinutes: 90 },
    { text: "Bangladesh Affairs — Constitution", targetMinutes: 45 },
    { text: "Previous year question practice", targetMinutes: 30 },
  ],
  [
    { text: "Math — Time, Distance & Train", targetMinutes: 60 },
    { text: "Mental Ability — Series & Analogy", targetMinutes: 45 },
  ],
  [
    { text: "General Science — দৈনন্দিন বিজ্ঞান", targetMinutes: 50 },
    { text: "International Affairs — UN & Organizations", targetMinutes: 40 },
    { text: "Vocabulary — Synonym/Antonym", targetMinutes: 30 },
  ],
];

// Past days mostly completed/missed; today/future pending.
function statusFor(offset, idx) {
  if (offset < 0) return idx % 3 === 2 ? "missed" : "completed";
  if (offset === 0) return idx === 0 ? "completed" : "pending";
  return "pending";
}

// Build ~16 day-plans: offsets -10 .. +5
const PLANS = {};
for (let offset = -10; offset <= 5; offset++) {
  const tmpl = TEMPLATES[((offset % TEMPLATES.length) + TEMPLATES.length) % TEMPLATES.length];
  PLANS[offset] = tmpl.map((it, idx) => ({ ...it, status: statusFor(offset, idx) }));
}

async function run() {
  await connectDB();
  console.log("🌱 Seeding study planner…");

  let user =
    (await User.findOne({ email: "demo@lokkho.com" }));
  if (!user) {
    user = new User({ name: "Demo User", email: "demo@lokkho.com" });
    await user.setPassword("demo123");
    await user.save();
  }

  await StudyPlan.deleteMany({ userId: user._id });

  const docs = Object.entries(PLANS).map(([offset, items]) => ({
    userId: user._id,
    date: dateStr(Number(offset)),
    items,
  }));
  await StudyPlan.insertMany(docs);

  console.log(
    `✅ Inserted ${docs.length} day-plans for ${user.email}: ${docs
      .map((d) => d.date)
      .join(", ")}`
  );

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("Planner seed failed:", err);
  process.exit(1);
});
