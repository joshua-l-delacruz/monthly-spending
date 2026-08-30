"use strict";

const crypto =
  require("crypto");


const PI_ME_ENDPOINT =
  "https://api.minepi.com/v2/me";

const MAX_ACCESS_TOKEN_LENGTH =
  4096;


function getSessionSecret() {

  const secret =
    process.env.SESSION_SECRET;

  if (!secret) {

    throw new Error(
      "SESSION_SECRET is not configured."
    );

  }

  return secret;

}


function createSessionToken(
  user
) {

  const payload = {

    uid:
      user.uid,

    username:
      user.username,

    createdAt:
      Date.now()

  };


  const encodedPayload =
    Buffer
      .from(
        JSON.stringify(
          payload
        )
      )
      .toString(
        "base64url"
      );


  const signature =
    crypto
      .createHmac(
        "sha256",
        getSessionSecret()
      )
      .update(
        encodedPayload
      )
      .digest(
        "base64url"
      );


  return `${encodedPayload}.${signature}`;

}


function setSessionCookie(
  res,
  token
) {

  res.setHeader(
    "Set-Cookie",

    [
      `pi_session=${encodeURIComponent(token)}`,
      "Path=/",
      "HttpOnly",
      "Secure",
      "SameSite=Lax",
      "Max-Age=604800"
    ].join("; ")
  );

}


module.exports =
  async function handler(
    req,
    res
  ) {

    if (
      req.method !== "POST"
    ) {

      res.setHeader(
        "Allow",
        "POST"
      );

      return res
        .status(405)
        .json({
          error:
            "Method not allowed."
        });

    }


    try {

      const {
        accessToken
      } =
        req.body || {};


      if (
        typeof accessToken !==
          "string" ||
        accessToken.length ===
          0 ||
        accessToken.length >
          MAX_ACCESS_TOKEN_LENGTH
      ) {

        return res
          .status(400)
          .json({
            error:
              "Pi access token is required."
          });

      }


      /*
       * SECURITY:
       *
       * Never trust the username or UID supplied
       * by the browser.
       *
       * Pi Network is the source of truth.
       */
      const piResponse =
        await fetch(
          PI_ME_ENDPOINT,
          {
            method:
              "GET",

            headers: {
              Authorization:
                `Bearer ${accessToken}`,

              Accept:
                "application/json"
            },

            signal:
              AbortSignal.timeout(5000)
          }
        );


      const piData =
        await piResponse.json();


      if (
        !piResponse.ok
      ) {

        console.error(
          "Pi /v2/me rejected token:",
          piResponse.status
        );


        return res
          .status(401)
          .json({
            error:
              "Pi access token could not be verified."
          });

      }


      if (
        !piData ||
        !piData.uid ||
        !piData.username
      ) {

        return res
          .status(401)
          .json({
            error:
              "Pi returned an invalid user."
          });

      }


      /*
       * Establish our own application session only
       * after Pi has verified the access token.
       */
      const sessionToken =
        createSessionToken({
          uid:
            piData.uid,

          username:
            piData.username
        });


      setSessionCookie(
        res,
        sessionToken
      );


      return res
        .status(200)
        .json({

          authenticated:
            true,

          user: {

            uid:
              piData.uid,

            username:
              piData.username

          }

        });


    } catch (error) {

      console.error(
        "Pi authentication error:",
        error
      );


      return res
        .status(500)
        .json({
          error:
            "Unable to authenticate with Pi Network."
        });

    }

  };
