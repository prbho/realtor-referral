// lib/monnify.ts
const MONNIFY_BASE_URL = process.env.MONNIFY_BASE_URL!;
const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY!;
const MONNIFY_SECRET_KEY = process.env.MONNIFY_SECRET_KEY!;

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

async function getMonnifyToken(): Promise<string> {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken!;
  }

  const credentials = Buffer.from(
    `${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`
  ).toString("base64");
  const response = await fetch(`${MONNIFY_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Monnify auth failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  if (!data.responseBody?.accessToken) {
    throw new Error("Monnify token missing in response");
  }

  cachedToken = data.responseBody.accessToken;
  tokenExpiry = Date.now() + 55 * 60 * 1000;
  return cachedToken!;
}

export async function verifyNin(
  nin: string
): Promise<{ verified: boolean; fullName?: string; error?: string }> {
  try {
    const token = await getMonnifyToken();
    console.log(`[Monnify] Verifying NIN: ${nin}`);
    const response = await fetch(`${MONNIFY_BASE_URL}/api/v1/vas/nin-details`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nin }),
    });

    const data = await response.json();
    console.log("[Monnify] Response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      return {
        verified: false,
        error: data.responseMessage || `HTTP ${response.status}`,
      };
    }

    if (data.requestSuccessful !== true || data.responseCode !== "0") {
      return {
        verified: false,
        error: data.responseMessage || "Verification failed",
      };
    }

    const body = data.responseBody;
    if (!body || typeof body.ninInformationMatch !== "boolean") {
      return { verified: false, error: "Unexpected response format" };
    }

    if (!body.ninInformationMatch) {
      return {
        verified: false,
        error: "NIN does not match our records. Please check and try again.",
      };
    }

    const fullName =
      [body.firstName, body.lastName].filter(Boolean).join(" ") || undefined;
    return { verified: true, fullName };
  } catch (error) {
    console.error("[Monnify] Error:", error);
    return {
      verified: false,
      error: "Service unavailable. Please try again later.",
    };
  }
}
