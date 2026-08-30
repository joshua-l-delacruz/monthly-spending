"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const login = require("../api/auth/login.js");
const session = require("../api/auth/session.js");
const approve = require("../api/payments/approve.js");
const complete = require("../api/payments/complete.js");

function responseRecorder() {
  return {
    headers: {},
    statusCode: 200,
    body: null,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

test("login rejects a missing Pi token", async () => {
  const res = responseRecorder();
  await login({ method: "POST", body: {} }, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /access token is required/i);
});

test("session rejects a missing signed cookie", async () => {
  const res = responseRecorder();
  await session({ method: "GET", headers: {} }, res);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.authenticated, false);
});

test("payment approval fails closed by default", async () => {
  const res = responseRecorder();
  await approve({ method: "POST", body: { paymentId: "demo" } }, res);
  assert.equal(res.statusCode, 503);
});

test("payment completion fails closed by default", async () => {
  const res = responseRecorder();
  await complete({ method: "POST", body: { paymentId: "demo", txid: "demo" } }, res);
  assert.equal(res.statusCode, 503);
});
