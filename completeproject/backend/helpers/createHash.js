const bcrypt = require("bcrypt");

console.log("Script is running...");

const saltRounds = 10;

async function createHash(password) {
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log("Hashed Password:", hash);
    return hash;
  } catch (err) {
    console.error("Error:", err);
    return err;
  }
}

module.exports = createHash;

// Call the function to generate a hash for "admin123"

