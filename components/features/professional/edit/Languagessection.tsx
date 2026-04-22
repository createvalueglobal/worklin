'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import type { EditProfileFormValues } from './EditProfileForm'
import { UseFormWatch, UseFormSetValue } from 'react-hook-form'

interface LanguagesSectionProps {
  watch: UseFormWatch<EditProfileFormValues>
  setValue: UseFormSetValue<EditProfileFormValues>
}

const LANGUAGE_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native'] as const
const LEVEL_LABELS: Record<string, string> = {
  A1: 'A1 – Básico',
  A2: 'A2 – Elemental',
  B1: 'B1 – Intermedio',
  B2: 'B2 – Intermedio alto',
  C1: 'C1 – Avanzado',
  C2: 'C2 – Maestría',
  native: 'Nativo',
}

const COMMON_LANGUAGES = [
  'Español', 'Inglés', 'Francés', 'Alemán', 'Italiano',
  'Portugués', 'Chino', 'Árabe', 'Ruso', 'Japonés',
]

export function LanguagesSection({ watch, setValue }: LanguagesSectionProps) {
  const languages = watch('languages') ?? []
  const [newLang, setNewLang] = useState('')
  const [newLevel, setNewLevel] = useState<typeof LANGUAGE_LEVELS[number]>('B1')

  const addLanguage = (lang?: string) => {
    const name = (lang ?? newLang).trim()
    if (!name || languages.some((l) => l.language.toLowerCase() === name.toLowerCase())) return
    setValue('languages', [...languages, { language: name, level: newLevel }])
    setNewLang('')
  }

  const removeLanguage = (index: number) => {
    setValue('languages', languages.filter((_, i) => i !== index))
  }

  const updateLevel = (index: number, level: string) => {
    const updated = [...languages]
    updated[index] = { ...updated[index], level: level as typeof LANGUAGE_LEVELS[number] }
    setValue('languages', updated)
  }

  const addedNames = languages.map((l) => l.language.toLowerCase())

  return (
    <div className="space-y-4">
      {/* Add language */}
      <div className="flex gap-2">
        <input
          value={newLang}
          onChange={(e) => setNewLang(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
          className="flex-1 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            '--tw-ring-color': 'rgba(99,102,241,0.5)',
          } as React.CSSProperties}
          placeholder="Idioma (ej: Inglés)"
        />
        <select
          value={newLevel}
          onChange={(e) => setNewLevel(e.target.value as typeof LANGUAGE_LEVELS[number])}
          className="rounded-xl px-3 py-3 text-sm text-white outline-none"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {LANGUAGE_LEVELS.map((l) => (
            <option key={l} value={l} style={{ background: '#1a1a2e' }}>
              {l === 'native' ? 'Nativo' : l}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => addLanguage()}
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:opacity-80"
          style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)' }}
        >
          <Plus className="w-5 h-5 text-indigo-400" />
        </button>
      </div>

      {/* Quick add common languages */}
      <div className="flex flex-wrap gap-1.5">
        {COMMON_LANGUAGES.filter((l) => !addedNames.includes(l.toLowerCase())).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => addLanguage(lang)}
            className="px-2.5 py-1 rounded-lg text-xs transition-all duration-200 hover:bg-white/10"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            + {lang}
          </button>
        ))}
      </div>

      {/* Languages list */}
      {languages.length === 0 ? (
        <p className="text-sm text-center py-6" style={{ color: 'rgba(255,255,255,0.25)' }}>
          No has añadido idiomas todavía
        </p>
      ) : (
        <div className="space-y-2">
          {languages.map((lang, i) => (
            <div
              key={i}
              className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <span className="flex-1 text-sm font-medium text-white">{lang.language}</span>
              <select
                value={lang.level}
                onChange={(e) => updateLevel(i, e.target.value)}
                className="text-xs rounded-lg px-2 py-1.5 outline-none"
                style={{
                  background: 'rgba(99,102,241,0.15)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  color: '#818cf8',
                }}
              >
                {LANGUAGE_LEVELS.map((l) => (
                  <option key={l} value={l} style={{ background: '#1a1a2e' }}>
                    {LEVEL_LABELS[l]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeLanguage(i)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/15 flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}