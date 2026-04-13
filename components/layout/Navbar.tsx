"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Logo placeholder SVG
const WorkLinLogo = () => (
  <div className="flex items-center gap-2.5">
    <div className="relative w-8 h-8">
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
        <path d="M8 10h4l3 8 3-8h2l3 8 3-8h4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 18h16" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7c3aed"/>
            <stop offset="1" stopColor="#4f46e5"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
    <span className="text-xl font-bold tracking-tight text-white">
      Work<span className="text-violet-400">Lin</span>
    </span>
  </div>
);

const NAV_LINKS = [
  { label: "Cómo funciona", href: "#how-it-works" },
  { label: "Precios", href: "#pricing" },
  { label: "Sectores", href: "#sectors" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={scrolled ? { backgroundColor: "rgba(10,10,15,0.8)" } : {}}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl border-b border-white\/10 shadow-lg shadow-black\/20"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" aria-label="WorkLin inicio">
          <WorkLinLogo />
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-white/60 hover:text-white transition-colors duration-200 font-medium"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-white/70 hover:text-white transition-colors font-medium px-4 py-2"
          >
            Entrar
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold px-5 py-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105"
          >
            Registrarse gratis
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
          aria-label="Abrir menú"
        >
          <span className="block w-6 h-0.5 bg-current mb-1.5 transition-all" style={{ transform: menuOpen ? "rotate(45deg) translateY(8px)" : "none" }} />
          <span className="block w-6 h-0.5 bg-current mb-1.5 transition-all" style={{ opacity: menuOpen ? 0 : 1 }} />
          <span className="block w-6 h-0.5 bg-current transition-all" style={{ transform: menuOpen ? "rotate(-45deg) translateY(-8px)" : "none" }} />
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden backdrop-blur-xl border-b border-white\/10"
            style={{ backgroundColor: "rgba(13,13,20,0.95)" }}
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-white/70 hover:text-white transition-colors font-medium py-2"
                >
                  {link.label}
                </a>
              ))}
              <hr className="border-white/10" />
              <Link href="/login" className="text-white/70 hover:text-white transition-colors font-medium py-2">
                Entrar
              </Link>
              <Link
                href="/login"
                className="text-center font-semibold px-5 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
              >
                Registrarse gratis
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}