// src/test/setupTests.js
import "@testing-library/jest-dom";

const IGNORE_WARN = ["React Router Future Flag Warning"];

// --- WARN ---
const originalWarn = console.warn;
console.warn = (...args) => {
  const msg = String(args[0] ?? "");
  if (IGNORE_WARN.some((x) => msg.includes(x))) return;
  originalWarn(...args);
};

const IGNORE_ERROR = [
  "getUserProfile error:",
  "updateUserProfile error:",
  "changePassword error:",
];

const originalError = console.error;
console.error = (...args) => {
  const msg = String(args[0] ?? "");
  if (IGNORE_ERROR.some((x) => msg.includes(x))) return;
  originalError(...args);
};
