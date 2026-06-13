"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Phone,
  MessageCircle,
  MapPin,
  ArrowLeft,
  Bookmark,
  ImageOff,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import TearStrip from "../components/TearStrip.jsx";
import { pgApi, ApiError } from "../src/lib/api.js";

const inr = (n) => Number(n).toLocaleString("en-IN");

export default function PGDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pg, setPg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    pgApi
      .get(id)
      .then((data) => active && (setPg(data), setError("")))
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 404) setError("This flyer was torn off — PG not found.");
        else setError("Could not load this PG. Is the backend running?");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <p className="mono-label text-faded text-center mt-24">Unpinning the flyer…</p>;
  }

  if (error || !pg) {
    return (
      <div className="max-w-md mx-auto mt-24 mb-12 border-2 border-ink bg-flyer p-8 text-center">
        <p className="disp text-2xl mb-2">Not on the board</p>
        <p className="text-faded text-sm">{error || "PG not found"}</p>
      </div>
    );
  }

  const images = pg.imageUrls || [];

  const amenityRows = [
    ["WiFi", pg.wifiAvailable],
    ["Food / mess", pg.foodProvided],
    ["AC rooms", pg.acAvailable],
  ];

  const tiers = [
    ["Single", pg.rentSingle],
    ["Double", pg.rentDouble],
    ["Triple", pg.rentTriple],
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* back */}
      <button
        onClick={() => navigate(-1)}
        className="mono-label text-faded hover:text-ink transition-colors inline-flex items-center gap-2 mb-8 bg-transparent border-0 cursor-pointer p-0"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Back to the board
      </button>

      {/* title row */}
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4 mb-8">
        <div className="max-w-2xl">
          <p className="mono-label text-green-deep mb-2">Flyer № {pg.id}</p>
          <h1 className="disp text-4xl md:text-6xl mb-3">{pg.name}</h1>
          <p className="mono-data text-sm text-faded flex items-start gap-2">
            <MapPin size={15} className="mt-0.5 flex-none" aria-hidden="true" />
            {pg.address}
          </p>
          {pg.landmark && (
            <p className="mono-data text-sm text-green-deep mt-1.5 pl-6">↳ near {pg.landmark}</p>
          )}
          {(pg.gender || pg.availableRooms != null) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {pg.gender && (
                <span className="plate plate-vacant !rotate-0 capitalize">For {pg.gender}</span>
              )}
              {pg.availableRooms != null && (
                <span className="plate !rotate-0 bg-flyer">
                  {pg.availableRooms} room{pg.availableRooms === 1 ? "" : "s"} available
                </span>
              )}
            </div>
          )}
        </div>

        <div className="text-right">
          <p className="mono-label text-faded">From</p>
          <p className="disp text-5xl text-green-deep">₹{inr(pg.rentSingle)}</p>
          <p className="mono-label text-faded mt-1">per month · single</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-8 items-start">
        {/* LEFT */}
        <div className="space-y-8 min-w-0">
          {/* gallery */}
          <div className="relative border-2 border-ink bg-board">
            {images.length > 0 ? (
              <img
                src={images[currentImage]}
                alt={`${pg.name} — photo ${currentImage + 1} of ${images.length}`}
                className="w-full aspect-[16/10] object-cover"
              />
            ) : (
              <div className="w-full aspect-[16/10] grid place-content-center text-center text-faded">
                <ImageOff size={32} className="mx-auto mb-3" aria-hidden="true" />
                <p className="mono-label">No photos on this flyer yet</p>
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((i) => (i === 0 ? images.length - 1 : i - 1))}
                  className="btn btn-icon absolute left-3 top-1/2 -translate-y-1/2"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setCurrentImage((i) => (i + 1) % images.length)}
                  className="btn btn-icon absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label="Next photo"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            <button
              onClick={() => setSaved(!saved)}
              className={`btn btn-icon absolute top-3 right-3 ${saved ? "!bg-green" : ""}`}
              aria-pressed={saved}
              aria-label={saved ? "Remove from saved" : "Save this flyer"}
            >
              <Bookmark size={18} className={saved ? "fill-ink" : ""} />
            </button>
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 flex-wrap -mt-3">
              {images.map((url, i) => (
                <button
                  key={url}
                  onClick={() => setCurrentImage(i)}
                  className={`border-2 w-20 h-16 overflow-hidden cursor-pointer p-0 bg-board transition-colors ${
                    i === currentImage ? "border-green-deep" : "border-ink/40 hover:border-ink"
                  }`}
                  aria-label={`Show photo ${i + 1}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* rent tickets */}
          <section className="border-2 border-ink bg-flyer">
            <h2 className="mono-label text-faded px-6 pt-5">Rent per month</h2>
            <div className="grid grid-cols-3 divide-x-2 divide-dashed divide-ink/40 mt-3 border-t-2 border-dashed border-ink/40">
              {tiers.map(([label, value]) => (
                <div key={label} className="p-5 md:p-6 text-center">
                  <p className="mono-label text-faded mb-1.5">{label}</p>
                  <p className={`disp text-2xl md:text-3xl ${value != null ? "" : "text-faded"}`}>
                    {value != null ? `₹${inr(value)}` : "—"}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* amenities */}
          <section className="border-2 border-ink bg-flyer p-6">
            <h2 className="mono-label text-faded mb-5">On the flyer</h2>
            <ul className="grid sm:grid-cols-3 gap-3 list-none p-0 m-0">
              {amenityRows.map(([label, available]) => (
                <li
                  key={label}
                  className={`flex items-center gap-2.5 border-2 px-3.5 py-2.5 ${
                    available ? "border-ink" : "border-ink/25 text-faded"
                  }`}
                >
                  {available ? (
                    <Check size={16} className="text-green-deep flex-none" aria-hidden="true" />
                  ) : (
                    <X size={16} className="text-red flex-none" aria-hidden="true" />
                  )}
                  <span className={`text-sm ${available ? "" : "line-through decoration-2"}`}>{label}</span>
                  <span className="sr-only">{available ? "available" : "not available"}</span>
                </li>
              ))}
            </ul>
            <p className="mono-data text-xs text-faded mt-4">
              Laundry, parking and the rest — ask the owner when you call.
            </p>
          </section>
        </div>

        {/* RIGHT — the contact flyer */}
        <aside className="lg:sticky lg:top-32">
          <div className="flyer" style={{ "--tilt": "1deg", "--tape-tilt": "-3deg" }}>
            <span className="tape" aria-hidden="true" />
            <div className="p-6">
              <p className="mono-label text-faded mb-1.5">Contact owner</p>
              <p className="disp text-2xl mb-1">{pg.ownerName}</p>
              <p className="mono-data text-lg mb-6">{pg.contactNumber}</p>

              <a
                href={`tel:${pg.contactNumber}`}
                className="btn btn-green w-full mb-3"
              >
                <Phone size={16} aria-hidden="true" /> Call owner
              </a>

              <a
                href={`https://wa.me/91${pg.contactNumber}`}
                target="_blank"
                rel="noreferrer"
                className="btn w-full"
              >
                <MessageCircle size={16} aria-hidden="true" /> WhatsApp
              </a>

              {pg.alternateContact && (
                <p className="mono-data text-xs text-faded mt-4 text-center">
                  Alternate: {pg.alternateContact}
                </p>
              )}
            </div>

            <TearStrip text={pg.contactNumber} count={5} />
          </div>
          <p className="mono-data text-[11px] text-faded mt-4 text-center">
            StayPoint takes no commission. The number above is the owner's own.
          </p>
        </aside>
      </div>
    </div>
  );
}
