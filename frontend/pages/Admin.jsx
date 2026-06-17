"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ShieldOff, Trash2, Eye, EyeOff, Snowflake } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { useRole } from "../src/lib/role.js";
import { adminApi, ApiError } from "../src/lib/api.js";

const inr = (n) => Number(n).toLocaleString("en-IN");

export default function Admin() {
  const { isSignedIn } = useAuth();
  const { isAdmin } = useRole();
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [frozen, setFrozen] = useState(false);
  const [freezeBusy, setFreezeBusy] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([adminApi.listPGs(), adminApi.getSettings()])
      .then(([data, settings]) => {
        setPgs(data);
        setFrozen(Boolean(settings.uploadsFrozen));
        setError("");
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load listings."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const toggleVerify = async (pg) => {
    setBusyId(pg.id);
    try {
      await adminApi.verify(pg.id, !pg.verified);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (pg) => {
    if (!window.confirm(`Tear down "${pg.name}"? This can't be undone.`)) return;
    setBusyId(pg.id);
    try {
      await adminApi.remove(pg.id);
      setPgs((list) => list.filter((p) => p.id !== pg.id));
    } finally {
      setBusyId(null);
    }
  };

  const toggleHide = async (pg) => {
    setBusyId(pg.id);
    try {
      await adminApi.setHidden(pg.id, !pg.hidden);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const toggleFreeze = async () => {
    setFreezeBusy(true);
    try {
      await adminApi.setUploadsFrozen(!frozen);
      load();
    } finally {
      setFreezeBusy(false);
    }
  };

  if (!isSignedIn || !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="flyer max-w-md w-full p-9 text-center" style={{ "--tilt": "-1deg" }}>
          <span className="tape" aria-hidden="true" />
          <h2 className="disp text-3xl mb-3">Caretakers only</h2>
          <p className="text-faded text-sm mb-7">
            This is the caretaker's desk. You need an admin account to manage the board.
          </p>
          <Link to="/explore" className="btn btn-ink w-full">Back to the board</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <p className="mono-label text-green-deep mb-2">Caretaker's desk</p>
        <h1 className="disp text-5xl">Manage the board</h1>
        <p className="text-faded text-sm mt-2">Stamp trustworthy flyers as verified, hide ones that break the rules, or freeze new uploads.</p>
      </div>

      {/* Freeze new uploads */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <button
          onClick={toggleFreeze}
          disabled={freezeBusy}
          className={(frozen ? "btn btn-ink" : "btn") + " !py-2 !px-4 inline-flex items-center gap-2"}
        >
          <Snowflake size={15} />
          {frozen ? "Freeze: ON" : "Freeze new uploads: OFF"}
        </button>
        <span className="mono-data text-sm text-faded">
          {frozen
            ? "New uploads are held (hidden) until you turn this off."
            : "New uploads go live immediately."}
        </span>
      </div>

      {loading && <p className="mono-label text-faded">Reading the board…</p>}
      {error && <p className="mono-data text-red">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto border-2 border-ink bg-flyer">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-ink">
                <th className="mono-label text-faded px-4 py-3">PG</th>
                <th className="mono-label text-faded px-4 py-3">Rent</th>
                <th className="mono-label text-faded px-4 py-3">College</th>
                <th className="mono-label text-faded px-4 py-3">Rating</th>
                <th className="mono-label text-faded px-4 py-3">Status</th>
                <th className="mono-label text-faded px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pgs.map((pg) => (
                <tr key={pg.id} className="border-b-2 border-dashed border-ink/30">
                  <td className="px-4 py-3">
                    {pg.hidden || pg.frozen ? (
                      <span className="disp text-lg text-ink">{pg.name}</span>
                    ) : (
                      <Link to={`/pg/${pg.id}`} className="disp text-lg text-ink hover:text-green-deep no-underline">
                        {pg.name}
                      </Link>
                    )}
                    <p className="mono-data text-xs text-faded line-clamp-1">{pg.address}</p>
                  </td>
                  <td className="px-4 py-3 mono-data text-sm">₹{inr(pg.rentSingle)}</td>
                  <td className="px-4 py-3 mono-data text-sm">{pg.nearbyCollege || "—"}</td>
                  <td className="px-4 py-3 mono-data text-sm">
                    {pg.avgRating != null ? `★ ${pg.avgRating.toFixed(1)} (${pg.reviewCount || 0})` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      {pg.verified && <span className="mono-label text-green-deep">Verified</span>}
                      {pg.hidden && <span className="mono-label text-red">Hidden</span>}
                      {pg.frozen && <span className="mono-label text-amber">Frozen (new)</span>}
                      {!pg.verified && !pg.hidden && !pg.frozen && <span className="mono-label text-faded">Live</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleVerify(pg)}
                        disabled={busyId === pg.id}
                        className="btn btn-green !py-1.5 !px-3 inline-flex items-center gap-1"
                      >
                        {pg.verified ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                        {pg.verified ? "Unverify" : "Verify"}
                      </button>
                      <button
                        onClick={() => toggleHide(pg)}
                        disabled={busyId === pg.id}
                        className="btn !py-1.5 !px-3 inline-flex items-center gap-1"
                      >
                        {pg.hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                        {pg.hidden ? "Show" : "Hide"}
                      </button>
                      <button
                        onClick={() => remove(pg)}
                        disabled={busyId === pg.id}
                        className="btn btn-red !py-1.5 !px-3 inline-flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pgs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-faded mono-label">The board is bare.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
