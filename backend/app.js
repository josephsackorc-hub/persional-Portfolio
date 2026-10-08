"use strict";

const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

const Submission = require("./models/Submission");
const { validateSubmission } = require("./validate");

const FRONTEND_DIR = path.join(__dirname, "..");
const SUCCESS_MESSAGE =
  "Thank you. Your message has been received and I will get back to you by email.";

function createApp() {
  const app = express();
  const isProd = process.env.NODE_ENV === "production";

  app.disable("x-powered-by");
  if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);

  // Security headers. The CSP allows only our own files plus Google Fonts.
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "style-src": ["'self'", "https://fonts.googleapis.com"],
          "font-src": ["'self'", "https://fonts.gstatic.com"],
          "img-src": ["'self'", "data:"],
          "connect-src": ["'self'"],
          "upgrade-insecure-requests": isProd ? [] : null,
        },
      },
    }),
  );

  // Only needed when the front end is served from another origin during development
  const allowedOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.use(
    "/api",
    cors({
      origin: (origin, callback) =>
        callback(null, !origin || allowedOrigins.includes(origin)),
      methods: ["GET", "POST"],
    }),
  );

  app.use(express.json({ limit: "10kb" }));

  // ---------------------------------------------------------------- API
  app.get("/api/health", (req, res) => {
    res.json({
      ok: true,
      database:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
  });

  // 5 submissions per IP every 15 minutes
  const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) =>
      res
        .status(429)
        .json({
          ok: false,
          message: "Too many messages sent. Please try again in a few minutes.",
        }),
  });

  app.post("/api/contact", contactLimiter, async (req, res) => {
    const body = req.body && typeof req.body === "object" ? req.body : {};

    // Honeypot: real visitors never see or fill this field. Bots usually do.
    // Pretend it worked so the bot learns nothing, but store nothing.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return res.status(201).json({ ok: true, message: SUCCESS_MESSAGE });
    }

    const { errors, values } = validateSubmission(body);
    if (errors) return res.status(400).json({ ok: false, errors });

    if (mongoose.connection.readyState !== 1) {
      return res
        .status(503)
        .json({
          ok: false,
          message:
            "The message service is temporarily unavailable. Please try again shortly.",
        });
    }

    try {
      await Submission.create(values);
      return res.status(201).json({ ok: true, message: SUCCESS_MESSAGE });
    } catch (error) {
      console.error("Failed to save submission:", error.message);
      return res
        .status(500)
        .json({
          ok: false,
          message: "Something went wrong on the server. Please try again.",
        });
    }
  });

  app.use("/api", (req, res) =>
    res.status(404).json({ ok: false, message: "Not found." }),
  );

  // ------------------------------------------- Front end (whitelisted only)
  // Never serve the whole project folder: it contains backend/.env
  ["css", "js", "assets"].forEach((dir) => {
    app.use(`/${dir}`, express.static(path.join(FRONTEND_DIR, dir)));
  });
  app.get("/", (req, res) =>
    res.sendFile(path.join(FRONTEND_DIR, "index.html")),
  );

  // ----------------------------------------------------- Error handling
  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    if (error.type === "entity.parse.failed")
      return res.status(400).json({ ok: false, message: "Invalid request." });
    if (error.type === "entity.too.large")
      return res.status(413).json({ ok: false, message: "Request too large." });
    console.error(error);
    res
      .status(500)
      .json({ ok: false, message: "Something went wrong on the server." });
  });

  return app;
}

module.exports = { createApp };
