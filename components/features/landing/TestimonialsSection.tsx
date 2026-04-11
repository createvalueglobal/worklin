"use client";

import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    quote: "En menos de una semana teníamos cubierta la plaza de camarero. Los perfiles son reales y la plataforma es rapidísima de usar.",
    author: "María G.",
    role: "Responsable RRHH",
    company: "Restaurante El Mirador",
    avatar: "MG",
    rating: 5,
  },
  {
    quote: "Me registré como electricista y a los tres días ya tenía contactos de empresas interesadas. Sin pagar nada.",
    author: "Carlos R.",
    role: "Electricista autónomo",
    company: "Freelance",
    avatar: "CR",
    rating: 5,
  },
  {
    quote: "Superamos las expectativas de contratación del trimestre. El plan Pro nos da el volumen perfecto para nuestro ritmo.",
    author: "Ana P.",
    role: "Directora de Operaciones",
    company: "Grupo Hoteles Mediterráneo",
    avatar: "AP",
    rating: 5,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-violet-400" : "text-white/15"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fuchsia-950/8 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-semibold tracking-widest uppercase mb-4">
            Testimonios
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="mt-4 text-white/50 text-lg max-w-xl mx-auto">
            Historias reales de conexiones que funcionan.
          </p>
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-5 p-6 rounded-3xl bg-white/3 border border-white/8 hover:border-white/15 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Quote icon */}
              <svg className="w-8 h-8 text-violet-500/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>

              {/* Quote text */}
              <p className="text-white/65 text-sm leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Stars */}
              <StarRating rating={t.rating} />

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-white/8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.author}</p>
                  <p className="text-white/40 text-xs">{t.role} · {t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}