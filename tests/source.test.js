"use strict";

const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const root = path.join(__dirname, "..");
const read = (file) => readFileSync(path.join(root, file), "utf8");

test("JavaScript sources pass syntax checks", () => {
  for (const file of [
    "app.js",
    "api/auth/login.js",
    "api/auth/session.js",
    "api/payments/approve.js",
    "api/payments/complete.js"
  ]) {
    const result = spawnSync(process.execPath, ["--check", file], {
      cwd: root,
      encoding: "utf8"
    });
    assert.equal(result.status, 0, `${file}: ${result.stderr}`);
  }
});

test("public metadata uses the branded domain", () => {
  const html = read("index.html");
  assert.match(html, /rel="canonical" href="https:\/\/spending\.joshuadelacruz\.solutions\//);
  assert.match(html, /property="og:url" content="https:\/\/spending\.joshuadelacruz\.solutions\//);
});

test("financial data boundary is explicit", () => {
  const readme = read("README.md");
  assert.match(readme, /expense and budget records.*localStorage only/);
  assert.match(readme, /No cloud backup or cross-device synchronization/);
  assert.match(readme, /Pi identity verification does not mean that financial records are synchronized/);
});

test("premium purchases fail closed in browser and server", () => {
  const browser = read("app.js");
  const approve = read("api/payments/approve.js");
  const complete = read("api/payments/complete.js");
  assert.match(browser, /const PREMIUM_PURCHASES_ENABLED =\s*false/);
  assert.match(approve, /process\.env\.PREMIUM_PURCHASES_ENABLED !== "true"/);
  assert.match(complete, /process\.env\.PREMIUM_PURCHASES_ENABLED !== "true"/);
});
