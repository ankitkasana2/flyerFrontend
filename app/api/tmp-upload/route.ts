import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { tmpdir } from 'os';



// export const config = {
//     api: {
//         bodyParser: {
//             sizeLimit: '50mb',  // Apni zaroorat ke hisaab se badha sakte ho
//         },
//     },
// }

// Force Node.js runtime for filesystem access
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fieldName = formData.get('field') as string;
    const uploadId = formData.get('uploadId') as string || 'default';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use OS temp directory for better production compatibility.
    const tempRoot = join(tmpdir(), 'flyer-uploads');
    const tempDir = join(tempRoot, uploadId);
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Generate filename (keep it simple inside the folder)
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const filename = `${fieldName}-${safeName}`;
    const filepath = join(tempDir, filename);

    // Write file to temp storage
    await writeFile(filepath, buffer);

    // Build absolute URL from current request host to avoid localhost links in production.
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const dynamicBaseUrl =
      host && !host.includes('0.0.0.0')
        ? `${protocol}://${host}`
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const tempKey = join(uploadId, filename).replace(/\\/g, '/');
    const publicUrl = `${dynamicBaseUrl}/api/serve-temp?key=${encodeURIComponent(tempKey)}`;

    return NextResponse.json({
      success: true,
      filepath: publicUrl,
      key: tempKey,
      filename,
      fieldName,
      uploadId
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
