import { Link } from "react-router-dom"
import TearStrip from "./TearStrip"

export default function Footer() {
  return (
    <footer className="bg-ink text-flyer border-t-[3px] border-ink mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <p className="disp text-2xl mb-3">
              Stay<span className="text-green">point</span>
            </p>
            <p className="text-flyer/60 text-sm max-w-[24ch]">
              Every to-let wall in town, on one honest board.
            </p>
          </div>

          <div>
            <h3 className="mono-label text-green mb-4">Board</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/explore" className="no-underline text-flyer/80 hover:text-green transition-colors">Browse rooms</Link></li>
              <li><Link to="/add-pg" className="no-underline text-flyer/80 hover:text-green transition-colors">Paste a flyer</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mono-label text-green mb-4">Towns</h3>
            <ul className="space-y-2.5 text-sm text-flyer/80">
              <li>Asansol</li>
              <li>Durgapur</li>
              <li>Raniganj</li>
            </ul>
          </div>

          <div>
            <h3 className="mono-label text-green mb-4">Fine print</h3>
            <ul className="space-y-2.5 text-sm text-flyer/80">
              <li>MIT licensed</li>
              <li>No brokerage, ever</li>
            </ul>
          </div>
        </div>
      </div>

      {/* the wordmark, painted across the whole wall */}
      <div className="overflow-hidden px-2 select-none" aria-hidden="true">
        <p className="disp text-green text-center whitespace-nowrap leading-[0.78] translate-y-[0.08em] text-[clamp(3.5rem,14.5vw,13rem)]">
          STAYPOINT
        </p>
      </div>

      <div className="border-t-2 border-flyer/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-between gap-2">
          <p className="mono-data text-[11px] uppercase tracking-[0.18em] text-flyer/50">
            © 2026 StayPoint
          </p>
          <p className="mono-data text-[11px] uppercase tracking-[0.18em] text-flyer/50">
            Painted in Asansol by SK Jiyad
          </p>
        </div>
      </div>

      {/* the page itself ends in tear-off tabs */}
      <div className="bg-flyer text-ink">
        <TearStrip text="staypoint · find a room" count={8} tornAt={5} />
      </div>
    </footer>
  )
}
