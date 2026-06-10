"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react"
import { useRole } from "../src/lib/role.js"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { isOwner } = useRole()

  return (
    <nav className="sticky top-0 z-50 bg-[#191919] border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group no-underline">
            <img src="/logo.svg" alt="StayPoint Logo" className="w-40" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-white hover:text-[#87E64B] transition no-underline">
              Home
            </Link>
            <Link to="/explore" className="text-white hover:text-[#87E64B] transition no-underline">
              Explore PGs
            </Link>
            {isOwner && (
              <Link to="/add-pg" className="text-white hover:text-[#87E64B] transition no-underline">
                Add Your PG
              </Link>
            )}
            {isOwner && (
              <Link to="/my-listings" className="text-white hover:text-[#87E64B] transition no-underline">
                My Listings
              </Link>
            )}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-white bg-[#383838] rounded-md transition">Login</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 bg-[#87E64B] text-black rounded-md font-medium">Sign up</button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-gray-800">
            <Link to="/" className="block px-4 py-2 text-white hover:text-green-500 no-underline">
              Home
            </Link>
            <Link to="/explore" className="block px-4 py-2 text-white hover:text-green-500 no-underline">
              Explore PGs
            </Link>
            {isOwner && (
              <Link to="/add-pg" className="block px-4 py-2 text-white hover:text-green-500 no-underline">
                Add Your PG
              </Link>
            )}
            {isOwner && (
              <Link to="/my-listings" className="block px-4 py-2 text-white hover:text-green-500 no-underline">
                My Listings
              </Link>
            )}
            <div className="flex items-center gap-2 px-4 py-2 mt-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="flex-1 px-3 py-2 text-center bg-[#383838] text-white rounded-md text-sm">Login</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="flex-1 px-3 py-2 text-center bg-[#87E64B] text-black rounded-md text-sm font-medium">Sign up</button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
