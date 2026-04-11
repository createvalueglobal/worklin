"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

type Tier = {
  name: string;
  price: string;
  priceNote: string;
  profiles: string;
  highlight: boolean;
  badge?: string;
  features: { text: string; included: boolean }[];
  cta: string;
  ctaHref: string;
};

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "0€",
    priceNote: "/ mes",
    profiles: "0 perfiles",
    highlight: false,
    features: [
      { text: "Acceso al buscador", included: true },
      { text: "Filtros básicos (profesión, provincia)", included: true },
      { text: "Ver perfiles (datos difuminados)", included: true },
      { text: "Desbloquear perfiles", included: false },
      { text: "Favoritos", included: false },
      { text: "Histórico de perfiles", included: false },
      { text: "Filtros avanzados", included: false },
    ],
    cta: "Empezar gratis",
    ctaHref: "/register?role=company&plan=free",
  },
  {
    name: "Básico",
    price: "19€",
    priceNote: "/ mes",
    profiles: "3 perfiles",
    highlight: false,
    features: [
      { text: "Acceso al buscador", included: true },
      { text: "Filtros básicos (profesión, provincia)", included: true },
      { text: "Desbloquear 3 perfiles", included: true },
      { text: "Favoritos", included: true },
      { text: "Histórico de perfiles", included: true },
      { text: "Filtros avanzados", included: false },
      { text: "Soporte prioritario", included: false },
    ],
    cta: "Elegir Básico",
    ctaHref: "/register?role=company&plan=basic",
  },
  {
    name: "Pro",
    price: "49€",
    priceNote: "/ mes",
    profiles: "10 perfiles",
    highlight: true,
    badge: "Más popular",
    features: [
      { text: "Acceso al buscador", included: true },
      { text: "Filtros básicos (profesión, provincia)", included: true },
      { text: "Desbloquear 10 perfiles", included: true },
      { text: "Favoritos", included: true },
      { text: "Histórico de perfiles", included: true },
      { text: "Filtros avanzados", included: true },
      { text: "Soporte prioritario", included: false },
    ],
    cta: "Elegir Pro",
    ctaHref: "/register?role=company&plan=pro",
  },
  {
    name: "Business",
    price: "99€",
    priceNote: "/ mes",
    profiles: "25 perfiles",
    highlight: false,
    features: [
      { text: "Acceso al buscador", included: true },
      { text: "Filtros básicos (profesión, provincia)", included: true },
      { text: "Desbloquear 25 perfiles", included: true },
      { text: "Favoritos", included: true },
      { text: "Histórico de perfiles", included: true },
      { text: "Filtros avanzados", included: true },
      { text: "Soporte prioritario", included: true },
    ],
    cta: "Elegir Business",
    ctaHref: "/register?role=company&plan=business",
  },
];

function CheckIcon({ included }: { included: boolean }) {
  if (included) {
    return (
      <svg className="w-4 h-4 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-white/20 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function TierCard({ tier, index }: { tier: Tier; index: number }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className={`relative flex flex-col rounded-3xl p-6 lg:p-8 border transition-all duration-300 hover:-translate-y-1 ${
        tier.highlight
          ? "bg-gradient-to-b from-violet-600/20 to-indigo-600/10 border-violet-500/40 shadow-xl shadow-violet-500/20"
          : "bg-white/3 border-white/8 hover:border-white/15"
      }`}
    >
      {/* Popular badge */}
      {tier.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-violet-500/30">
            {tier.badge}
          </span>
        </div>
      )}

      {/* Tier name & price */}
      <div className="mb-6">
        <h3 className={`text-base font-semibold mb-3 ${tier.highlight ? "text-violet-300" : "text-white/60"}`}>
          {tier.name}
        </h3>
        <div className="flex items-end gap-1">
          <span className="text-4xl font-extrabold text-white">{tier.price}</span>
          <span className="text-white/40 text-sm mb-1.5">{tier.priceNote}</span>
        </div>
        <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
          tier.highlight
            ? "bg-violet-500/20 text-violet-300"
            : "bg-white/5 text-white/40"
        }`}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {tier.profiles}
        </div>
      </div>

      {/* Features list */}
      <ul className="flex-1 space-y-3 mb-8">
        {tier.features.map((feature) => (
          <li key={feature.text} className="flex items-center gap-3">
            <CheckIcon included={feature.included} />
            <span className={`text-sm ${feature.included ? "text-white/70" : "text-white/25 line-through decoration-white/15"}`}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={tier.ctaHref}
        className={`w-full py-3 rounded-xl font-semibold text-sm text-center transition-all duration-200 hover:scale-[1.02] ${
          tier.highlight
            ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/30"
            : "bg-white/8 hover:bg-white/12 text-white border border-white/10"
        }`}
      >
        {tier.cta}
      </Link>
    </motion.div>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/15 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-semibold tracking-widest uppercase mb-4">
            Precios
          </span>
          <h2 className="text-3xl sm:text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Sin sorpresas
          </h2>
          <p className="mt-4 text-white/50 text-base sm:text-lg max-w-xl mx-auto px-4 sm:px-0">
            Elige el plan que encaja con el volumen de contratación de tu empresa. Cancela cuando quieras.
          </p>
        </motion.div>

        {/* Professional note */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="flex items-center justify-center gap-3 mb-12 p-4 rounded-2xl bg-violet-500/8 border border-violet-400/20 max-w-lg mx-auto"
        >
          <svg className="w-5 h-5 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-violet-300">
            <strong className="font-semibold">Profesionales:</strong> registro y uso completamente gratuito, siempre.
          </p>
        </motion.div>

        {/* Tier cards grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          {TIERS.map((tier, i) => (
            <TierCard key={tier.name} tier={tier} index={i} />
          ))}
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-white/30 text-sm mt-10"
        >
          Todos los precios incluyen IVA. Pago mensual. Sin permanencia.
        </motion.p>
      </div>
    </section>
  );
}