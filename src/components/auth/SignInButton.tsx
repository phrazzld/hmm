"use client";

import { SignInButton as ClerkSignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

/**
 * Sign-in button with consistent styling.
 * Wraps Clerk's SignInButton with shadcn Button component.
 */
export function SignInButton() {
  return (
    <ClerkSignInButton mode="modal">
      <Button variant="default" size="default">
        Sign In
      </Button>
    </ClerkSignInButton>
  );
}
