import { useUser } from "@clerk/clerk-react";

// The renter/owner role lives in the Clerk user's unsafeMetadata (chosen at onboarding)
// and is also carried in the session JWT as a `role` claim for the backend to enforce.
export function useRole() {
  const { user } = useUser();
  const role = user?.unsafeMetadata?.role ?? null;
  return { role, isOwner: role === "owner", isRenter: role === "renter" };
}
