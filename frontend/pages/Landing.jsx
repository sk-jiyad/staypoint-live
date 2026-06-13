import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Phone, ImageOff, Wifi, UtensilsCrossed, Snowflake } from "lucide-react"
import TearStrip from "../components/TearStrip"
import CountUp from "../components/CountUp.jsx"
import { useReveal } from "../src/lib/useReveal.js"
import { pgApi } from "../src/lib/api.js"

const inr = (n) => Number(n).toLocaleString("en-IN")

// Shown when the backend is unreachable — clearly marked, never passed off as real.
const SPECIMEN = {
  specimen: true,
  name: "Sunrise PG",
  address: "Beside Aayakar Bhawan, Gobindpur, Asansol",
  rentSingle: 4500,
  contactNumber: "98XXX-XXXXX",
  wifiAvailable: true,
  foodProvided: true,
  acAvailable: false,
}

function SpinBadge() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="spin-slow w-24 h-24 md:w-28 md:h-28 text-ink"
      aria-hidden="true"
    >
      <defs>
        <path id="ring" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
      </defs>
      <circle cx="60" cy="60" r="58" fill="var(--color-green)" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="26" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <text fontSize="12.5" fontFamily="'Courier Prime', monospace" fontWeight="700" letterSpacing="2.5" fill="currentColor">
        <textPath href="#ring">OWNER LISTED ✶ NO BROKERAGE ✶</textPath>
      </text>
    </svg>
  )
}

function HeroFlyer({ pg }) {
  const amenities = [
    pg.wifiAvailable && ["WiFi", Wifi],
    pg.foodProvided && ["Food", UtensilsCrossed],
    pg.acAvailable && ["AC", Snowflake],
  ].filter(Boolean)

  const image = pg.imageUrls && pg.imageUrls.length > 0 ? pg.imageUrls[0] : null

  return (
    <div
      className="flyer w-full max-w-sm"
      data-reveal
      data-reveal-index={0}
      style={{ "--tilt": "1.6deg", "--tape-tilt": "2deg" }}
    >
      <span className="tape" aria-hidden="true" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="mono-label text-faded">
            {pg.specimen ? "Specimen flyer" : "Fresh on the board"}
          </p>
          <span className="plate plate-vacant">To-let</span>
        </div>

        {image ? (
          <img src={image} alt={pg.name} className="w-full h-40 object-cover border-2 border-ink mb-4" />
        ) : (
          <div className="w-full h-40 border-2 border-ink mb-4 bg-board grid place-content-center text-faded">
            <ImageOff size={28} aria-hidden="true" />
          </div>
        )}

        <h3 className="disp text-2xl mb-1">{pg.name}</h3>
        <p className="mono-data text-xs text-faded mb-4">{pg.address}</p>

        <div className="flex items-end justify-between border-t-2 border-ink pt-3">
          <div>
            <p className="mono-label text-faded">Single / month</p>
            <p className="disp text-3xl">₹{inr(pg.rentSingle)}</p>
          </div>
          <div className="flex gap-1.5">
            {amenities.map(([label, Icon]) => (
              <span key={label} className="border-2 border-ink p-1.5" title={label} aria-label={label}>
                <Icon size={14} />
              </span>
            ))}
          </div>
        </div>
      </div>

      <TearStrip
        text={pg.contactNumber}
        count={5}
        to={pg.specimen ? undefined : `/pg/${pg.id}`}
        label={pg.specimen ? undefined : `Open ${pg.name}`}
      />
    </div>
  )
}

