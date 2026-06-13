"use client";

import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, Trash2, Eye, Plus } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { useRole } from "../src/lib/role.js";
import { pgApi, ApiError } from "../src/lib/api.js";
import TearStrip from "../components/TearStrip.jsx";

const TILTS = ["-1.1deg", "0.8deg", "-0.5deg", "1.2deg", "-0.9deg", "0.6deg"];

const inr = (n) => Number(n).toLocaleString("en-IN");

export default function MyListings() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { isOwner } = useRole();

  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    pgApi
      .mine()
      .then((data) => {
        setPgs(data);
        setError("");
      })
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not reach the server. Is the backend running?"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isOwner) load();
  }, [isOwner, load]);

  const handleDelete = async (pg) => {
    if (!window.confirm(`Delete "${pg.name}"? This can't be undone.`)) return;
    setDeletingId(pg.id);
    try {
      await pgApi.remove(pg.id);
      setPgs((prev) => prev.filter((p) => p.id !== pg.id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete the listing.");
    } finally {
      setDeletingId(null);
    }
  };

  // --- Auth gate: owners only ---
  if (!isSignedIn || !isOwner) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="flyer max-w-md w-full p-9 text-center" style={{ "--tilt": "-1deg" }}>
          <span className="tape" aria-hidden="true" />
          <p className="mono-label text-faded mb-2">Owners only</p>
          <h2 className="disp text-3xl mb-3">No flyers under your name.</h2>
          <p className="text-faded mb-7 text-sm">
            {isSignedIn
              ? "Your account isn't a PG-owner account."
              : "Log in as a PG owner to manage your flyers."}
          </p>
          <Link to="/login" className="btn btn-green w-full">
            {isSignedIn ? "Switch account" : "Log in / Sign up"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto">
        {/* header */}
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <p className="mono-label text-faded mb-1">Owner&rsquo;s drawer</p>
            <h1 className="disp text-4xl sm:text-5xl">My flyers.</h1>
          </div>
          <Link to="/add-pg" className="btn btn-ink">
            <Plus size={16} aria-hidden="true" /> Paste a new flyer
          </Link>
        </div>

        {/* states */}
        {loading && (
          <p className="mono-label text-faded animate-pulse text-center mt-20">
            Going through the drawer…
          </p>
        )}

        {!loading && error && (
          <div className="max-w-md mx-auto mt-16">
            <div className="flyer p-8 text-center" style={{ "--tilt": "0.8deg" }}>
              <span className="tape" aria-hidden="true" />
              <p className="mono-label text-red mb-2">Board unreachable</p>
              <p className="text-faded text-sm mb-6">{error}</p>
              <button onClick={load} className="btn btn-ink w-full">
                Try again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && pgs.length === 0 && (
          <div className="max-w-md mx-auto mt-16">
            <div className="flyer p-9 text-center" style={{ "--tilt": "-1deg" }}>
              <span className="tape" aria-hidden="true" />
              <h2 className="disp text-3xl mb-3">The drawer is empty.</h2>
              <p className="text-faded text-sm mb-7">
                You haven&rsquo;t pasted a single flyer yet. Your rooms can&rsquo;t fill
                themselves.
              </p>
              <Link to="/add-pg" className="btn btn-green w-full">
                <Plus size={16} aria-hidden="true" /> Paste your first flyer
              </Link>
            </div>
          </div>
        )}

        {/* listings */}
        {!loading && !error && pgs.length > 0 && (
          <>
            <p className="mono-data text-faded text-sm mb-6">
              {pgs.length} flyer{pgs.length === 1 ? "" : "s"} on the board
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-10">
              {pgs.map((pg, i) => (
                <article
                  key={pg.id}
                  className="flyer flex flex-col"
                  style={{ "--tilt": TILTS[i % TILTS.length] }}
                >
                  <span className="tape" aria-hidden="true" />

                  {/* photo strip (the old page threw owners' photos away) */}
                  {pg.imageUrls && pg.imageUrls.length > 0 ? (
                    <img
                      src={pg.imageUrls[0]}
                      alt={pg.name}
                      className="w-full h-36 object-cover border-b-2 border-ink"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-36 border-b-2 border-ink border-dashed grid place-content-center">
                      <p className="mono-label text-faded">No photo on this flyer</p>
                    </div>
                  )}

                  <div className="p-5 flex flex-col grow">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="disp text-2xl leading-tight">{pg.name}</h3>
                      <span className="mono-data text-faded text-xs shrink-0 pt-1.5">
                        №&thinsp;{pg.id}
                      </span>
                    </div>
                    <p className="text-faded text-sm mb-3 line-clamp-2">{pg.address}</p>

                    <p className="mb-5">
                      <span className="disp text-3xl">₹{inr(pg.rentSingle)}</span>
                      <span className="mono-label text-faded ml-2">/mo single</span>
                    </p>

                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => navigate(`/edit-pg/${pg.id}`)}
                        className="btn btn-green flex-1 !px-3"
                      >
                        <Pencil size={14} aria-hidden="true" /> Edit
                      </button>
                      <button
                        onClick={() => navigate(`/pg/${pg.id}`)}
                        className="btn btn-icon"
                        title="View flyer"
                        aria-label={`View ${pg.name}`}
                      >
                        <Eye size={15} aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleDelete(pg)}
                        disabled={deletingId === pg.id}
                        className="btn btn-icon btn-red"
                        title="Tear it down"
                        aria-label={`Delete ${pg.name}`}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <TearStrip
                    text={pg.contactNumber || "staypoint"}
                    to={`/pg/${pg.id}`}
                    label={`Open ${pg.name}`}
                  />
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
