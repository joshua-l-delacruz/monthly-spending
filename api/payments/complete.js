"use strict";

/*
 * Pi Monthly Spending
 *
 * Pi payment server completion endpoint.
 *
 * Product:
 * Premium Spending Analytics
 *
 * Price:
 * 1 Pi
 *
 * Duration:
 * 30 days
 */

const PI_API_BASE =
  "https://api.minepi.com/v2";

const PREMIUM_PRODUCT = Object.freeze({
  productId: "premium-spending-analytics-30d",
  productName: "Premium Spending Analytics",
  amount: 1,
  memo: "Unlock premium spending analytics for 30 days",
  durationDays: 30
});


module.exports = async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Method not allowed."
    });

  }

  if (process.env.PREMIUM_PURCHASES_ENABLED !== "true") {

    return res.status(503).json({
      error: "Premium purchases are temporarily unavailable."
    });

  }


  const apiKey =
    process.env.PI_NETWORK_API_KEY;


  if (!apiKey) {

    console.error(
      "PI_NETWORK_API_KEY is not configured."
    );

    return res.status(500).json({
      error:
        "Pi Network payment configuration is missing."
    });

  }


  const paymentId =
    req.body?.paymentId;

  const txid =
    req.body?.txid;


  if (
    typeof paymentId !== "string" ||
    paymentId.trim().length === 0
  ) {

    return res.status(400).json({
      error:
        "A valid Pi payment ID is required."
    });

  }


  if (
    typeof txid !== "string" ||
    txid.trim().length === 0
  ) {

    return res.status(400).json({
      error:
        "A valid Pi transaction ID is required."
    });

  }


  try {

    /*
     * Complete the payment through Pi Network.
     *
     * The transaction ID returned by the Pi SDK
     * is sent to the Pi completion endpoint.
     *
     * The Pi API key remains server-side.
     */
    const response =
      await fetch(
        `${PI_API_BASE}/payments/${encodeURIComponent(
          paymentId
        )}/complete`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Key ${apiKey}`,

            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            txid
          })
        }
      );


    const responseText =
      await response.text();


    let result = null;


    try {

      result =
        responseText
          ? JSON.parse(responseText)
          : null;

    } catch {

      result = {
        raw: responseText
      };

    }


    if (!response.ok) {

      console.error(
        "Pi payment completion failed:",
        response.status,
        result
      );

      return res.status(
        response.status
      ).json({

        error:
          result?.error ||
          result?.message ||
          "Pi payment completion failed.",

      });

    }


    /*
     * Payment has been successfully completed
     * by Pi Network.
     */
    return res.status(200).json({

      success: true,

      paymentId,

      txid,

      product: {
        productId:
          PREMIUM_PRODUCT.productId,

        productName:
          PREMIUM_PRODUCT.productName,

        amount:
          PREMIUM_PRODUCT.amount,

        memo:
          PREMIUM_PRODUCT.memo,

        durationDays:
          PREMIUM_PRODUCT.durationDays
      },

      premium: {
        unlocked: true,

        productId:
          PREMIUM_PRODUCT.productId,

        durationDays:
          PREMIUM_PRODUCT.durationDays
      },

    });


  } catch (error) {

    console.error(
      "Unexpected Pi completion error:",
      error
    );


    return res.status(500).json({
      error:
        "Unable to communicate with Pi Network."
    });

  }

}
