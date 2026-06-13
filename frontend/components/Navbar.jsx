"use client"

import { useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { Menu, X, ArrowUpRight } from "lucide-react"
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react"
import { useRole } from "../src/lib/role.js"

function BoardLink({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `mono-label no-underline px-1 pb-0.5 border-b-2 transition-colors ${
          isActive
            ? "border-green-deep text-ink"
            : "border-transparent text-faded hover:text-ink hover:border-ink"
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { isOwner } = useRole()
  const close = () => setIsOpen(false)

  return (
    <header className="sticky top-0 z-50">
      {/* painted notice above the door */}
      <div className="bg-ink text-flyer">
        <p className="mono-data text-[10px] uppercase tracking-[0.3em] text-center py-1.5 px-3">
          To-let boards of Asansol &amp; beyond — now searchable
        </p>
      </div>

      <nav className="bg-flyer border-b-[3px] border-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* wordmark */}
            <Link to="/" className="no-underline flex items-baseline gap-1.5 group" onClick={close}>
              <span className="disp text-2xl text-ink leading-none">
                Stay<span className="text-green-deep group-hover:text-ink transition-colors">point</span>
              </span>
              <span className="accent text-green-deep text-sm leading-none" aria-hidden="true">*</span>
            </Link>

            {/* desktop links */}
            <div className="hidden md:flex items-center gap-7">
              <BoardLink to="/">The wall</BoardLink>
              <BoardLink to="/explore">Browse rooms</BoardLink>
              {isOwner && <BoardLink to="/add-pg">Paste a flyer</BoardLink>}
              {isOwner && <BoardLink to="/my-listings">My flyers</BoardLink>}
            </div>

            {/* auth */}
            <div className="hidden md:flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn !py-2 !px-4">Log in</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn btn-green !py-2 !px-4">Sign up</button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>

            {/* mobile toggle */}
            <button
              className="md:hidden btn btn-icon !py-2 !px-2"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* mobile menu: the whole wall */}
        {isOpen && (
          <div className="md:hidden fixed inset-x-0 top-[7.1rem] bottom-0 bg-ink text-flyer z-50 flex flex-col">
            <div className="flex-1 flex flex-col justify-center gap-2 px-6">
              {[
                ["/", "The wall"],
                ["/explore", "Browse rooms"],
                ...(isOwner
                  ? [
                      ["/add-pg", "Paste a flyer"],
                      ["/my-listings", "My flyers"],
                    ]
                  : []),
              ].map(([to, text]) => (
                <Link
                  key={to}
                  to={to}
                  onClick={close}
                  className="no-underline disp text-4xl text-flyer hover:text-green flex items-center justify-between border-b-2 border-flyer/15 py-4 transition-colors"
                >
                  {text}
                  <ArrowUpRight size={28} aria-hidden="true" />
                </Link>
              ))}
            </div>
            <div className="px-6 pb-8 flex gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn flex-1" onClick={close}>Log in</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn btn-green flex-1" onClick={close}>Sign up</button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-3">
                  <UserButton afterSignOutUrl="/" />
                  <span className="mono-label text-flyer/60">Signed in</span>
                </div>
              </SignedIn>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
