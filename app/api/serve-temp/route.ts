import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')

    if (!filePath) {
      return NextResponse.json({ error: 'No path provided' }, { status: 400 })
    }

    // Security check - sirf tmp folder ki files serve karo
    if (!filePath.includes('tmp') && !filePath.includes('uploads')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const fileBuffer = await readFile(filePath)

    // File extension se content type detect karo
    const ext = filePath.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg'
    else if (ext === 'png') contentType = 'image/png'
    else if (ext === 'webp') contentType = 'image/webp'
    else if (ext === 'gif') contentType = 'image/gif'

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to serve file' },
      { status: 500 }
    )
  }
}