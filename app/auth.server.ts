import { redirect } from "@remix-run/node";

import { auth, getSessionToken } from "~/db.server";

import { getSession, commitSession, destroySession } from "./session.server";

export async function requireUser(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const sessionToken = session.get("session");

  if (!sessionToken) {
    throw redirect("/login");
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionToken);
    return decodedClaims;
  } catch (error) {
    throw redirect("/login");
  }
}

export async function createUserSession(idToken: string, redirectTo: string) {
  const sessionToken = await getSessionToken(idToken);
  const session = await getSession();
  session.set("session", sessionToken);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export async function getUserFromSession(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const sessionToken = session.get("session");

  if (!sessionToken) {
    return null;
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionToken);
    return decodedClaims;
  } catch (error) {
    // Session is invalid or expired
    return null;
  }
}
