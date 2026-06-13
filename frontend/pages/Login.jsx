"use client";

import { SignIn } from "@clerk/clerk-react";

// Clerk-hosted sign-in (also available as a modal from the navbar).
// Sign-up is offered inside the widget; after sign-up the RoleOnboarding gate
// asks Renter vs Owner. The Clerk appearance theme is set globally in main.jsx.
export default function Login() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-14 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="mono-label text-faded mb-2">Notice</p>
          <h1 className="disp text-4xl">Sign the register.</h1>
          <p className="text-faded text-sm mt-2">
            Renters browse free. Owners get to paste flyers.
          </p>
        </div>

        <div className="relative" style={{ rotate: "-0.6deg" }}>
          <span className="tape" aria-hidden="true" />
          <div className="flex justify-center">
            <SignIn routing="hash" />
          </div>
        </div>

        <p className="mono-data text-faded text-xs text-center mt-8">
          No password stored on this board — auth runs through Clerk.
        </p>
      </div>
    </div>
  );
}
