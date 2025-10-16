"use client";

import { UserButton as ClerkUserButton } from "@clerk/nextjs";

/**
 * User profile button with sign-out functionality.
 * Wraps Clerk's UserButton with configured appearance.
 */
export function UserButton() {
  return (
    <ClerkUserButton
      afterSignOutUrl="/"
      appearance={{
        elements: {
          avatarBox: "w-10 h-10",
        },
      }}
    />
  );
}
