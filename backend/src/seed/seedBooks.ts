// Seeds ONLY the Book collection with real recommended books. Usage: npm run seed:books
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../modules/users/users.model";
import { Book } from "../modules/books/books.model";
import booksData from "../../data/booksData.json";

async function run() {
  await connectDB();
  console.log("🌱 Seeding books…");

  let user =
    (await User.findOne({ email: "demo@lokkho.com" }));
  if (!user) {
    user = new User({ name: "Demo User", email: "demo@lokkho.com" });
    await user.setPassword("demo123");
    await user.save();
  }

  await Book.deleteMany({});
  const docs = booksData.map((b) => ({ ...b, recommendedBy: user._id }));
  const inserted = await Book.insertMany(docs);
  console.log(`✅ Inserted ${inserted.length} books.`);

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("Books seed failed:", err);
  process.exit(1);
});
