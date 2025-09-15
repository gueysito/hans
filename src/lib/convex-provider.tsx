"use client";

import { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

const convex = new ConvexReactClient(convexUrl);

interface ConvexClientProviderProps {
  children: ReactNode;
}

export default function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  // If Convex URL is not configured, use localStorage fallback
  if (!convexUrl) {
    return <div>{children}</div>;
  }

  // If Clerk is configured, use authenticated Convex
  if (clerkPublishableKey) {
    return (
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      </ClerkProvider>
    );
  }

  // Otherwise use basic Convex provider
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}