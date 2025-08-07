import { cookies } from "next/headers";

export async function setServerCookie(data: any, key: string, age = 3600, type = "json") {
  try {
    const cookieStore = await cookies();
    cookieStore.set(key, type === "json" ? JSON.stringify(data) : data, {
      maxAge: age,
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
      // sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return true;
  } catch (error) {
    console.info(process.env.NODE_ENV === "development" ? data : "cookie data");
    console.error("Error during set cookie:", error);
    return null;
  }
}
