// Seeds ONLY the Resource collection. Usage: npm run seed:resources
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../modules/users/users.model";
import { Resource } from "../modules/resources/resources.model";
import resourcesData from "../../data/resourcesData.json";

async function run() {
  await connectDB();
  console.log("🌱 Seeding resources…");

  let user =
    (await User.findOne({ email: "demo@lokkho.com" }));
  if (!user) {
    user = new User({ name: "Demo User", email: "demo@lokkho.com" });
    await user.setPassword("demo123");
    await user.save();
  }

  await Resource.deleteMany({});
  const docs = resourcesData.map((r) => ({ ...r, createdBy: user._id }));
  const inserted = await Resource.insertMany(docs);
  console.log(`✅ Inserted ${inserted.length} resources.`);

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("Resources seed failed:", err);
  process.exit(1);
});
