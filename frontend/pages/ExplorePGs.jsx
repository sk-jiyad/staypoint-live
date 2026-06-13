"use client";

import { useEffect, useMemo, useState } from "react";
import { Wifi, UtensilsCrossed, Snowflake, ImageOff, MapPin, ChevronDown, Search } from "lucide-react";
import { Link } from "react-router-dom";
import TearStrip from "../components/TearStrip.jsx";
import { pgApi, ApiError } from "../src/lib/api.js";

const inr = (n) => Number(n).toLocaleString("en-IN");

const amenityIcons = {
  wifi: <Wifi size={15} />,
  food: <UtensilsCrossed size={15} />,
  ac: <Snowflake size={15} />,
};

const statusPlates = {
  vacant: { cls: "plate plate-vacant", text: "Vacant" },
  few: { cls: "plate plate-few", text: "Few left" },
  full: { cls: "plate plate-full", text: "House full" },
};

function statusFor(availableRooms) {
  if (availableRooms == null) return null;
  if (availableRooms <= 0) return "full";
  if (availableRooms <= 2) return "few";
  return "vacant";
}

// Map a backend PGResponseDTO to the shape the flyers render.
function toCard(pg) {
  const amenities = [];
  if (pg.wifiAvailable) amenities.push("wifi");
  if (pg.foodProvided) amenities.push("food");
  if (pg.acAvailable) amenities.push("ac");
  return {
    id: pg.id,
    name: pg.name,
    address: pg.address,
    landmark: pg.landmark,
    rent: pg.rentSingle,
    contact: pg.contactNumber,
    amenities,
    image: pg.imageUrls && pg.imageUrls.length > 0 ? pg.imageUrls[0] : null,
    gender: pg.gender || null,
    availableRooms: pg.availableRooms ?? null,
    status: statusFor(pg.availableRooms ?? null),
  };
}

const TILTS = [-1.1, 0.8, -0.5, 1.2, -0.9, 0.4];
const TAPE_TILTS = [3, -4, 2, -3, 4, -2];

