import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  isAuthenticatedNextjs,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { createI18nMiddleware } from "next-international/middleware";

const I18nMiddleware = createI18nMiddleware({
  locales: ["en", "fr", "es"],
  defaultLocale: "en",
  urlMappingStrategy: "rewrite",
});

const isSignInPage = createRouteMatcher(["/login"]);
const isOnboardingPage = createRouteMatcher(["/onboarding"]);
const isPublicPage = createRouteMatcher(["/login", "/onboarding"]);

export default convexAuthNextjsMiddleware(async (request) => {
  const url = new URL(request.url);
  const isLogout = url.searchParams.has("logout");
  const isAccountDeleted = url.searchParams.has("accountDeleted");

  // Handle logout and account deletion
  if (isLogout || isAccountDeleted) {
    return nextjsMiddlewareRedirect(request, "/login");
  }

  // If not on a public page and not authenticated, redirect to login
  if (!isPublicPage(request) && !isAuthenticatedNextjs()) {
    return nextjsMiddlewareRedirect(request, "/login");
  }

  // If on login page and authenticated, redirect to onboarding
  if (isSignInPage(request) && isAuthenticatedNextjs()) {
    return nextjsMiddlewareRedirect(request, "/onboarding");
  }

  return I18nMiddleware(request);
});

export const config = {
  matcher: [
    "/((?!_next/static|api|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
