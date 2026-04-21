'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import type { EditProfileFormValues } from './EditProfileForm'
import { UseFormWatch, UseFormSetValue } from 'react-hook-form'

interface SkillsSectionProps {
  watch: UseFormWatch<EditProfileFormValues>
  setValue: UseFormSetValue<EditProfileFormValues>
}

const LEVEL_LABELS: Record<number, string> = {
  1: 'Básico',
  2: 'Elemental',
  3: 'Intermedio',
  4: 'Avanzado',
  5: 'Experto',
}

export function SkillsSection({ watch, setValue }: SkillsSectionProps) {
  const skills = watch('skills') ?? []
  const [newSkill, setNewSkill] = useState('')

  const addSkill = () => {
    const name = newSkill.trim()
    if (!name || skills.some((s) => s.skill_name.toLowerCase() === name.toLowerCase())) return
    setValue('skills', [
      ...skills,
      { skill_name: name, level: 3, order: skills.length },
    ])
    setNewSkill('')
  }

  const removeSkill = (index: number) => {
    setValue(
      'skills',
      skills.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i }))
    )
  }

  const updateLevel = (index: number, level: number) => {
    const updated = [...skills]
    updated[index] = { ...updated[index], level: level as 1 | 2 | 3 | 4 | 5 }
    setValue('skills', updated)
  }

  return (
    <div className="space-y-4">
      {/* Add skill input */}
      <div className="flex gap-2">
        <input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
          className="flex-1 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-200 focus:ring-2"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            '--tw-ring-color': 'rgba(99,102,241,0.5)',
          } as React.CSSProperties}
          placeholder="Añadir habilidad (ej: Cocina italiana)"
        />
        <button
          type="button"
          onClick={addSkill}
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:opacity-80"
          style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)' }}
        >
          <Plus className="w-5 h-5 text-indigo-400" />
        </button>
      </div>

      {/* Skills list */}
      {skills.length === 0 ? (
        <p className="text-sm text-center py-6" style={{ color: 'rgba(255,255,255,0.25)' }}>
          No has añadido habilidades todavía
        </p>
      ) : (
        <div className="space-y-2">
          {skills.map((skill, i) => (
            <div
              key={i}
              className="rounded-xl p-3 flex items-center gap-3"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {/* Skill name */}
              <span className="flex-1 text-sm font-medium text-white truncate">
                {skill.skill_name}
              </span>

              {/* Level selector */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => updateLevel(i, lvl)}
                    title={LEVEL_LABELS[lvl]}
                    className="w-5 h-5 rounded-full transition-all duration-150 hover:scale-110"
                    style={{
                      background: lvl <= skill.level
                        ? 'rgba(99,102,241,0.8)'
                        : 'rgba(255,255,255,0.1)',
                    }}
                  />
                ))}
                <span
                  className="text-xs ml-1 min-w-[56px]"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  {LEVEL_LABELS[skill.level]}
                </span>
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeSkill(i)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/15 flex-shrink-0"
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