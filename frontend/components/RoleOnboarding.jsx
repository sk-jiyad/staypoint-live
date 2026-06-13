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
    <div className="fixed inset-0 z-[100] bg-ink/85 flex items-center justify-center p-4">
      <div className="flyer max-w-md w-full" style={{ "--tilt": "-1deg" }}>
        <span className="tape" aria-hidden="true" />
        <div className="p-8 text-center">
          <p className="mono-label text-faded mb-2">One quick question</p>
          <h2 className="disp text-3xl mb-2">Why are you at this board?</h2>
          <p className="text-faded mb-7 text-sm">Pick one — it decides what you can do here.</p>
          <div className="grid gap-3">
            <button
              disabled={saving}
              onClick={() => pick("renter")}
              className="btn w-full justify-between"
            >
              I'm hunting a room <span aria-hidden="true">→</span>
            </button>
            <button
              disabled={saving}
              onClick={() => pick("owner")}
              className="btn btn-green w-full justify-between"
            >
              I've got rooms to let <span aria-hidden="true">→</span>
            </button>
          </div>
          {saving && <p className="mono-label text-faded mt-5">Saving…</p>}
        </div>
      </div>
    </div>
  );
}
