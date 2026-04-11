"use client";

import { motion, Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const PROFESSIONAL_STEPS = [
  {
    number: "01",
    title: "Crea tu perfil gratis",
    description: "Regístrate con Google en segundos. Sin formularios eternos, sin coste.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Completa tus habilidades",
    description: "Añade tu experiencia, idiomas, disponibilidad y expectativa salarial.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Activa tu visibilidad",
    description: "Decide cuándo aparecer en búsquedas. Tú controlas quién te ve.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Recibe contactos directos",
    description: "Las empresas interesadas desbloquean tus datos y te contactan.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const COMPANY_STEPS = [
  {
    number: "01",
    title: "Registra tu empresa",
    description: "Crea tu cuenta de empresa en minutos. Empieza gratis.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Busca y filtra talento",
    description: "Explora perfiles por profesión, provincia, disponibilidad y más.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Elige tu plan",
    description: "Activa una suscripción y desbloquea los perfiles que necesitas.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Contacta directamente",
    description: "Sin intermediarios. Tienes el teléfono y email del candidato.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
];

type Step = {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

function StepCard({ step, index, accent }: { step: Step; index: number; accent: "violet" | "indigo" }) {
  const isViolet = accent === "violet";
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className="relative flex gap-4 group"
    >
      {/* Connector line */}
      {index < 3 && (
        <div className={`absolute left-6 top-14 w-0.5 h-[calc(100%+1rem)] ${isViolet ? "bg-violet-500/20" : "bg-indigo-500/20"}`} />
      )}
      {/* Icon circle */}
      <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110 ${
        isViolet
          ? "bg-violet-500/15 border-violet-400/30 text-violet-400 group-hover:bg-violet-500/25"
          : "bg-indigo-500/15 border-indigo-400/30 text-indigo-400 group-hover:bg-indigo-500/25"
      }`}>
        {step.icon}
      </div>
      {/* Content */}
      <div className="flex-1 pb-8">
        <span className={`text-xs font-bold tracking-widest uppercase ${isViolet ? "text-violet-500" : "text-indigo-500"}`}>
          {step.number}
        </span>
        <h3 className="text-white font-semibold text-base mt-1 mb-1.5">{step.title}</h3>
        <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
      </div>
    </motion.div>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-semibold tracking-widest uppercase mb-4">
            Cómo funciona
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Simple para todos
          </h2>
          <p className="mt-4 text-white/50 text-lg max-w-xl mx-auto">
            Dos caminos distintos, un mismo objetivo: conectar talento con oportunidades.
          </p>
        </motion.div>

        {/* Two columns */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Professional column */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            className="rounded-3xl bg-white/3 backdrop-blur-sm border border-white/8 p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-violet-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-violet-400 font-semibold tracking-widest uppercase">Para ti</p>
                <h3 className="text-white font-bold text-lg">Soy profesional</h3>
              </div>
            </div>
            {PROFESSIONAL_STEPS.map((step, i) => (
              <StepCard key={step.number} step={step} index={i} accent="violet" />
            ))}
          </motion.div>

          {/* Company column */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } }}
            className="rounded-3xl bg-white/3 backdrop-blur-sm border border-white/8 p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-indigo-400 font-semibold tracking-widest uppercase">Para ti</p>
                <h3 className="text-white font-bold text-lg">Soy empresa</h3>
              </div>
            </div>
            {COMPANY_STEPS.map((step, i) => (
              <StepCard key={step.number} step={step} index={i} accent="indigo" />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}