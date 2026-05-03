import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Owner from "./models/Owner.js";
import bcryptjs from "bcryptjs";

connectDB();

async function migrateOwnerPasswords() {
  try {
    const owners = await Owner.find();
    console.log(`Found ${owners.length} owners to migrate`);

    let migratedCount = 0;
    for (const owner of owners) {
      // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
      if (!owner.password.startsWith("$2")) {
        console.log(`Hashing password for ${owner.email}`);
        const salt = await bcryptjs.genSalt(10);
        owner.password = await bcryptjs.hash(owner.password, salt);
        await owner.save();
        console.log(`✓ Hashed password for ${owner.email}`);
        migratedCount++;
      } else {
        console.log(`✓ ${owner.email} already has hashed password`);
      }
    }
    console.log(`\nMigrated ${migratedCount} owners with plain text passwords`);
    console.log("✓ Owner password migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

migrateOwnerPasswords();
