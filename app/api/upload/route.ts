import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Tipos de archivo permitidos y sus buckets destino
const ALLOWED_TYPES: Record<string, { bucket: string; maxSizeMB: number }> = {
  'image/jpeg': { bucket: 'avatars', maxSizeMB: 5 },
  'image/png': { bucket: 'avatars', maxSizeMB: 5 },
  'image/webp': { bucket: 'avatars', maxSizeMB: 5 },
  'application/pdf': { bucket: 'documents', maxSizeMB: 10 },
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) =>
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            ),
        },
      }
    )

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const fileType = formData.get('type') as string | null // 'photo' | 'logo' | 'cv'

    if (!file || !fileType) {
      return NextResponse.json({ error: 'Archivo y tipo son obligatorios' }, { status: 400 })
    }

    // Validar tipo MIME
    const config = ALLOWED_TYPES[file.type]
    if (!config) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo JPG, PNG, WEBP o PDF.' },
        { status: 400 }
      )
    }

    // Validar tamaño
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > config.maxSizeMB) {
      return NextResponse.json(
        { error: `El archivo supera el límite de ${config.maxSizeMB}MB` },
        { status: 400 }
      )
    }

    // Generar path único: userId/tipo-timestamp.ext
    const ext = file.name.split('.').pop()
    const fileName = `${fileType}-${Date.now()}.${ext}`
    const filePath = `${user.id}/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { data, error: uploadError } = await supabase.storage
      .from(config.bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('[api/upload] Storage error:', uploadError.message)
      return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 500 })
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(config.bucket)
      .getPublicUrl(data.path)

    return NextResponse.json({ success: true, url: publicUrl, path: data.path })
  } catch (err: any) {
    console.error('[api/upload] Error:', err.message)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}