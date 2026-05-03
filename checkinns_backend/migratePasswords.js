import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import bcryptjs from "bcryptjs";

connectDB();

async function migratePasswords() {
  try {
    const users = await User.find();
    console.log(`Found ${users.length} users to migrate`);

    let migratedCount = 0;
    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
      if (!user.password.startsWith("$2")) {
        console.log(`Hashing password for ${user.email}`);
        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(user.password, salt);
        await user.save();
        console.log(`✓ Hashed password for ${user.email}`);
        migratedCount++;
      } else {
        console.log(`✓ ${user.email} already has hashed password`);
      }
    }
    console.log(`\nMigrated ${migratedCount} users with plain text passwords`);

    console.log("✓ Password migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

migratePasswords();
