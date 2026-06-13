"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { X } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { useRole } from "../src/lib/role.js";
import { pgApi, ApiError } from "../src/lib/api.js";
import { uploadImage } from "../src/lib/cloudinary.js";

const AMENITIES = [
  { key: "wifiAvailable", label: "Wi-Fi" },
  { key: "foodProvided", label: "Food" },
  { key: "acAvailable", label: "AC" },
];

const emptyForm = {
  name: "",
  ownerName: "",
  contactNumber: "",
  alternateContact: "",
  address: "",
  landmark: "",
  rentSingle: "",
  rentDouble: "",
  rentTriple: "",
  foodProvided: false,
  wifiAvailable: false,
  acAvailable: false,
  imageUrls: [],
  gender: "boys",
  totalRooms: "",
  availableRooms: "",
};

export default function EditPG() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { isOwner } = useRole();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (!isOwner) return;
    let active = true;
    setLoading(true);
    pgApi
      .get(id)
      .then((pg) => {
        if (!active) return;
        setForm({
          name: pg.name ?? "",
          ownerName: pg.ownerName ?? "",
          contactNumber: pg.contactNumber ?? "",
          alternateContact: pg.alternateContact ?? "",
          address: pg.address ?? "",
          landmark: pg.landmark ?? "",
          rentSingle: pg.rentSingle ?? "",
          rentDouble: pg.rentDouble ?? "",
          rentTriple: pg.rentTriple ?? "",
          foodProvided: Boolean(pg.foodProvided),
          wifiAvailable: Boolean(pg.wifiAvailable),
          acAvailable: Boolean(pg.acAvailable),
          imageUrls: pg.imageUrls ?? [],
          gender: pg.gender ?? "boys",
          totalRooms: pg.totalRooms ?? "",
          availableRooms: pg.availableRooms ?? "",
        });
        setLoadError("");
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(
          err instanceof ApiError && err.status === 404
            ? "PG not found"
            : "Could not load this PG."
        );
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, isOwner]);

  const set = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadError("");
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) urls.push(await uploadImage(file));
      setForm((f) => ({ ...f, imageUrls: [...f.imageUrls, ...urls] }));
    } catch (err) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (url) =>
    setForm((f) => ({ ...f, imageUrls: f.imageUrls.filter((u) => u !== url) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      name: form.name,
      ownerName: form.ownerName,
      contactNumber: form.contactNumber.trim(),
      address: form.address,
      rentSingle: Number(form.rentSingle),
      rentDouble: Number(form.rentDouble),
      foodProvided: form.foodProvided,
      wifiAvailable: form.wifiAvailable,
      acAvailable: form.acAvailable,
      landmark: form.landmark,
    };
    if (form.alternateContact.trim() !== "") payload.alternateContact = form.alternateContact.trim();
    if (String(form.rentTriple).trim() !== "") payload.rentTriple = Number(form.rentTriple);
    payload.imageUrls = form.imageUrls;
    payload.gender = form.gender;
    if (String(form.totalRooms).trim() !== "") payload.totalRooms = Number(form.totalRooms);
    if (String(form.availableRooms).trim() !== "") payload.availableRooms = Number(form.availableRooms);

    try {
      await pgApi.update(id, payload);
      navigate(`/pg/${id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403) setError("You can only edit your own listings.");
        else {
          const firstFieldError = err.errors ? Object.values(err.errors)[0] : null;
          setError(firstFieldError || err.message);
        }
      } else {
        setError("Could not reach the server. Is the backend running?");
      }
    } finally {
      setSaving(false);
    }
  };

  // --- Auth gate: owners only ---
  if (!isSignedIn || !isOwner) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="flyer max-w-md w-full p-9 text-center" style={{ "--tilt": "1deg" }}>
          <span className="tape" aria-hidden="true" />
          <p className="mono-label text-faded mb-2">Owners only</p>
          <h2 className="disp text-3xl mb-3">You can&rsquo;t correct someone else&rsquo;s flyer.</h2>
          <p className="text-faded mb-7 text-sm">Log in as a PG owner to edit listings.</p>
          <Link to="/login" className="btn btn-green w-full">
            Log in / Sign up
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-content-center text-center px-4">
        <p className="mono-label text-faded animate-pulse">Pulling the flyer off the board…</p>
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="flyer max-w-md w-full p-9 text-center" style={{ "--tilt": "-1.2deg" }}>
          <span className="tape" aria-hidden="true" />
          <h2 className="disp text-3xl mb-3">{loadError}</h2>
          <p className="text-faded text-sm mb-7">
            Either it never existed or somebody tore the whole thing down.
          </p>
          <Link to="/my-listings" className="btn btn-ink w-full">
            Back to my flyers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* page header */}
        <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
          <div>
            <p className="mono-label text-faded mb-1">Correction slip · Flyer №&thinsp;{id}</p>
            <h1 className="disp text-4xl sm:text-5xl">Fix the flyer.</h1>
          </div>
          <span className="stamp" style={{ "--tilt": "-4deg" }}>
            Re-paste
          </span>
        </div>

        <div className="flyer p-7 sm:p-10" style={{ "--tilt": "0deg" }}>
          <span className="tape" aria-hidden="true" />
          <form onSubmit={handleSubmit} noValidate>
            {/* identity */}
            <fieldset className="border-0 p-0 m-0 mb-8">
              <legend className="mono-label text-faded p-0 mb-4">The place</legend>
              <div className="space-y-4">
                <div>
                  <label className="label" htmlFor="ed-name">PG name *</label>
                  <input id="ed-name" className="field" placeholder="e.g. Adhya PG" value={form.name} onChange={set("name")} />
                </div>
                <div>
                  <label className="label" htmlFor="ed-address">Full address *</label>
                  <input id="ed-address" className="field" placeholder="House no, street, area, town (10–500 chars)" value={form.address} onChange={set("address")} />
                </div>
                <div>
                  <label className="label" htmlFor="ed-landmark">Landmark</label>
                  <input id="ed-landmark" className="field" placeholder="Near the water tank, behind the temple…" value={form.landmark} onChange={set("landmark")} />
                </div>
              </div>
            </fieldset>

            {/* rent */}
            <fieldset className="border-0 p-0 m-0 mb-8">
              <legend className="mono-label text-faded p-0 mb-4">Rent per head / month</legend>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="label" htmlFor="ed-single">Single (₹) *</label>
                  <input id="ed-single" type="number" min="1" className="field" placeholder="8000" value={form.rentSingle} onChange={set("rentSingle")} />
                </div>
                <div>
                  <label className="label" htmlFor="ed-double">Double (₹) *</label>
                  <input id="ed-double" type="number" min="1" className="field" placeholder="6000" value={form.rentDouble} onChange={set("rentDouble")} />
                </div>
                <div>
                  <label className="label" htmlFor="ed-triple">Triple (₹)</label>
                  <input id="ed-triple" type="number" min="1" className="field" placeholder="optional" value={form.rentTriple} onChange={set("rentTriple")} />
                </div>
              </div>
            </fieldset>

            {/* who + rooms */}
            <fieldset className="border-0 p-0 m-0 mb-8">
              <legend className="mono-label text-faded p-0 mb-4">Rooms</legend>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="label" htmlFor="ed-gender">For</label>
                  <div className="select-wrap">
                    <select id="ed-gender" value={form.gender} onChange={set("gender")}>
                      <option value="boys">Boys</option>
                      <option value="girls">Girls</option>
                      <option value="coed">Co-ed</option>
                    </select>
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
                      <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="ed-total">Total rooms</label>
                  <input id="ed-total" type="number" min="0" className="field" placeholder="optional" value={form.totalRooms} onChange={set("totalRooms")} />
                </div>
                <div>
                  <label className="label" htmlFor="ed-avail">Rooms free now</label>
                  <input id="ed-avail" type="number" min="0" className="field" placeholder="optional" value={form.availableRooms} onChange={set("availableRooms")} />
                </div>
              </div>
            </fieldset>

            {/* amenities */}
            <fieldset className="border-0 p-0 m-0 mb-8">
              <legend className="mono-label text-faded p-0 mb-4">What&rsquo;s included</legend>
              <div className="flex flex-wrap gap-x-7 gap-y-3">
                {AMENITIES.map((a) => (
                  <label key={a.key} className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form[a.key]}
                      onChange={set(a.key)}
                      className="checkbox"
                    />
                    <span className="font-semibold text-sm">{a.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* photos */}
            <fieldset className="border-0 p-0 m-0 mb-8">
              <legend className="mono-label text-faded p-0 mb-4">Photos</legend>
              <div className="flex flex-wrap gap-3">
                {form.imageUrls.map((url) => (
                  <div key={url} className="relative border-2 border-ink">
                    <img src={url} alt="" className="w-20 h-20 object-cover block" />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute -top-2.5 -right-2.5 bg-ink text-flyer w-6 h-6 grid place-content-center cursor-pointer border-0"
                      aria-label="Remove photo"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 border-2 border-dashed border-ink grid place-content-center cursor-pointer hover:bg-tape/40 transition-colors mono-label">
                  {uploading ? "…" : "+ Add"}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} disabled={uploading} />
                </label>
              </div>
              {uploadError && <p className="mono-data text-sm text-red mt-3">{uploadError}</p>}
            </fieldset>

            {/* contact */}
            <fieldset className="border-0 p-0 m-0 mb-2">
              <legend className="mono-label text-faded p-0 mb-4">Contact on the flyer</legend>
              <div className="space-y-4">
                <div>
                  <label className="label" htmlFor="ed-owner">Owner name *</label>
                  <input id="ed-owner" className="field" placeholder="Who picks up the phone" value={form.ownerName} onChange={set("ownerName")} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="ed-phone">Phone (10 digits) *</label>
                    <input id="ed-phone" type="tel" className="field mono-data" placeholder="98XXXXXXXX" value={form.contactNumber} onChange={set("contactNumber")} />
                  </div>
                  <div>
                    <label className="label" htmlFor="ed-alt">Alternate phone</label>
                    <input id="ed-alt" type="tel" className="field mono-data" placeholder="optional" value={form.alternateContact} onChange={set("alternateContact")} />
                  </div>
                </div>
              </div>
            </fieldset>

            {error && (
              <p className="mono-data text-sm text-flyer bg-red px-4 py-3 mt-6" role="alert">
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-9">
              <button
                type="button"
                onClick={() => navigate("/my-listings")}
                className="btn flex-1"
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn btn-green flex-1">
                {saving ? "Re-pasting…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
