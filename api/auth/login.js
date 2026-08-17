"use strict";

/*
 * Vercel Serverless Function
 *
 * Receives the Pi access token from the browser.
 *
 * The token is validated directly against:
 *
 * GET https://api.minepi.com/v2/me
 *
 * No Pi Network API key is required for this flow.
 */

const crypto = require("crypto");

const PI_ME_ENDPOINT =
  "https://api.minepi.com/v2/me";


function sendJson(res, statusCode, payload) {

  res.status(statusCode);

  res.setHeader(
    "Content-Type",
    "application/json"
  );

  res.json(payload);
}


function getSessionSecret() {

  const secret =
    process.env.SESSION_SECRET;

  if (!secret) {

    throw new Error(
      "SESSION_SECRET environment variable is not configured."
    );
  }

  return secret;
}


function createSessionToken(user) {

  const secret =
    getSessionSecret();

  const payload = {
    uid: user.uid,
    username: user.username,
    createdAt: Date.now()
  };

  const encodedPayload =
    Buffer.from(
      JSON.stringify(payload),
      "utf8"
    ).toString("base64url");

  const signature =
    crypto
      .createHmac(
        "sha256",
        secret
      )
      .update(encodedPayload)
      .digest("base64url");

  return `${encodedPayload}.${signature}`;
}


module.exports = async function handler(req, res) {

  if (req.method !== "POST") {

    res.setHeader(
      "Allow",
      "POST"
    );

    return sendJson(
      res,
      405,
      {
        error: "Method not allowed."
      }
    );
  }

  try {

    const {
      accessToken
    } = req.body || {};

    if (
      typeof accessToken !== "string" ||
      accessToken.trim().length === 0
    ) {

      return sendJson(
        res,
        400,
        {
          error: "Pi access token is required."
        }
      );
    }

    /*
     * Server-side Pi token validation.
     *
     * IMPORTANT:
     * Never trust username/uid data sent by the browser.
     * The identity comes from this verified Pi API response.
     */
    const piResponse =
      await fetch(
        PI_ME_ENDPOINT,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${accessToken}`
          }
        }
      );

    if (!piResponse.ok) {

      return sendJson(
        res,
        401,
        {
          error:
            "Pi access token validation failed."
        }
      );
    }

    const piUser =
      await piResponse.json();

    if (
      !piUser ||
      typeof piUser.uid !== "string" ||
      typeof piUser.username !== "string"
    ) {

      return sendJson(
        res,
        401,
        {
          error:
            "Pi returned an invalid user identity."
        }
      );
    }

    /*
     * At this point Pi has confirmed the identity.
     * Establish an application session.
     */
    const sessionToken =
      createSessionToken({
        uid: piUser.uid,
        username: piUser.username
      });

    res.setHeader(
      "Set-Cookie",
      [
        `pi_session=${sessionToken}`,
        "HttpOnly",
        "Secure",
        "SameSite=Lax",
        "Path=/",
        "Max-Age=604800"
      ].join("; ")
    );

    return sendJson(
      res,
      200,
      {
        authenticated: true,

        user: {
          uid: piUser.uid,
          username: piUser.username
        }
      }
    );

  } catch (error) {

    console.error(
      "Pi authentication backend error:",
      error
    );

    return sendJson(
      res,
      500,
      {
        error:
          "Unable to establish Pi session."
      }
    );
  }
};
