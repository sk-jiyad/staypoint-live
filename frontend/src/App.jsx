import { useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RoleOnboarding from "../components/RoleOnboarding";
import Landing from "../pages/Landing";
import ExplorePGs from "../pages/ExplorePGs";
import AddPG from "../pages/AddPG";
import PGDetails from "../pages/PGDetails";
import Login from "../pages/Login";
import MyListings from "../pages/MyListings";
import EditPG from "../pages/EditPG";
import "./index.css";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="flyer max-w-md w-full text-center" style={{ "--tilt": "-1.2deg" }}>
        <span className="tape" aria-hidden="true" />
        <div className="p-10">
          <p className="mono-label text-faded mb-3">Error 404</p>
          <h1 className="disp text-5xl mb-3">Torn off.</h1>
          <p className="text-faded mb-8">
            Somebody already took this flyer. The page you're after isn't on the board.
          </p>
          <Link to="/explore" className="btn btn-ink w-full">
            Back to the board →
          </Link>
        </div>
        <div className="tear-strip" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="tear-tab" data-torn={i === 2}>
              staypoint
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-wall text-ink">
      <ScrollToTop />
      <Navbar />
      <RoleOnboarding />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/explore" element={<ExplorePGs />} />
          <Route path="/add-pg" element={<AddPG />} />
          <Route path="/pg/:id" element={<PGDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/edit-pg/:id" element={<EditPG />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Analytics />
    </div>
  );
}

export default App;
