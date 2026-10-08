"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const { createApp } = require("./app");

const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set. Copy .env.example to .env and fill it in.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  } catch (error) {
    console.error("Could not connect to MongoDB:", error.message);
    console.error("Is MongoDB running, and is MONGODB_URI correct?");
    process.exit(1);
  }
  console.log(`Connected to MongoDB (database: ${mongoose.connection.name})`);

  const server = createApp().listen(PORT, () => {
    console.log(`Portfolio running at http://localhost:${PORT}`);
  });

  const shutdown = () => {
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main();
