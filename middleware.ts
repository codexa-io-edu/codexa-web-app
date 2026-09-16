import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/courses(.*)",
  "/api/courses(.*)",
  "/api/search(.*)",
  "/api/learn/(.*)",
  "/learn/(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

export default clerkMiddleware((auth, req) => {
  // Fallback if keys have not been populated yet during initial setup
  if (
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("PLACEHOLDER")
  ) {
    return NextResponse.next();
  }

  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = auth();
    const role = (sessionClaims?.metadata as any)?.role;
    const email = (sessionClaims as any)?.email || (sessionClaims as any)?.primaryEmail;
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

    const isEmailAdmin = email && adminEmails.includes(email.toLowerCase());
    const isRoleAdmin = role === "ADMIN";

    if (!userId || (!isRoleAdmin && !isEmailAdmin && adminEmails.length > 0)) {
      return NextResponse.redirect(new URL("/sign-in?redirect_url=/admin", req.url));
    }
  }

  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
