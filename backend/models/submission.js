"use strict";

const mongoose = require("mongoose");

/**
 * One document per contact form submission.
 * Database: "portfolio" (from MONGODB_URI)   Collection: "submissions"
 */
const submissionSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    projectDetails: { type: String, required: true, trim: true, minlength: 20, maxlength: 2000 },
    // Handy for managing the inbox later (admin page or Compass filters)
    status: { type: String, enum: ["new", "read", "replied", "archived"], default: "new" },
  },
  {
    collection: "submissions",
    timestamps: true,     // adds createdAt and updatedAt
    bufferCommands: false // fail fast instead of hanging if the database is down
  }
);

module.exports = mongoose.model("Submission", submissionSchema);
