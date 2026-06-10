"use client";

import { SignIn } from "@clerk/clerk-react";

// Clerk-hosted sign-in (also available as a modal from the navbar).
// Sign-up is offered inside the widget; after sign-up the RoleOnboarding gate
// asks Renter vs Owner.
export default function Login() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <SignIn routing="hash" />
    </div>
  );
}
