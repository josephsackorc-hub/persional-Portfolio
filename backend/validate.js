"use strict";

/**
 * Server-side validation for the contact form.
 * The front end validates too, but the server never trusts the client.
 * Only plain strings are accepted, which also blocks NoSQL operator
 * objects such as { "$gt": "" } from reaching the database.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const LIMITS = {
  fullName: { min: 2, max: 100 },
  email: { max: 254 },
  projectDetails: { min: 20, max: 2000 },
};

function clean(value) {
  return typeof value === "string" ? value.replace(CONTROL_CHARS, "").trim() : null;
}

function validateSubmission(body) {
  const errors = {};

  const fullName = clean(body.fullName);
  const email = clean(body.email);
  const projectDetails = clean(body.projectDetails);

  if (fullName === null || fullName.length < LIMITS.fullName.min) {
    errors.fullName = "Please enter your full name.";
  } else if (fullName.length > LIMITS.fullName.max) {
    errors.fullName = `Please keep your name under ${LIMITS.fullName.max} characters.`;
  }

  if (email === null || !EMAIL_RE.test(email)) {
    errors.email = "Please enter a valid email address.";
  } else if (email.length > LIMITS.email.max) {
    errors.email = "That email address is too long.";
  }

  if (projectDetails === null || projectDetails.length < LIMITS.projectDetails.min) {
    errors.projectDetails = `Please share a few details (at least ${LIMITS.projectDetails.min} characters).`;
  } else if (projectDetails.length > LIMITS.projectDetails.max) {
    errors.projectDetails = `Please keep the details under ${LIMITS.projectDetails.max} characters.`;
  }

  if (Object.keys(errors).length > 0) return { errors, values: null };
  return { errors: null, values: { fullName, email, projectDetails } };
}

module.exports = { validateSubmission, LIMITS };
