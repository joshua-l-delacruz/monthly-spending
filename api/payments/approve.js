"use strict";

/*
 * Pi Monthly Spending
 *
 * Pi payment server approval endpoint.
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


export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Method not allowed."
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


  if (
    typeof paymentId !== "string" ||
    paymentId.trim().length === 0
  ) {

    return res.status(400).json({
      error:
        "A valid Pi payment ID is required."
    });

  }


  try {

    /*
     * Approve the payment through Pi Network.
     *
     * IMPORTANT:
     * The Pi API key is used only on the server.
     */
    const response =
      await fetch(
        `${PI_API_BASE}/payments/${encodeURIComponent(
          paymentId
        )}/approve`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Key ${apiKey}`,

            "Content-Type":
              "application/json"
          }
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
        "Pi payment approval failed:",
        response.status,
        result
      );

      return res.status(
        response.status
      ).json({

        error:
          result?.error ||
          result?.message ||
          "Pi payment approval failed.",

        details:
          result

      });

    }


    /*
     * The frontend only needs the successful Pi response.
     */
    return res.status(200).json({

      success: true,

      paymentId,

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

      pi:
        result

    });


  } catch (error) {

    console.error(
      "Unexpected Pi approval error:",
      error
    );


    return res.status(500).json({
      error:
        "Unable to communicate with Pi Network."
    });

  }

}
