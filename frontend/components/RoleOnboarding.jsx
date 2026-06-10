import { useState } from "react";
import { useUser } from "@clerk/clerk-react";

// One-time gate shown right after sign-up: pick Renter or Owner.
// Stores the choice in Clerk unsafeMetadata (which feeds the JWT `role` claim).
export default function RoleOnboarding() {
  const { isSignedIn, user } = useUser();
  const [saving, setSaving] = useState(false);

  if (!isSignedIn || user?.unsafeMetadata?.role) return null;

  const pick = async (role) => {
    setSaving(true);
    try {
      await user.update({ unsafeMetadata: { ...user.unsafeMetadata, role } });
      await user.reload();
      // Reload so Clerk mints a fresh session token that includes the role claim.
      window.location.reload();
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#191919] border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to StayPoint!</h2>
        <p className="text-gray-400 mb-6">How will you use StayPoint?</p>
        <div className="grid gap-3">
          <button
            disabled={saving}
            onClick={() => pick("renter")}
            className="px-5 py-3 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-60"
          >
            I'm looking for a PG (Renter)
          </button>
          <button
            disabled={saving}
            onClick={() => pick("owner")}
            className="px-5 py-3 rounded-lg bg-[#87E64B] text-black font-semibold disabled:opacity-60"
          >
            I want to list PGs (Owner)
          </button>
        </div>
        {saving && <p className="text-gray-500 text-sm mt-4">Saving…</p>}
      </div>
    </div>
  );
}
