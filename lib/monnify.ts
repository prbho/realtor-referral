// lib/monnify.ts
const MONNIFY_BASE_URL = process.env.MONNIFY_BASE_URL!;
const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY!;
const MONNIFY_SECRET_KEY = process.env.MONNIFY_SECRET_KEY!;

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

async function getMonnifyToken(): Promise<string> {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken; // ✅ cachedToken is truthy, so it's a string
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

    const url = `${MONNIFY_BASE_URL}/api/v1/vas/nin-details`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nin }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg =
        data.responseMessage || data.message || `HTTP ${response.status}`;
      return { verified: false, error: errorMsg };
    }

    if (data.requestSuccessful !== true || data.responseCode !== "0") {
      const errorMsg = data.responseMessage || "Verification failed";
      return { verified: false, error: errorMsg };
    }

    const body = data.responseBody;

    if (!body || typeof body !== "object") {
      return {
        verified: false,
        error: "Unexpected response format from Monnify",
      };
    }

    // The presence of a nin or firstName field indicates a successful match
    if (!body.nin && !body.firstName) {
      return { verified: false, error: "NIN not found or invalid" };
    }

    // ✅ Safe type‑guard to ensure fullName is always a string (or undefined)
    const fullName =
      [body.firstName, body.middleName, body.lastName]
        .filter(
          (name): name is string => typeof name === "string" && name.length > 0
        )
        .join(" ") || undefined;

    return { verified: true, fullName };
  } catch (error) {
    console.error("[Monnify] Error:", error);
    return {
      verified: false,
      error: "Service unavailable. Please try again later.",
    };
  }
}
