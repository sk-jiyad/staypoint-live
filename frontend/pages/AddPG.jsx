"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Upload, ChevronDown, X } from "lucide-react"
import { useAuth } from "@clerk/clerk-react"
import { useRole } from "../src/lib/role.js"
import { pgApi, ApiError } from "../src/lib/api.js"
import { uploadImage } from "../src/lib/cloudinary.js"

const STEPS = ["Basics", "Rooms & rent", "Amenities", "Photos", "Owner"]

export default function AddPG() {
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()
  const { isOwner } = useRole()

  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [createdId, setCreatedId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [formData, setFormData] = useState({
    pgName: "",
    address: "",
    city: "",
    college: "",
    rentSingle: "",
    rentDouble: "",
    rentTriple: "",
    gender: "boys",
    totalRooms: "",
    availableRooms: "",
    amenities: [],
    ownerName: "",
    phone: "",
    email: "",
    imageUrls: [],
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAmenityChange = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploadError("")
    setUploading(true)
    try {
      const urls = []
      for (const file of files) {
        urls.push(await uploadImage(file))
      }
      setFormData((f) => ({ ...f, imageUrls: [...f.imageUrls, ...urls] }))
    } catch (err) {
      setUploadError(err.message || "Upload failed")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const removeImage = (url) => {
    setFormData((f) => ({ ...f, imageUrls: f.imageUrls.filter((u) => u !== url) }))
  }

  const submitPG = async () => {
    setError("")
    setSubmitting(true)
    // Map the wizard fields onto the backend PGCreateDTO. Fields the backend
    // doesn't model (city, college, email) are intentionally not sent.
    const payload = {
      name: formData.pgName,
      ownerName: formData.ownerName,
      contactNumber: formData.phone.trim(),
      address: formData.address,
      rentSingle: Number(formData.rentSingle),
      rentDouble: Number(formData.rentDouble),
      foodProvided: formData.amenities.includes("Food"),
      wifiAvailable: formData.amenities.includes("WiFi"),
      acAvailable: formData.amenities.includes("AC"),
    }
    if (formData.rentTriple !== "") payload.rentTriple = Number(formData.rentTriple)
    if (formData.imageUrls.length > 0) payload.imageUrls = formData.imageUrls
    payload.gender = formData.gender
    if (formData.totalRooms !== "") payload.totalRooms = Number(formData.totalRooms)
    if (formData.availableRooms !== "") payload.availableRooms = Number(formData.availableRooms)

    try {
      const created = await pgApi.create(payload)
      setCreatedId(created.id)
      setSubmitted(true)
    } catch (err) {
      if (err instanceof ApiError) {
        const firstFieldError = err.errors ? Object.values(err.errors)[0] : null
        setError(firstFieldError || err.message)
      } else {
        setError("Could not reach the server. Is the backend running?")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (step < 5) {
      setStep(step + 1)
    } else {
      submitPG()
    }
  }

  const amenities = ["WiFi", "Food", "AC", "Laundry", "Parking", "Attached Bath"]

  // --- Auth gate: only logged-in PG owners may create a listing ---
  if (!isSignedIn || !isOwner) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="flyer max-w-md w-full p-9 text-center" style={{ "--tilt": "-1deg" }}>
          <span className="tape" aria-hidden="true" />
          <p className="mono-label text-faded mb-2">Owners only</p>
          <h2 className="disp text-3xl mb-3">This side of the board is for owners.</h2>
          <p className="text-faded mb-7 text-sm">
            {isSignedIn
              ? "Your account isn't a PG-owner account, so you can't paste a flyer."
              : "Log in as a PG owner to paste your flyer on the board."}
          </p>
          <Link to="/login" className="btn btn-green w-full">
            {isSignedIn ? "Switch account" : "Log in / Sign up"}
          </Link>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <p className="stamp stamp-in text-3xl mb-8">Pasted ✓</p>
          <h2 className="disp text-5xl mb-3">It's on the board.</h2>
          <p className="text-faded mb-9">
            Your flyer is live. Students browsing StayPoint can see it — and tear a tab — right now.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => navigate(`/pg/${createdId}`)} className="btn btn-green">
              See my flyer →
            </button>
            <button onClick={() => navigate("/explore")} className="btn">
              Browse the board
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-9">
        <p className="mono-label text-green-deep mb-2">For owners</p>
        <h1 className="disp text-4xl md:text-5xl">Paste a flyer</h1>
      </div>

      {/* step rail — a real sequence, so it earns its numbers */}
      <ol className="grid grid-cols-5 border-2 border-ink bg-flyer mb-10 list-none p-0 m-0" aria-label="Listing steps">
        {STEPS.map((label, i) => {
          const n = i + 1
          const state = n < step ? "done" : n === step ? "now" : "todo"
          return (
            <li
              key={label}
              aria-current={state === "now" ? "step" : undefined}
              className={`px-2 py-3 text-center border-l-2 border-ink first:border-l-0 ${
                state === "now"
                  ? "bg-green"
                  : state === "done"
                  ? "bg-ink text-flyer"
                  : "text-faded"
              }`}
            >
              <span className="mono-data font-bold text-sm block">{String(n).padStart(2, "0")}</span>
              <span className="mono-label hidden sm:block mt-0.5 !text-[9px]">{label}</span>
            </li>
          )
        })}
      </ol>

      <div className="border-2 border-ink bg-flyer p-7 md:p-10">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Basics */}
          {step === 1 && (
            <fieldset className="space-y-5 border-0 p-0 m-0">
              <legend className="disp text-3xl mb-6 p-0">The basics</legend>
              <div>
                <label htmlFor="pgName" className="label">PG name *</label>
                <input id="pgName" type="text" name="pgName" placeholder="e.g. Sunrise PG"
                  value={formData.pgName} onChange={handleInputChange} className="field" />
              </div>
              <div>
                <label htmlFor="address" className="label">Full address * (at least 10 characters)</label>
                <input id="address" type="text" name="address" placeholder="House no., street, area, town, PIN"
                  value={formData.address} onChange={handleInputChange} className="field" />
              </div>
              <div>
                <label htmlFor="city" className="label">City (optional)</label>
                <input id="city" type="text" name="city" placeholder="e.g. Asansol"
                  value={formData.city} onChange={handleInputChange} className="field" />
              </div>
              <div>
                <label htmlFor="college" className="label">Nearby college (optional)</label>
                <div className="select-wrap">
                  <select id="college" name="college" value={formData.college} onChange={handleInputChange} className="field">
                    <option value="">Select a college</option>
                    <option value="Delhi University">Delhi University</option>
                    <option value="Jamia Millia">Jamia Millia</option>
                    <option value="IP University">IP University</option>
                  </select>
                  <ChevronDown size={16} aria-hidden="true" />
                </div>
              </div>
            </fieldset>
          )}

          {/* Step 2: Rooms & rent */}
          {step === 2 && (
            <fieldset className="border-0 p-0 m-0">
              <legend className="disp text-3xl mb-6 p-0">Rooms &amp; rent</legend>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="rentSingle" className="label">Single room rent (₹/mo) *</label>
                  <input id="rentSingle" type="number" name="rentSingle" placeholder="4500"
                    value={formData.rentSingle} onChange={handleInputChange} className="field" />
                </div>
                <div>
                  <label htmlFor="rentDouble" className="label">Double room rent (₹/mo) *</label>
                  <input id="rentDouble" type="number" name="rentDouble" placeholder="3200"
                    value={formData.rentDouble} onChange={handleInputChange} className="field" />
                </div>
                <div>
                  <label htmlFor="rentTriple" className="label">Triple room rent (₹/mo, optional)</label>
                  <input id="rentTriple" type="number" name="rentTriple" placeholder="2500"
                    value={formData.rentTriple} onChange={handleInputChange} className="field" />
                </div>
                <div>
                  <label htmlFor="gender" className="label">For</label>
                  <div className="select-wrap">
                    <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className="field">
                      <option value="boys">Boys</option>
                      <option value="girls">Girls</option>
                      <option value="coed">Co-ed</option>
                    </select>
                    <ChevronDown size={16} aria-hidden="true" />
                  </div>
                </div>
                <div>
                  <label htmlFor="totalRooms" className="label">Total rooms (optional)</label>
                  <input id="totalRooms" type="number" name="totalRooms" placeholder="12"
                    value={formData.totalRooms} onChange={handleInputChange} className="field" />
                </div>
                <div>
                  <label htmlFor="availableRooms" className="label">Rooms available now (optional)</label>
                  <input id="availableRooms" type="number" name="availableRooms" placeholder="3"
                    value={formData.availableRooms} onChange={handleInputChange} className="field" />
                </div>
              </div>
            </fieldset>
          )}

          {/* Step 3: Amenities */}
          {step === 3 && (
            <fieldset className="border-0 p-0 m-0">
              <legend className="disp text-3xl mb-6 p-0">What's included</legend>
              <div className="grid sm:grid-cols-3 gap-3">
                {amenities.map((amenity) => {
                  const on = formData.amenities.includes(amenity)
                  return (
                    <label
                      key={amenity}
                      className={`flex items-center gap-3 cursor-pointer border-2 px-4 py-3 transition-colors ${
                        on ? "border-ink bg-green" : "border-ink bg-flyer hover:bg-tape/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => handleAmenityChange(amenity)}
                        className="checkbox"
                      />
                      <span className="mono-data text-sm font-bold">{amenity}</span>
                    </label>
                  )
                })}
              </div>
              <p className="mono-data text-xs text-faded mt-5">
                WiFi, Food and AC print onto your flyer; the rest are coming to the board soon.
              </p>
            </fieldset>
          )}

          {/* Step 4: Photos */}
          {step === 4 && (
            <fieldset className="border-0 p-0 m-0">
              <legend className="disp text-3xl mb-2 p-0">Photos</legend>
              <p className="text-faded text-sm mb-6">
                Flyers with real photos get the calls. Phone-camera shots are fine.
              </p>
              <label className="border-2 border-dashed border-ink p-12 text-center w-full block cursor-pointer hover:bg-tape/40 transition-colors">
                <Upload className="w-10 h-10 text-faded mx-auto mb-3" aria-hidden="true" />
                <p className="mono-label text-ink">
                  {uploading ? "Uploading…" : "Click to add photos"}
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFiles}
                  disabled={uploading}
                />
              </label>
              {uploadError && <p className="mono-data text-sm text-red mt-3">{uploadError}</p>}
              {formData.imageUrls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-5">
                  {formData.imageUrls.map((url) => (
                    <div key={url} className="relative border-2 border-ink">
                      <img src={url} alt="" className="w-full h-24 object-cover" />
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
                </div>
              )}
            </fieldset>
          )}

          {/* Step 5: Owner */}
          {step === 5 && (
            <fieldset className="border-0 p-0 m-0">
              <legend className="disp text-3xl mb-2 p-0">Your details</legend>
              <p className="text-faded text-sm mb-6">
                This number goes on the tear-off tabs — it's how students reach you.
              </p>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="ownerName" className="label">Your name *</label>
                  <input id="ownerName" type="text" name="ownerName" placeholder="e.g. Ramesh Kumar"
                    value={formData.ownerName} onChange={handleInputChange} className="field" />
                </div>
                <div>
                  <label htmlFor="phone" className="label">Contact number (10 digits) *</label>
                  <input id="phone" type="tel" name="phone" placeholder="9876543210"
                    value={formData.phone} onChange={handleInputChange} className="field mono-data" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="email" className="label">Email (optional, not saved yet)</label>
                  <input id="email" type="email" name="email" placeholder="you@example.com"
                    value={formData.email} onChange={handleInputChange} className="field" />
                </div>
              </div>
            </fieldset>
          )}

          {/* error */}
          {error && (
            <p role="alert" className="mt-7 mono-data text-sm text-red border-2 border-red bg-red/5 px-4 py-3">
              {error}
            </p>
          )}

          {/* navigation */}
          <div className="flex gap-4 mt-10">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="btn flex-1">
                ← Back
              </button>
            )}
            <button type="submit" disabled={submitting} className="btn btn-green flex-1">
              {step === 5 ? (submitting ? "Pasting…" : "Paste my flyer") : "Next →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
