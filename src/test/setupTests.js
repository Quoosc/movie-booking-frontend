import "@testing-library/jest-dom";

const IGNORE = ["React Router Future Flag Warning"];

const originalWarn = console.warn;
console.warn = (...args) => {
  const msg = String(args[0] ?? "");
  if (IGNORE.some((x) => msg.includes(x))) return;
  originalWarn(...args);
};
