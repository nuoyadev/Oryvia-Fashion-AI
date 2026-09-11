import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { findUserById } from "@/lib/repo";

export default async function Entry() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    const userId = await verifySessionToken(token);
    if (userId) {
      const row = findUserById(userId);
      if (row) {
        redirect(row.user.onboardingDone ? "/home" : "/onboarding");
      }
    }
  }
  redirect("/login");
}