export default function ExplorePGs() {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("Rent (Low→High)");
  const [rentMax, setRentMax] = useState(50000);
  const [gender, setGender] = useState("all");
  const [vacancyOnly, setVacancyOnly] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    pgApi
      .list()
      .then((data) => {
        if (active) {
          setPgs(data.map(toCard));
          setError("");
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Could not reach the server. Is the backend running?"
          );
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Filter + sort client-side over the fetched listings.
  const filteredPGs = useMemo(() => {
    let data = [...pgs];

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (pg) =>
          pg.name.toLowerCase().includes(term) ||
          pg.address.toLowerCase().includes(term)
      );
    }

    data = data.filter((pg) => Number(pg.rent) <= rentMax);

    if (gender !== "all") {
      data = data.filter((pg) => pg.gender === gender);
    }

    if (vacancyOnly) {
      data = data.filter((pg) => pg.status === "vacant" || pg.status === "few");
    }

    switch (sortBy) {
      case "Rent (Low→High)":
        data.sort((a, b) => a.rent - b.rent);
        break;
      case "Rent (High→Low)":
        data.sort((a, b) => b.rent - a.rent);
        break;
      case "Newest":
        data.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }

    return data;
  }, [pgs, searchTerm, rentMax, gender, vacancyOnly, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="mono-label text-green-deep mb-2">Browse rooms</p>
          <h1 className="disp text-5xl md:text-6xl">The board</h1>
        </div>
        {!loading && !error && (
          <p className="mono-data text-sm text-faded border-2 border-ink bg-flyer px-3 py-1.5">
            {filteredPGs.length} flyer{filteredPGs.length === 1 ? "" : "s"} up
          </p>
        )}
      </div>

      {/* toolbar — the filter form */}
      <div className="border-2 border-ink bg-flyer p-5 md:p-6 mb-12">
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-faded" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search by PG name or area…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="field !pl-11"
            aria-label="Search by PG name or area"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          {/* rent ceiling */}
          <div>
            <label htmlFor="rent-range" className="label">
              Max rent (single) — <span className="mono-data text-ink">₹{inr(rentMax)}</span>
            </label>
            <input
              id="rent-range"
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={rentMax}
              onChange={(e) => setRentMax(parseInt(e.target.value))}
              className="range mt-3"
            />
          </div>

          {/* gender */}
          <div>
            <p className="label" id="gender-label">For</p>
            <div className="flex" role="group" aria-labelledby="gender-label">
              {[
                ["all", "All"],
                ["boys", "Boys"],
                ["girls", "Girls"],
                ["coed", "Co-ed"],
              ].map(([value, text]) => (
                <button
                  key={value}
                  type="button"
                  className="seg flex-1"
                  data-on={gender === value}
                  onClick={() => setGender(value)}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>

          {/* vacancy */}
          <div>
            <p className="label">Vacancy</p>
            <label className="flex items-center gap-3 cursor-pointer border-2 border-ink bg-flyer px-4 py-[0.62rem]">
              <input
                type="checkbox"
                checked={vacancyOnly}
                onChange={(e) => setVacancyOnly(e.target.checked)}
                className="checkbox"
              />
              <span className="mono-data text-sm">Rooms available only</span>
            </label>
          </div>

          {/* sort */}
          <div>
            <label htmlFor="sort" className="label">Sort by</label>
            <div className="select-wrap">
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="field"
              >
                <option>Rent (Low→High)</option>
                <option>Rent (High→Low)</option>
                <option>Newest</option>
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* states */}
      {loading && (
        <p className="mono-label text-faded text-center mt-20">Pasting up the board…</p>
      )}

      {!loading && error && (
        <div className="max-w-md mx-auto mt-16 border-2 border-red bg-flyer p-6 text-center">
          <p className="mono-label text-red mb-2">Board unreachable</p>
          <p className="text-faded text-sm">{error}</p>
        </div>
      )}

      {/* the flyers */}
      {!loading && !error && filteredPGs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7 gap-y-12 pt-4">
          {filteredPGs.map((pg, i) => (
            <article
              key={pg.id}
              className="flyer flex flex-col"
              style={{
                "--tilt": `${TILTS[i % TILTS.length]}deg`,
                "--tape-tilt": `${TAPE_TILTS[i % TAPE_TILTS.length]}deg`,
              }}
            >
              <span className="tape" aria-hidden="true" />

              {/* photo */}
              <Link to={`/pg/${pg.id}`} className="block relative no-underline" aria-label={pg.name}>
                {pg.image ? (
                  <img src={pg.image} alt={pg.name} className="w-full h-44 object-cover border-b-2 border-ink" />
                ) : (
                  <div className="w-full h-44 border-b-2 border-ink bg-board grid place-content-center text-center text-faded">
                    <ImageOff size={24} className="mx-auto mb-2" aria-hidden="true" />
                    <span className="mono-label">No photo yet</span>
                  </div>
                )}
                {pg.status && (
                  <span className={`${statusPlates[pg.status].cls} absolute top-3 right-3`}>
                    {statusPlates[pg.status].text}
                  </span>
                )}
              </Link>

              {/* body */}
              <div className="p-5 flex-1 flex flex-col">
                <h2 className="disp text-xl mb-1.5">
                  <Link to={`/pg/${pg.id}`} className="no-underline text-ink hover:text-green-deep transition-colors">
                    {pg.name}
                  </Link>
                </h2>
                <p className="mono-data text-xs text-faded flex items-start gap-1.5 mb-4">
                  <MapPin size={13} className="mt-0.5 flex-none" aria-hidden="true" />
                  <span className="line-clamp-2">{pg.address}</span>
                </p>

                <div className="flex items-end justify-between mt-auto border-t-2 border-dashed border-ink/40 pt-3.5">
                  <div>
                    <p className="mono-label text-faded">Single / mo</p>
                    <p className="disp text-2xl">₹{inr(pg.rent)}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {pg.amenities.length > 0 ? (
                      pg.amenities.map((a) => (
                        <span key={a} className="border-2 border-ink p-1.5" title={a.toUpperCase()} aria-label={a}>
                          {amenityIcons[a]}
                        </span>
                      ))
                    ) : (
                      <span className="mono-label text-faded self-end">Ask owner</span>
                    )}
                  </div>
                </div>

                {(pg.gender || pg.availableRooms != null || pg.landmark) && (
                  <p className="mono-data text-[11px] text-faded mt-3">
                    {[
                      pg.gender && pg.gender.charAt(0).toUpperCase() + pg.gender.slice(1),
                      pg.availableRooms != null && `${pg.availableRooms} room${pg.availableRooms === 1 ? "" : "s"} left`,
                      pg.landmark && `near ${pg.landmark}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>

              {/* the tabs — tear one off */}
              <TearStrip
                text={pg.contact || "view flyer"}
                count={5}
                to={`/pg/${pg.id}`}
                label={`Open ${pg.name}`}
              />
            </article>
          ))}
        </div>
      )}

      {!loading && !error && filteredPGs.length === 0 && (
        <div className="max-w-md mx-auto mt-16 flyer p-8 text-center" style={{ "--tilt": "-1deg" }}>
          <span className="tape" aria-hidden="true" />
          <h2 className="disp text-2xl mb-2">
            {pgs.length === 0 ? "The board is bare." : "Nothing under these filters."}
          </h2>
          <p className="text-faded text-sm">
            {pgs.length === 0
              ? "No PGs listed yet — be the first owner to paste a flyer."
              : "Raise the rent ceiling or clear a filter and the flyers come back."}
          </p>
        </div>
      )}
    </div>
  );
}
