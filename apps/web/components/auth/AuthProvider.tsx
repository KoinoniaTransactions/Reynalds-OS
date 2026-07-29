import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  if (!hasClerkPublishableKey()) {
    return <>{children}</>;
  }

  return <ClerkProvider>{children}</ClerkProvider>;
}

function hasClerkPublishableKey(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}