export default function Landing() {
  const [featured, setFeatured] = useState(null)
  const [count, setCount] = useState(null)

  // Re-arm the scroll reveal once the featured flyer mounts (it arrives after
  // the fetch). The how-it-works and testimonial flyers are observed on mount.
  useReveal([featured])

  useEffect(() => {
    let active = true
    pgApi
      .list()
      .then((data) => {
        if (!active) return
        setCount(data.length)
        setFeatured(data.length > 0 ? data[0] : SPECIMEN)
      })
      .catch(() => active && setFeatured(SPECIMEN))
    return () => {
      active = false
    }
  }, [])

  const towns = ["Asansol", "Durgapur", "Raniganj", "Kulti", "Burnpur", "Andal", "No brokers", "No spam"]

  return (
    <div>
      {/* ---------------------------------------------------------- hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 grid lg:grid-cols-[1.25fr_1fr] gap-14 items-center">
        <div>
          <p className="mono-label text-green-deep mb-5">Staypoint · PG discovery for students</p>
          <h1 className="disp text-[clamp(2.7rem,7.5vw,5.6rem)] mb-6">
            Every wall in town says{" "}
            <span className="accent normal-case text-green-deep">to-let.</span>
            <br />
            We made it searchable.
          </h1>
          <p className="text-lg text-faded max-w-[46ch] mb-9">
            Real rooms near your college, real rents, and the owner's number on a tab
            you can actually tear off. No brokers. No "rates in DM".
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/explore" className="btn btn-ink !px-7 !py-4">
              Scan the board →
            </Link>
            <Link to="/add-pg" className="btn !px-7 !py-4">
              Paste your flyer
            </Link>
          </div>

          {/* honest stats — the live count ticks up as it lands */}
          <div className="mt-12 grid grid-cols-3 max-w-md border-2 border-ink divide-x-2 divide-ink bg-flyer">
            <div className="p-4 text-center">
              <p className="disp text-2xl mono-data">
                <CountUp end={count} />
              </p>
              <p className="mono-label text-faded mt-1">flyers live</p>
            </div>
            <div className="p-4 text-center">
              <p className="disp text-2xl mono-data">₹0</p>
              <p className="mono-label text-faded mt-1">brokerage</p>
            </div>
            <div className="p-4 text-center">
              <p className="disp text-2xl mono-data">2 taps</p>
              <p className="mono-label text-faded mt-1">to call</p>
            </div>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end pt-6 lg:pr-6">
          {featured ? (
            <HeroFlyer pg={featured} />
          ) : (
            <div className="flyer w-full max-w-sm h-[480px] grid place-content-center" style={{ "--tilt": "1.6deg" }}>
              <span className="tape" aria-hidden="true" />
              <p className="mono-label text-faded">Pasting up the board…</p>
            </div>
          )}
          <div className="absolute -bottom-8 -left-2 md:left-6">
            <SpinBadge />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- street banner */}
      <div className="banner py-3" aria-hidden="true">
        <div className="banner-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0">
              {towns.map((t) => (
                <span key={t + dup} className="disp text-xl px-6 whitespace-nowrap">
                  {t} <span className="text-flyer/40 pl-6">✶</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------- what's on the board */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-xl mb-14">
          <p className="mono-label text-green-deep mb-3">What's on the board</p>
          <h2 className="disp text-4xl md:text-5xl">
            A flyer that tells you{" "}
            <span className="accent normal-case text-green-deep">the truth.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 border-2 border-ink bg-flyer divide-y-2 divide-ink sm:divide-y-0">
          {[
            {
              head: "Owner-listed",
              body: "Every flyer goes up by the owner, with their direct number printed on the tabs. No middlemen taking a cut of your deposit.",
            },
            {
              head: "Filters that work",
              body: "Rent ceiling, gender, vacancy. Three clicks instead of three weeks of scrolling rental groups.",
            },
            {
              head: "Photos, or it says so",
              body: "Owners upload their own photos. A listing with no photos shows you that honestly instead of a stock bedroom.",
            },
            {
              head: "Call, don't DM",
              body: "One tap to call, one to WhatsApp — straight from the flyer. Skip the \"rates in DM\" circus entirely.",
            },
          ].map((f, i) => (
            <div
              key={f.head}
              className={`p-8 md:p-10 hover:bg-tape/40 transition-colors ${
                i % 2 === 0 ? "sm:border-r-2 sm:border-ink" : ""
              } ${i > 1 ? "sm:border-t-2 sm:border-ink" : ""}`}
            >
              <p className="accent text-green-deep text-xl mb-2" aria-hidden="true">✓</p>
              <h3 className="disp text-2xl mb-3">{f.head}</h3>
              <p className="text-faded leading-relaxed max-w-[44ch]">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------- how it works */}
      <section className="bg-board border-y-2 border-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-xl mb-14">
            <p className="mono-label text-green-deep mb-3">How it works</p>
            <h2 className="disp text-4xl md:text-5xl">Three steps. No third step is "negotiate with a broker".</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              ["01", "Scan the board", "Browse every PG in town in one place. Filter by rent, gender and vacancy until the list is yours."],
              ["02", "Tear a tab", "Open a flyer, check the photos and the per-room rents, then take the owner's number with you."],
              ["03", "Make the call", "Call or WhatsApp the owner directly. Visit, haggle, move in. We were never in the middle."],
            ].map(([num, head, body], i) => (
              <div
                key={num}
                className="flyer p-8"
                data-reveal
                data-reveal-index={i}
                style={{ "--tilt": `${(Number(num) - 2) * 0.7}deg` }}
              >
                <p className="mono-data font-bold text-5xl text-green-deep mb-4">{num}</p>
                <h3 className="disp text-2xl mb-3">{head}</h3>
                <p className="text-faded leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ owner band */}
      <section className="bg-green border-b-2 border-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-[1.5fr_auto] gap-10 items-center">
          <div>
            <p className="mono-label text-ink/60 mb-3">For owners</p>
            <h2 className="disp text-4xl md:text-6xl mb-4">
              Got an empty room?
            </h2>
            <p className="text-ink/80 text-lg max-w-[48ch]">
              Your next tenant is scrolling this board right now. Pasting a flyer takes
              about four minutes, photos included — and it never costs you a paisa.
            </p>
          </div>
          <Link to="/add-pg" className="btn btn-ink !px-8 !py-5 justify-self-start lg:justify-self-end">
            Paste your flyer →
          </Link>
        </div>
      </section>

      {/* ----------------------------------------------------- testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-xl mb-16">
          <p className="mono-label text-green-deep mb-3">Notes left on the board</p>
          <h2 className="disp text-4xl md:text-5xl">People who stopped scrolling.</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {[
            { name: "Rahul Kumar", role: "Student", text: "Found my room before my hostel waitlist even moved. Two days, done." },
            { name: "Priya Singh", role: "Student", text: "Called three owners in one evening straight from the flyers. No middleman, no awkward DMs." },
            { name: "Amit Patel", role: "PG owner", text: "Listed my PG in a few minutes and got genuine calls, not time-pass enquiries." },
            { name: "Neha Sharma", role: "Student", text: "The rent filter alone saved me a week of asking 'budget kya hai' in groups." },
            { name: "Rohan Gupta", role: "Student", text: "Photos on the listing matched the actual room. That alone is rare." },
            { name: "Anjali Desai", role: "PG owner", text: "Editing my flyer when a room fills up takes seconds. The board stays honest." },
          ].map((t, i) => (
            <figure
              key={t.name}
              className="flyer p-7"
              data-reveal
              data-reveal-index={i}
              style={{ "--tilt": `${[(-1.4), 1, -0.6, 1.3, -1, 0.7][i]}deg`, "--tape-tilt": `${[3, -4, 2, -2, 4, -3][i]}deg` }}
            >
              <span className="tape" aria-hidden="true" />
              <blockquote className="text-ink leading-relaxed mb-5">"{t.text}"</blockquote>
              <figcaption>
                <p className="disp text-base">{t.name}</p>
                <p className="mono-label text-faded mt-0.5">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- final CTA */}
      <section className="bg-ink text-flyer border-y-2 border-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="disp text-[clamp(2.4rem,6.5vw,5rem)] mb-4">
            Hostel waitlist said no?
          </h2>
          <p className="accent text-green text-3xl md:text-4xl mb-10">the board says yes.</p>
          <Link to="/explore" className="btn btn-green !px-9 !py-5 !text-sm">
            Find a room →
          </Link>
        </div>
      </section>
    </div>
  )
}
