const MONNIFY_BASE_URL = "https://sandbox.monnify.com";
const CLIENT_ID = "MK_TEST_SN2W2DSAVE"; // Replace with your Monnify Client ID
const CLIENT_SECRET = "NA9MQ805BEH9LQ8GT17MCYEP0PV1C6AX"; // Replace with your Monnify Client Secret

// Function to get Monnify access token
async function getMonnifyToken(): Promise<string | null> {
  try {
    const response = await fetch(`${MONNIFY_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
      }),
    });

    const data = await response.json();

    if (data.requestSuccessful && data.responseBody.accessToken) {
      return data.responseBody.accessToken;
    } else {
      console.error("Failed to get access token:", data.responseMessage);
      return null;
    }
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
}

// Function to query NIN details
export async function queryNinDetails(nin: string): Promise<any> {
  const token = await getMonnifyToken();

  if (!token) {
    console.error("No valid access token");
    return {
      status: false,
      msg: "No valid access token",
      data: {},
    };
  }

  try {
    const response = await fetch(`${MONNIFY_BASE_URL}/api/v1/vas/nin-details`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nin }),
    });

    const data = await response.json();

    if (data.requestSuccessful) {
      return data.responseBody;
    } else {
      console.error("Failed to query NIN details:", data.responseMessage);
      return {
        status: false,
        msg: "Failed to query NIN details",
        data: {},
      };
    }
  } catch (error) {
    console.error("Error querying NIN details:", error);
    return {
      status: false,
      msg: "Error querying NIN details",
      data: {},
    };
  }
}
