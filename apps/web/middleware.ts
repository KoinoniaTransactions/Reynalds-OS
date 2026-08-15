import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

const protectedPortalPrefixes = ["/client", "/employee", "/crm"];

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!hasClerkConfiguration()) {
    return NextResponse.next();
  }

  return clerkMiddleware(async (auth, clerkRequest) => {
    const { sessionStatus } = await auth();
    const pathname = clerkRequest.nextUrl.pathname;

    const requiresCompletedSession = protectedPortalPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

    if (sessionStatus === "pending" && requiresCompletedSession) {
      const taskUrl = clerkRequest.nextUrl.clone();
      taskUrl.pathname = "/session-tasks/setup-mfa";
      taskUrl.search = "";

      return NextResponse.redirect(taskUrl);
    }

    return NextResponse.next();
  })(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)"
  ]
};

function hasClerkConfiguration(): boolean {
  return Boolean(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}
