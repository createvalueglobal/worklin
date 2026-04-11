"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function CtaSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl overflow-hidden border border-violet-500/25 bg-gradient-to-br from-violet-900/40 via-indigo-900/30 to-[#0a0a0f]/60 backdrop-blur-sm p-8 sm:p-12 lg:p-16 text-center"
        >
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-indigo-600/10 pointer-events-none" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/20 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/15 border border-violet-400/30 text-violet-300 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              Disponible ahora en España
            </span>

            {/* Headline */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-2xl leading-tight">
              ¿Listo para conectar con el talento?
            </h2>

            <p className="text-white/55 text-lg max-w-lg leading-relaxed">
              Únete a los profesionales y empresas que ya usan WorkLin para cerrar contrataciones más rápido.
            </p>

            {/* Dual CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
              <Link
                href="/register?role=professional"
                className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
              >
                Regístrate como profesional
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/register?role=company"
                className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/8 hover:bg-white/12 backdrop-blur-sm border border-white/15 hover:border-white/25 text-white font-bold text-base transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
              >
                Publicar como empresa
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-6 mt-4 text-sm text-white/35">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Profesionales siempre gratis
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Sin permanencia
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Login con Google en segundos
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}