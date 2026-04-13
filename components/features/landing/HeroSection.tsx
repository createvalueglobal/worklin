"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

// Floating orbs background
const Orbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
    {/* Large primary orb */}
    <motion.div
      animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-40 left-1/2 -translate-x-1/4 w-[700px] h-[700px] rounded-full bg-violet-600/30 blur-[120px]"
    />
    {/* Secondary orb */}
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
      transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute top-20 -right-20 w-[500px] h-[500px] rounded-full bg-indigo-600/25 blur-[100px]"
    />
    {/* Bottom orb */}
    <motion.div
      animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-fuchsia-700/20 blur-[100px]"
    />
    {/* Grid pattern overlay */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }}
    />
  </div>
);

// Animated stat badge
const StatBadge = ({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="flex flex-col items-center px-3 py-3 sm:px-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
  >
    <span className="text-xl sm:text-2xl font-bold text-white">{value}</span>
    <span className="text-[10px] sm:text-xs text-white/50 font-medium mt-0.5 text-center leading-tight">{label}</span>
  </motion.div>
);

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
      <Orbs />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-6"
      >
        {/* Pill badge */}
        <motion.div variants={item}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/15 border border-violet-400/30 text-violet-300 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            Plataforma de empleo sectorial — España
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          variants={item}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]"
        >
          <span className="text-white">El talento que</span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
            buscas, al alcance
          </span>
          <br />
          <span className="text-white">de un clic</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={item}
          className="text-lg sm:text-xl text-white/55 max-w-2xl leading-relaxed"
        >
          Conectamos profesionales del sector servicios con empresas que necesitan
          contratar. Rápido, directo y sin intermediarios.
        </motion.p>

        {/* Dual CTA */}
        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full sm:w-auto"
        >
          <Link
            href="/login?role=professional"
            className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Soy profesional
            <svg className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/login?role=company"
            className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/8 hover:bg-white/12 backdrop-blur-sm border border-white/15 hover:border-white/25 text-white font-bold text-base transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Soy empresa
            <svg className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>

        {/* Trust note */}
        <motion.div variants={item} className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm text-white/35 font-medium">
          <span>✓ Profesionales siempre gratis</span>
          <span className="hidden sm:inline">·</span>
          <span>✓ Sin tarjeta para empezar</span>
          <span className="hidden sm:inline">·</span>
          <span>✓ Cancela cuando quieras</span>
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={item}
          className="grid grid-cols-3 gap-3 mt-4 w-full max-w-sm sm:max-w-none sm:flex sm:flex-wrap sm:justify-center sm:gap-4"
        >
          <StatBadge value="100%" label="Gratis pro." delay={1.1} />
          <StatBadge value="48h" label="Contacto" delay={1.2} />
          <StatBadge value="2" label="Provincias" delay={1.3} />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-white/25 font-medium tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-0.5 h-8 bg-gradient-to-b from-white/30 to-transparent rounded-full"
        />
      </motion.div>
    </section>
  );
}