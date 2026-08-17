"use strict";

const crypto = require("crypto");


function parseCookies(cookieHeader) {

  const cookies = {};

  if (!cookieHeader) {
    return cookies;
  }

  cookieHeader
    .split(";")
    .forEach((part) => {

      const index =
        part.indexOf("=");

      if (index === -1) {
        return;
      }

      const name =
        part
          .slice(0, index)
          .trim();

      const value =
        part
          .slice(index + 1)
          .trim();

      cookies[name] =
        decodeURIComponent(value);

    });

  return cookies;
}


function timingSafeEqualStrings(
  first,
  second
) {

  const firstBuffer =
    Buffer.from(first);

  const secondBuffer =
    Buffer.from(second);

  if (
    firstBuffer.length !==
    secondBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    firstBuffer,
    secondBuffer
  );
}


function verifySessionToken(token) {

  const secret =
    process.env.SESSION_SECRET;

  if (!secret) {
    return null;
  }

  if (
    typeof token !== "string" ||
    !token.includes(".")
  ) {
    return null;
  }

  const separator =
    token.lastIndexOf(".");

  const payload =
    token.slice(0, separator);

  const signature =
    token.slice(separator + 1);

  const expectedSignature =
    crypto
      .createHmac(
        "sha256",
        secret
      )
      .update(payload)
      .digest("base64url");

  if (
    !timingSafeEqualStrings(
      signature,
      expectedSignature
    )
  ) {
    return null;
  }

  try {

    const user =
      JSON.parse(
        Buffer.from(
          payload,
          "base64url"
        ).toString("utf8")
      );

    if (
      typeof user.uid !== "string" ||
      typeof user.username !== "string"
    ) {
      return null;
    }

    /*
     * Seven-day session.
     */
    if (
      Date.now() -
        Number(user.createdAt) >
      604800000
    ) {
      return null;
    }

    return {
      uid: user.uid,
      username: user.username
    };

  } catch {

    return null;
  }
}


module.exports = async function handler(
  req,
  res
) {

  if (req.method !== "GET") {

    res.setHeader(
      "Allow",
      "GET"
    );

    return res.status(405).json({
      error: "Method not allowed."
    });
  }

  const cookies =
    parseCookies(
      req.headers.cookie
    );

  const user =
    verifySessionToken(
      cookies.pi_session
    );

  if (!user) {

    return res.status(401).json({
      authenticated: false
    });
  }

  return res.status(200).json({
    authenticated: true,
    user
  });
};
